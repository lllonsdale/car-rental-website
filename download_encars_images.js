const https = require('https');
const fs = require('fs');
const path = require('path');

// Заголовки для имитации браузера
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
    'Referer': 'https://encars.com.ru/',
    'DNT': '1',
    'Connection': 'keep-alive'
};

// Функция для HTTP запроса
function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, { headers, timeout: 15000 }, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                if (response.statusCode === 200) {
                    resolve(data);
                } else if (response.statusCode === 301 || response.statusCode === 302) {
                    // Следуем редиректу
                    const location = response.headers.location;
                    if (location) {
                        fetchPage(location).then(resolve).catch(reject);
                    } else {
                        reject(new Error(`Redirect without location: ${response.statusCode}`));
                    }
                } else {
                    reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                }
            });
        });

        request.on('error', (err) => {
            reject(err);
        });

        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Функция для скачивания изображения
function downloadImage(url, filepath, retries = 3) {
    return new Promise((resolve, reject) => {
        const attemptDownload = (attempt) => {
            const file = fs.createWriteStream(filepath);
            
            const request = https.get(url, { headers, timeout: 30000 }, (response) => {
                if (response.statusCode === 200) {
                    response.pipe(file);
                    
                    file.on('finish', () => {
                        file.close();
                        resolve(filepath);
                    });
                    
                    file.on('error', (err) => {
                        fs.unlink(filepath, () => {});
                        if (attempt < retries) {
                            console.log(`    🔄 Повтор загрузки (попытка ${attempt + 1}/${retries})`);
                            setTimeout(() => attemptDownload(attempt + 1), 2000);
                        } else {
                            reject(err);
                        }
                    });
                } else if (response.statusCode === 301 || response.statusCode === 302) {
                    const location = response.headers.location;
                    if (location) {
                        downloadImage(location, filepath, retries).then(resolve).catch(reject);
                    } else {
                        reject(new Error(`Redirect without location: ${response.statusCode}`));
                    }
                } else {
                    if (attempt < retries) {
                        console.log(`    🔄 Повтор загрузки (HTTP ${response.statusCode}, попытка ${attempt + 1}/${retries})`);
                        setTimeout(() => attemptDownload(attempt + 1), 2000);
                    } else {
                        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                    }
                }
            });
            
            request.on('error', (err) => {
                fs.unlink(filepath, () => {});
                if (attempt < retries) {
                    console.log(`    🔄 Повтор загрузки (ошибка сети, попытка ${attempt + 1}/${retries})`);
                    setTimeout(() => attemptDownload(attempt + 1), 2000);
                } else {
                    reject(err);
                }
            });
            
            request.on('timeout', () => {
                request.destroy();
                fs.unlink(filepath, () => {});
                if (attempt < retries) {
                    console.log(`    🔄 Повтор загрузки (таймаут, попытка ${attempt + 1}/${retries})`);
                    setTimeout(() => attemptDownload(attempt + 1), 3000);
                } else {
                    reject(new Error('Download timeout'));
                }
            });
        };
        
        attemptDownload(1);
    });
}

