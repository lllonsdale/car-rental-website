# Script to download car images for existing cars in database

Write-Host "Downloading car images..."

# Create directories if they don't exist
$brands = @("bmw", "mercedes-benz", "audi", "porsche", "lexus", "toyota", "hyundai", "kia", "volvo", "jaguar", "land-rover", "mazda")

foreach ($brand in $brands) {
    $path = "images/$brand"
    if (!(Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Created directory: $path"
    }
}

# Car images mapping - using high-quality automotive stock photos
$carImages = @{
    # BMW
    "images/bmw/x7_2024" = @(
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    )
    "images/bmw/m5_2024" = @(
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=600&fit=crop"
    )
    "images/bmw/x5_2023" = @(
        "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1494976688321-89efb59b7dff?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600&fit=crop"
    )
    "images/bmw/3_series_2023" = @(
        "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=600&fit=crop"
    )
    "images/bmw/x5_2022" = @(
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1494976688321-89efb59b7dff?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600&fit=crop"
    )
    "images/bmw/i4_2024" = @(
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1631295868785-3d5e6adc6b8d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop"
    )

    # Mercedes-Benz
    "images/mercedes-benz/s_class_2023" = @(
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1549399005-0a3c3c69e0e8?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop"
    )
    "images/mercedes-benz/amg_gt_2023" = @(
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop"
    )
    "images/mercedes-benz/gle_2024" = @(
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop"
    )

    # Audi
    "images/audi/q8_2024" = @(
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop"
    )
    "images/audi/a8_2024" = @(
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop"
    )
    "images/audi/rs6_avant_2024" = @(
        "https://images.unsplash.com/photo-1919438401886-1f234e3f1b96?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop"
    )

    # Porsche
    "images/porsche/cayenne_2024" = @(
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop"
    )
}

$angles = @("side", "front", "rear", "interior")

Write-Host "Starting download of car images..."

$totalDownloaded = 0
foreach ($car in $carImages.Keys) {
    Write-Host "Downloading images for: $car"
    
    for ($i = 0; $i -lt $carImages[$car].Count; $i++) {
        $url = $carImages[$car][$i]
        $filename = "${car}_$($angles[$i]).jpg"
        
        try {
            curl.exe -L -o "$filename" "$url" --silent --fail --max-time 30
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ Downloaded: $($angles[$i])"
                $totalDownloaded++
            } else {
                Write-Host "  ✗ Failed to download: $($angles[$i])"
            }
        } catch {
            Write-Host "  ✗ Error downloading: $($angles[$i]) - $($_.Exception.Message)"
        }
        
        Start-Sleep -Milliseconds 200
    }
    Write-Host ""
}

Write-Host "Download completed!"
Write-Host "Total images downloaded: $totalDownloaded"
Write-Host "Car models processed: $($carImages.Keys.Count)"