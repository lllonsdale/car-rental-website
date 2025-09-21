# Скрипт для скачивания всех изображений автомобилей из базы данных

# Создаем недостающие папки
$brands = @("bmw", "mercedes-benz", "audi", "porsche", "lexus", "toyota", "hyundai", "kia", "volvo", "jaguar", "land-rover", "mazda")
foreach ($brand in $brands) {
    $path = "images/$brand"
    if (!(Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Created directory: $path"
    }
}

# Базовые URL для изображений автомобилей (используем Unsplash для качественных изображений)
$carImages = @{
    # BMW
    "bmw/x7_2024" = @("https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600", "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600")
    "bmw/3_series_2023" = @("https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600", "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600", "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=600")
    "bmw/x5_2022" = @("https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600", "https://images.unsplash.com/photo-1494976688321-89efb59b7dff?w=800&h=600", "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&h=600", "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600")
    "bmw/i4_2024" = @("https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600", "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600")
    "bmw/m5_2024" = @("https://images.unsplash.com/photo-1919438401886-1f234e3f1b96?w=800&h=600", "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&h=600", "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600")
    "bmw/x5_2023" = @("https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=600", "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600", "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600")
    
    # Mercedes-Benz
    "mercedes-benz/s_class_2023" = @("https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600", "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600", "https://images.unsplash.com/photo-1549399005-0a3c3c69e0e8?w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600")
    "mercedes-benz/amg_gt_2023" = @("https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600", "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600", "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600")
    "mercedes-benz/gle_2024" = @("https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600", "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=600", "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600")
    
    # Audi
    "audi/q8_2024" = @("https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600", "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600")
    "audi/a8_2024" = @("https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600", "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&h=600", "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600")
    "audi/a4_2023" = @("https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600", "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600", "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=600")
    "audi/e_tron_2024" = @("https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600", "https://images.unsplash.com/photo-1631295868785-3d5e6adc6b8d?w=800&h=600", "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600")
    "audi/rs6_avant_2024" = @("https://images.unsplash.com/photo-1919438401886-1f234e3f1b96?w=800&h=600", "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&h=600", "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600")
    
    # Porsche
    "porsche/cayenne_2024" = @("https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600", "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600", "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600")
    
    # Lexus  
    "lexus/es_2024" = @("https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600", "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600", "https://images.unsplash.com/photo-1549399005-0a3c3c69e0e8?w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600")
    "lexus/rx_2023" = @("https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=600", "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600", "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600")
    
    # Toyota
    "toyota/camry_2023" = @("https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600", "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600", "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=600")
    "toyota/rav4_2024" = @("https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=600", "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600", "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600")
    
    # Hyundai
    "hyundai/sonata_2023" = @("https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600", "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600", "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=600")
    "hyundai/tucson_2024" = @("https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=600", "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600", "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600")
    
    # KIA
    "kia/k5_2023" = @("https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600", "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600", "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=600")
    "kia/sportage_2024" = @("https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=600", "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600", "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600")
    
    # Volvo
    "volvo/xc90_2023" = @("https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=600", "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600", "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600")
    "volvo/s90_2024" = @("https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600", "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600", "https://images.unsplash.com/photo-1549399005-0a3c3c69e0e8?w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600")
    
    # Jaguar
    "jaguar/f_pace_2023" = @("https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600", "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600", "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600")
    
    # Land Rover
    "land-rover/discovery_sport_2024" = @("https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=600", "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600", "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600")
    
    # Mazda
    "mazda/cx5_2023" = @("https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=600", "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600", "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600")
}

$angles = @("side", "front", "rear", "interior")

Write-Host "Starting download of all car images..."

foreach ($car in $carImages.Keys) {
    Write-Host "Downloading images for $car..."
    
    for ($i = 0; $i -lt $carImages[$car].Count; $i++) {
        $url = $carImages[$car][$i]
        $filename = "${car}_$($angles[$i]).jpg"
        
        try {
            Invoke-WebRequest -Uri $url -OutFile $filename -TimeoutSec 15
            Write-Host "  ✓ Downloaded: $filename"
        } catch {
            Write-Host "  ✗ Failed to download: $filename - $($_.Exception.Message)"
        }
        
        Start-Sleep -Milliseconds 300
    }
}

Write-Host "`nDownload completed!"
Write-Host "Total car models processed: $($carImages.Keys.Count)"