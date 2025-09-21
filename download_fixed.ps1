# Скрипт для скачивания всех изображений автомобилей

# Создаем недостающие папки
$brands = @("bmw", "mercedes-benz", "audi", "porsche", "lexus", "toyota", "hyundai", "kia", "volvo", "jaguar", "land-rover", "mazda")
foreach ($brand in $brands) {
    $path = "images/$brand"
    if (!(Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Created directory: $path"
    }
}

# Скачиваем изображения для каждой модели
$cars = @{
    "bmw/x7_2024" = @("https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600", "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600")
    "bmw/3_series_2023" = @("https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600", "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600", "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=600")
    "bmw/x5_2022" = @("https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600", "https://images.unsplash.com/photo-1494976688321-89efb59b7dff?w=800&h=600", "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&h=600", "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600")
}

$angles = @("side", "front", "rear", "interior")

Write-Host "Starting download..."

foreach ($car in $cars.Keys) {
    Write-Host "Downloading images for $car..."
    
    for ($i = 0; $i -lt $cars[$car].Count; $i++) {
        $url = $cars[$car][$i]
        $filename = "${car}_$($angles[$i]).jpg"
        
        try {
            Invoke-WebRequest -Uri $url -OutFile $filename -TimeoutSec 15
            Write-Host "Downloaded: $filename"
        } catch {
            Write-Host "Failed: $filename"
        }
        
        Start-Sleep -Milliseconds 500
    }
}

Write-Host "Download completed!"