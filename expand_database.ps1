# Скрипт для расширения базы данных автомобилей
# Добавляем модели из каталога encars.com.ru

# Загружаем существующую базу данных
$existingCars = Get-Content "data/cars.json" -Encoding UTF8 | ConvertFrom-Json
$allCars = [System.Collections.ArrayList]::new($existingCars)

Write-Host "Текущее количество автомобилей: $($allCars.Count)"

# Функция для генерации ID
function New-CarId($brand, $model, $year) {
    return "$($brand.ToLower() -replace '\s+','-')-$($model.ToLower() -replace '\s+','-')-$year"
}

# Функция для генерации цены на основе бренда и класса
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
    
    $basePrice = $basePrices[$brand] ?? 3000000
    
    # Увеличиваем цену для премиум моделей
    if ($model -match 'AMG|M\d|RS|S-Class|A8|7 Series|X7|GLS') {
        $basePrice = $basePrice * 1.8
    }
    elseif ($model -match 'Sport|xDrive|quattro|AWD') {
        $basePrice = $basePrice * 1.3
    }
    
    return [int]$basePrice
}

# Список недостающих автомобилей из encars.com.ru
$newCars = @(
    # BMW дополнительные модели
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
    @{ brand='BMW'; model='i7'; year='2024'; bodyType='седан'; fuel='электро'; engineVolume=0; power=544 },
    
    # Mercedes-Benz дополнительные модели
    @{ brand='Mercedes-Benz'; model='A-Class'; year='2023'; bodyType='хэтчбек'; fuel='бензин'; engineVolume=1.3; power=163 },
    @{ brand='Mercedes-Benz'; model='C-Class'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=2.0; power=204 },
    @{ brand='Mercedes-Benz'; model='E-Class'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=2.0; power=245 },
    @{ brand='Mercedes-Benz'; model='CLA'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=2.0; power=190 },
    @{ brand='Mercedes-Benz'; model='CLS'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=3.0; power=367 },
    @{ brand='Mercedes-Benz'; model='GLA'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=190 },
    @{ brand='Mercedes-Benz'; model='GLB'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=190 },
    @{ brand='Mercedes-Benz'; model='GLC'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=258 },
    @{ brand='Mercedes-Benz'; model='GLS'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=3.0; power=367 },
    @{ brand='Mercedes-Benz'; model='G-Class'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=4.0; power=422 },
    @{ brand='Mercedes-Benz'; model='EQS'; year='2024'; bodyType='седан'; fuel='электро'; engineVolume=0; power=516 },
    
    # Audi дополнительные модели
    @{ brand='Audi'; model='A3'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=2.0; power=150 },
    @{ brand='Audi'; model='A4'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=2.0; power=190 },
    @{ brand='Audi'; model='A5'; year='2024'; bodyType='купе'; fuel='бензин'; engineVolume=2.0; power=245 },
    @{ brand='Audi'; model='A6'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=2.0; power=245 },
    @{ brand='Audi'; model='A7'; year='2024'; bodyType='лифтбек'; fuel='бензин'; engineVolume=3.0; power=340 },
    @{ brand='Audi'; model='Q2'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=1.5; power=150 },
    @{ brand='Audi'; model='Q3'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=190 },
    @{ brand='Audi'; model='Q5'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=245 },
    @{ brand='Audi'; model='Q7'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=3.0; power=340 },
    @{ brand='Audi'; model='e-tron GT'; year='2024'; bodyType='седан'; fuel='электро'; engineVolume=0; power=476 },
    
    # Genesis (премиум бренд Hyundai)
    @{ brand='Genesis'; model='G70'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=2.5; power=300 },
    @{ brand='Genesis'; model='G80'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=2.5; power=300 },
    @{ brand='Genesis'; model='G90'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=3.5; power=375 },
    @{ brand='Genesis'; model='GV70'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.5; power=300 },
    @{ brand='Genesis'; model='GV80'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=3.5; power=375 },
    
    # Lexus дополнительные модели  
    @{ brand='Lexus'; model='IS'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=3.5; power=311 },
    @{ brand='Lexus'; model='GS'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=3.5; power=311 },
    @{ brand='Lexus'; model='LS'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=3.5; power=416 },
    @{ brand='Lexus'; model='NX'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.5; power=203 },
    @{ brand='Lexus'; model='GX'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=4.6; power=301 },
    @{ brand='Lexus'; model='LX'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=3.5; power=416 },
    
    # Volvo дополнительные модели
    @{ brand='Volvo'; model='XC40'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=197 },
    @{ brand='Volvo'; model='XC60'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=250 },
    @{ brand='Volvo'; model='V60'; year='2024'; bodyType='универсал'; fuel='бензин'; engineVolume=2.0; power=250 },
    @{ brand='Volvo'; model='V90'; year='2024'; bodyType='универсал'; fuel='бензин'; engineVolume=2.0; power=250 },
    
    # Дополнительные Porsche
    @{ brand='Porsche'; model='911'; year='2024'; bodyType='купе'; fuel='бензин'; engineVolume=3.0; power=385 },
    @{ brand='Porsche'; model='Panamera'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=4.0; power=460 },
    @{ brand='Porsche'; model='Macan'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.9; power=375 },
    
    # Jaguar дополнительные модели
    @{ brand='Jaguar'; model='XE'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=2.0; power=250 },
    @{ brand='Jaguar'; model='XF'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=2.0; power=250 },
    @{ brand='Jaguar'; model='XJ'; year='2024'; bodyType='седан'; fuel='бензин'; engineVolume=3.0; power=340 },
    @{ brand='Jaguar'; model='E-Pace'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=200 },
    @{ brand='Jaguar'; model='I-Pace'; year='2024'; bodyType='внедорожник'; fuel='электро'; engineVolume=0; power=400 },
    
    # Land Rover дополнительные модели
    @{ brand='Land Rover'; model='Range Rover Evoque'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=200 },
    @{ brand='Land Rover'; model='Range Rover Velar'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=250 },
    @{ brand='Land Rover'; model='Range Rover Sport'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=3.0; power=400 },
    @{ brand='Land Rover'; model='Range Rover'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=5.0; power=525 },
    @{ brand='Land Rover'; model='Defender'; year='2024'; bodyType='внедорожник'; fuel='бензин'; engineVolume=2.0; power=300 }
)