// Функция для поиска изображений на странице модели
async function findCarImages(brand, model) {
    const searchTerms = [
        `${brand} ${model}`,
        `${brand.toLowerCase()} ${model.toLowerCase()}`,
        `${brand.replace(/\s+/g, '-')} ${model.replace(/\s+/g, '-')}`,
        model.replace(/\s+/g, '-')
    ];
    
    const imageUrls = [];
    
    for (const searchTerm of searchTerms) {
        try {
            // Формируем URL для поиска
            const searchUrl = `https://encars.com.ru/${brand.toLowerCase().replace(/\s+/g, '')}/${searchTerm.toLowerCase().replace(/\s+/g, '-')}`;
            
            console.log(`  🔍 Поиск на: ${searchUrl}`);
            
            const html = await fetchPage(searchUrl);
            
            // Ищем изображения в HTML
            const imageRegex = /<img[^>]*src=["\']([^"']*)["\'][^>]*>/gi;
            let match;
            
            while ((match = imageRegex.exec(html)) !== null && imageUrls.length < 8) {
                let imageUrl = match[1];
                
                // Пропускаем ненужные изображения
                if (imageUrl.includes('logo') || imageUrl.includes('icon') || 
                    imageUrl.includes('flag') || imageUrl.includes('sprite') ||
                    imageUrl.includes('thumb') || imageUrl.includes('avatar') ||
                    imageUrl.includes('banner') || imageUrl.includes('ad') ||
                    imageUrl.endsWith('.svg') || imageUrl.includes('data:')) {
                    continue;
                }
                
                // Преобразуем относительные URL в абсолютные
                if (imageUrl.startsWith('//')) {
                    imageUrl = 'https:' + imageUrl;
                } else if (imageUrl.startsWith('/')) {
                    imageUrl = 'https://encars.com.ru' + imageUrl;
                } else if (!imageUrl.startsWith('http')) {
                    imageUrl = 'https://encars.com.ru/' + imageUrl;
                }
                
                // Проверяем что это изображение автомобиля
                if (imageUrl.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i) && 
                    !imageUrls.includes(imageUrl)) {
                    imageUrls.push(imageUrl);
                }
            }
            
            if (imageUrls.length > 0) {
                console.log(`  ✅ Найдено ${imageUrls.length} изображений`);
                break;
            }
            
        } catch (error) {
            console.log(`  ⚠️  Ошибка поиска: ${error.message}`);
            continue;
        }
        
        // Задержка между поисками
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return imageUrls.slice(0, 4); // Возвращаем максимум 4 изображения
}

// Создание placeholder изображения если не удалось скачать
function createPlaceholder(filepath, brand, model) {
    // Создаем простой SVG placeholder
    const svgContent = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1e1e1e"/>
        <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#d4af37" text-anchor="middle">
            ${brand} ${model}
        </text>
    </svg>`;
    
    const pngPath = filepath.replace('.jpg', '_placeholder.png');
    // Для простоты, просто создаем текстовый файл
    fs.writeFileSync(pngPath, svgContent);
    return pngPath;
}

// Основная функция
async function main() {
    console.log('🚀 Скачивание изображений автомобилей с encars.com.ru...\n');
    
    // Читаем базу данных
    let cars = [];
    try {
        const data = fs.readFileSync('data/cars.json', 'utf8');
        cars = JSON.parse(data);
        console.log(`📊 Найдено ${cars.length} автомобилей в базе данных\n`);
    } catch (error) {
        console.error('❌ Ошибка чтения базы данных:', error.message);
        return;
    }
    
    if (cars.length === 0) {
        console.log('❌ База данных пуста');
        return;
    }
    
    // Создаем папки для изображений
    const brands = [...new Set(cars.map(car => car.brand.toLowerCase().replace(/\s+/g, '-')))];
    brands.forEach(brand => {
        const brandDir = `images/${brand}`;
        if (!fs.existsSync(brandDir)) {
            fs.mkdirSync(brandDir, { recursive: true });
        }
    });
    
    let totalDownloaded = 0;
    let successfulCars = 0;
    
    // Обрабатываем по 10 автомобилей для тестирования
    const carsToProcess = cars.slice(0, 10);
    
    for (let i = 0; i < carsToProcess.length; i++) {
        const car = carsToProcess[i];
        console.log(`\n📸 [${i + 1}/${carsToProcess.length}] ${car.brand} ${car.model} ${car.year}`);
        
        try {
            // Ищем изображения для этой модели
            const imageUrls = await findCarImages(car.brand, car.model);
            
            if (imageUrls.length === 0) {
                console.log('  ❌ Изображения не найдены');
                continue;
            }
            
            const angles = ['side', 'front', 'rear', 'interior'];
            let downloadedImages = 0;
            
            // Скачиваем изображения
            for (let j = 0; j < Math.min(imageUrls.length, 4); j++) {
                const imageUrl = imageUrls[j];
                const angle = angles[j] || `view${j + 1}`;
                const brandFolder = car.brand.toLowerCase().replace(/\s+/g, '-');
                const modelName = car.model.toLowerCase().replace(/\s+/g, '_');
                const filename = `${modelName}_${car.year}_${angle}.jpg`;
                const filepath = path.join('images', brandFolder, filename);
                
                console.log(`  📥 Скачивание: ${angle} (${imageUrl.substring(0, 50)}...)`);
                
                try {
                    await downloadImage(imageUrl, filepath);
                    console.log(`  ✅ Сохранено: ${filename}`);
                    downloadedImages++;
                    totalDownloaded++;
                } catch (error) {
                    console.log(`  ❌ Ошибка скачивания ${angle}: ${error.message}`);
                }
                
                // Задержка между скачиваниями
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            
            if (downloadedImages > 0) {
                successfulCars++;
                console.log(`  🎉 Скачано ${downloadedImages} изображений для ${car.brand} ${car.model}`);
            }
            
        } catch (error) {
            console.log(`  ❌ Ошибка обработки ${car.brand} ${car.model}: ${error.message}`);
        }
        
        // Задержка между автомобилями
        if (i < carsToProcess.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    console.log(`\n🎊 Скачивание завершено!`);
    console.log(`📊 Статистика:`);
    console.log(`   • Обработано автомобилей: ${carsToProcess.length}`);
    console.log(`   • Успешно обработано: ${successfulCars}`);
    console.log(`   • Всего скачано изображений: ${totalDownloaded}`);
    console.log(`   • Среднее изображений на автомобиль: ${(totalDownloaded / Math.max(successfulCars, 1)).toFixed(1)}`);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { findCarImages, downloadImage };