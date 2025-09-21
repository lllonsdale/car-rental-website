# Скрипт для скачивания изображений автомобилей

$cars = @{
    "bmw-x7-2024" = @("https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600", "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600")
    "bmw-3-series-2023" = @("https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600", "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600", "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=600")
    "bmw-x5-2022" = @("https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=600", "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600", "https://images.unsplash.com/photo-1494976688321-89efb59b7dff?w=800&h=600", "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&h=600")
    "bmw-i4-2024" = @("https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600", "https://images.unsplash.com/photo-1631295868785-3d5e6adc6b8d?w=800&h=600", "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600")
    "mercedes-s-class-2023" = @("https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600", "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600", "https://images.unsplash.com/photo-1549399005-0a3c3c69e0e8?w=800&h=600")
    "audi-q8-2024" = @("https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600", "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600")
}

$angles = @("side", "front", "rear", "interior")

foreach ($car in $cars.Keys) {
    $brand = $car.Split('-')[0]
    $model = $car.Replace("$brand-", "")
    
    Write-Host "Downloading images for $car..."
    
    for ($i = 0; $i -lt $cars[$car].Count; $i++) {
        $url = $cars[$car][$i]
        $filename = "images/$brand/${model}_$($angles[$i]).jpg"
        
        try {
            Invoke-WebRequest -Uri $url -OutFile $filename -TimeoutSec 10
            Write-Host "Downloaded: $filename"
        } catch {
            Write-Host "Failed to download: $filename - $($_.Exception.Message)"
        }
        
        Start-Sleep -Milliseconds 500
    }
}

Write-Host "Download completed!"