Write-Host "Добавляем $($newCars.Count) новых автомобилей..."

$counter = 0
foreach ($newCar in $newCars) {
    $carId = New-CarId $newCar.brand $newCar.model $newCar.year
    
    # Проверяем, нет ли уже такого автомобиля
    $exists = $allCars | Where-Object { $_.id -eq $carId }
    if ($exists) {
        Write-Host "Пропускаем $carId - уже существует"
        continue
    }
    
    $price = Get-EstimatedPrice $newCar.brand $newCar.model
    
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
        image = "images/$($newCar.brand.ToLower() -replace '\s+','-')/$($newCar.model.ToLower() -replace '\s+','_')_$($newCar.year)_side.jpg"
        images = @(
            "images/$($newCar.brand.ToLower() -replace '\s+','-')/$($newCar.model.ToLower() -replace '\s+','_')_$($newCar.year)_side.jpg",
            "images/$($newCar.brand.ToLower() -replace '\s+','-')/$($newCar.model.ToLower() -replace '\s+','_')_$($newCar.year)_front.jpg", 
            "images/$($newCar.brand.ToLower() -replace '\s+','-')/$($newCar.model.ToLower() -replace '\s+','_')_$($newCar.year)_rear.jpg",
            "images/$($newCar.brand.ToLower() -replace '\s+','-')/$($newCar.model.ToLower() -replace '\s+','_')_$($newCar.year)_interior.jpg"
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
    Write-Host "✓ Добавлен: $($carObject.brand) $($carObject.model) $($carObject.year) - $($carObject.price.ToString('N0')) руб."
}

# Сохраняем обновленную базу данных
$allCars | ConvertTo-Json -Depth 10 -Compress:$false | Out-File "data/cars.json" -Encoding UTF8

Write-Host "`nОбновление завершено!"
Write-Host "Добавлено новых автомобилей: $counter"  
Write-Host "Общее количество автомобилей: $($allCars.Count)"