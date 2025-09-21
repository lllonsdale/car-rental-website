# PowerShell скрипт для обновления путей к изображениям в JSON

# Читаем JSON файл
$jsonContent = Get-Content "data/cars.json" -Raw -Encoding UTF8 | ConvertFrom-Json

Write-Host "Обрабатываем $($jsonContent.Count) автомобилей..."

# Маппинг ID к путям изображений
$carMappings = @{
    "bmw-x7-2024" = "images/bmw/x7_2024"
    "bmw-3-series-2023" = "images/bmw/3_series_2023"
    "bmw-x5-2022" = "images/bmw/x5_2022"
    "bmw-i4-2024" = "images/bmw/i4_2024"
    "bmw-m5-2024" = "images/bmw/m5_2024"
    "bmw-x5-2023" = "images/bmw/x5_2023"
    "mercedes-s-class-2023" = "images/mercedes-benz/s_class_2023"
    "mercedes-amg-gt-2023" = "images/mercedes-benz/amg_gt_2023"
    "mercedes-gle-2024" = "images/mercedes-benz/gle_2024"
    "audi-q8-2024" = "images/audi/q8_2024"
    "audi-a8-2024" = "images/audi/a8_2024"
    "audi-a4-2023" = "images/audi/a4_2023"
    "audi-e-tron-2024" = "images/audi/e_tron_2024"
    "audi-rs6-2024" = "images/audi/rs6_avant_2024"
    "porsche-cayenne-2024" = "images/porsche/cayenne_2024"
    "lexus-es-2024" = "images/lexus/es_2024"
    "lexus-rx-2023" = "images/lexus/rx_2023"
    "toyota-camry-2023" = "images/toyota/camry_2023"
    "toyota-rav4-2024" = "images/toyota/rav4_2024"
    "hyundai-sonata-2023" = "images/hyundai/sonata_2023"
    "hyundai-tucson-2024" = "images/hyundai/tucson_2024"
    "kia-k5-2023" = "images/kia/k5_2023"
    "kia-sportage-2024" = "images/kia/sportage_2024"
    "volvo-xc90-2023" = "images/volvo/xc90_2023"
    "volvo-s90-2024" = "images/volvo/s90_2024"
    "jaguar-f-pace-2023" = "images/jaguar/f_pace_2023"
    "land-rover-discovery-2024" = "images/land-rover/discovery_sport_2024"
    "mazda-cx5-2023" = "images/mazda/cx5_2023"
}

$updatedCount = 0

# Обновляем каждый автомобиль
foreach ($car in $jsonContent) {
    $carId = $car.id
    if ($carMappings.ContainsKey($carId)) {
        $basePath = $carMappings[$carId]
        
        # Обновляем главное изображение
        $car.image = "${basePath}_side.jpg"
        
        # Обновляем массив изображений
        $car.images = @(
            "${basePath}_side.jpg",
            "${basePath}_front.jpg",
            "${basePath}_rear.jpg",
            "${basePath}_interior.jpg"
        )
        
        $updatedCount++
        Write-Host "✓ Обновлен: $carId"
    } else {
        Write-Host "✗ Не найден маппинг для: $carId"
    }
}

# Сохраняем обновленный JSON
$jsonContent | ConvertTo-Json -Depth 10 -Compress:$false | Out-File "data/cars.json" -Encoding UTF8

Write-Host "`nОбновление завершено!"
Write-Host "Обновлено автомобилей: $updatedCount"
Write-Host "Всего автомобилей: $($jsonContent.Count)"