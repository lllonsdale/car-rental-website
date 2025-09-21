# Script to download placeholder images for all cars

# Define URLs for different car types (using Unsplash for high-quality automotive images)
$carImageUrls = @{
    "side" = @(
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop"
    )
    "front" = @(
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1494976688321-89efb59b7dff?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1631295868785-3d5e6adc6b8d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop"
    )
    "rear" = @(
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1549399005-0a3c3c69e0e8?w=800&h=600&fit=crop"
    )
    "interior" = @(
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=600&fit=crop", 
        "https://images.unsplash.com/photo-1512813498716-90e2d1aeb1d4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop"
    )
}

# Read JSON to get list of all required image paths
$jsonContent = Get-Content "data/cars.json" -Raw -Encoding UTF8 | ConvertFrom-Json

$allImagePaths = @()
foreach ($car in $jsonContent) {
    foreach ($imagePath in $car.images) {
        $allImagePaths += $imagePath
    }
}

Write-Host "Found $($allImagePaths.Count) images to download"

$downloadCount = 0
$urlIndex = @{ "side" = 0; "front" = 0; "rear" = 0; "interior" = 0 }

foreach ($imagePath in $allImagePaths) {
    # Skip if file already exists
    if (Test-Path $imagePath) {
        Write-Host "Skipping existing file: $imagePath"
        continue
    }
    
    # Determine image type from filename
    $imageType = "side"  # default
    if ($imagePath -match "_front\.") { $imageType = "front" }
    elseif ($imagePath -match "_rear\.") { $imageType = "rear" }  
    elseif ($imagePath -match "_interior\.") { $imageType = "interior" }
    
    # Get URL for this type
    $urls = $carImageUrls[$imageType]
    $url = $urls[$urlIndex[$imageType] % $urls.Count]
    $urlIndex[$imageType]++
    
    try {
        Write-Host "Downloading: $imagePath"
        Invoke-WebRequest -Uri $url -OutFile $imagePath -TimeoutSec 10
        $downloadCount++
    } catch {
        Write-Host "Failed to download: $imagePath - $($_.Exception.Message)"
    }
    
    # Small delay to avoid rate limiting
    Start-Sleep -Milliseconds 200
}

Write-Host "`nDownload completed!"
Write-Host "Successfully downloaded: $downloadCount images"