# Script to expand car database
# Adding models from encars.com.ru catalog

# Load existing database
$existingCars = Get-Content "data/cars.json" -Encoding UTF8 | ConvertFrom-Json
$allCars = [System.Collections.ArrayList]::new($existingCars)

Write-Host "Current car count: $($allCars.Count)"

# Function to generate ID
function New-CarId($brand, $model, $year) {
    return "$($brand.ToLower() -replace '\s+','-')-$($model.ToLower() -replace '\s+','-')-$year"
}

# Function to generate price based on brand and class
function Get-EstimatedPrice($brand, $model) {
    $basePrices = @{
        'BMW' = 5000000
        'Mercedes-Benz' = 5500000  
        'Audi' = 4800000
        'Porsche' = 8000000
        'Lexus' = 4500000
        'Toyota' = 2500000
        'Hyundai' = 2200000
        'KIA' = 2000000
        'Volvo' = 3500000
        'Jaguar' = 6000000
        'Land Rover' = 5500000
        'Mazda' = 2800000
        'Genesis' = 4000000
        'Cadillac' = 4500000
        'Lincoln' = 4200000
    }
    
    $basePrice = 3000000
    if ($basePrices.ContainsKey($brand)) {
        $basePrice = $basePrices[$brand]
    }
    
    # Increase price for premium models
    if ($model -match 'AMG|M\d|RS|S-Class|A8|7 Series|X7|GLS') {
        $basePrice = $basePrice * 1.8
    }
    elseif ($model -match 'Sport|xDrive|quattro|AWD') {
        $basePrice = $basePrice * 1.3
    }
    
    return [int]$basePrice
}

# List of missing cars from encars.com.ru
$newCars = @(
    # BMW additional models
    @{ brand='BMW'; model='1 Series'; year='2023'; bodyType='хэтчбек'; fuel='бензин'; engineVolume=2.0; power=140 },
    @{ brand='BMW'; model='2 Series'; year='2023'; bodyType='купе'; fuel='бензин'; engineVolume=2.0; power=184 },
    @{ brand='BMW'; model='4 Series'; year='2024'; bodyType='купе'; fuel='бензин'; engineVolume=2.0; power=245 },
    @{ brand='BMW'; model='5 Series'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=2.0; power=245 },
    @{ brand='BMW'; model='7 Series'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=3.0; power=340 },
    @{ brand='BMW'; model='8 Series'; year='2024'; bodyType='купе'; fuel='бензин'; engineVolume=3.0; power=340 },
    @{ brand='BMW'; model='X1'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=192 },
    @{ brand='BMW'; model='X2'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=192 },
    @{ brand='BMW'; model='X3'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=248 },
    @{ brand='BMW'; model='X4'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=248 },
    @{ brand='BMW'; model='X6'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=3.0; power=340 },
    @{ brand='BMW'; model='iX'; year='2024'; bodyType='внедорожник'; fuel='электро'; engineVolume=0; power=523 },
    @{ brand='BMW'; model='i7'; year='2024'; bodyType='седан'; fuel='электро'; engineVolume=0; power=544 }
)

Write-Host "Adding $($newCars.Count) new cars..."

$counter = 0
foreach ($newCar in $newCars) {
    $carId = New-CarId $newCar.brand $newCar.model $newCar.year
    
    # Check if car already exists
    $exists = $allCars | Where-Object { $_.id -eq $carId }
    if ($exists) {
        Write-Host "Skipping $carId - already exists"
        continue
    }
    
    $price = Get-EstimatedPrice $newCar.brand $newCar.model
    
    $brandFolder = $newCar.brand.ToLower() -replace '\s+','-'
    $modelName = $newCar.model.ToLower() -replace '\s+','_'
    
    $carObject = [PSCustomObject]@{
        id = $carId
        brand = $newCar.brand
        model = $newCar.model
        year = $newCar.year
        price = $price
        bodyType = $newCar.bodyType
        fuel = $newCar.fuel
        transmission = "автомат"
        engineVolume = $newCar.engineVolume
        power = $newCar.power
        drive = if ($newCar.bodyType -eq "внедорожник") { "полный" } elseif ($newCar.brand -eq "BMW") { "задний" } else { "передний" }
        image = "images/$brandFolder/${modelName}_$($newCar.year)_side.jpg"
        images = @(
            "images/$brandFolder/${modelName}_$($newCar.year)_side.jpg",
            "images/$brandFolder/${modelName}_$($newCar.year)_front.jpg", 
            "images/$brandFolder/${modelName}_$($newCar.year)_rear.jpg",
            "images/$brandFolder/${modelName}_$($newCar.year)_interior.jpg"
        )
        description = "Премиальный автомобиль $($newCar.brand) $($newCar.model) $($newCar.year) года с отличными характеристиками"
        available = $true
        mileage = Get-Random -Minimum 1000 -Maximum 50000
        color = @("черный", "белый", "серебристый", "синий", "красный", "серый") | Get-Random
        city = @("Москва", "Санкт-Петербург") | Get-Random
        category = if ($price -gt 7000000) { "premium" } else { "business" }
    }
    
    $allCars.Add($carObject) | Out-Null
    $counter++
    Write-Host "Added: $($carObject.brand) $($carObject.model) $($carObject.year) - $($carObject.price.ToString('N0')) rub."
}

# Save updated database
$allCars | ConvertTo-Json -Depth 10 -Compress:$false | Out-File "data/cars.json" -Encoding UTF8

Write-Host "`nUpdate completed!"
Write-Host "Added new cars: $counter"  
Write-Host "Total cars: $($allCars.Count)"