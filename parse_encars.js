const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Заголовки для имитации браузера
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
};

// Функция для HTTP запроса
function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: headers,
            timeout: 10000
        };

        https.get(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Функция для скачивания изображения
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        
        https.get(url, { headers }, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve(filepath);
            });

            file.on('error', (err) => {
                fs.unlink(filepath, () => {}); // Удаляем файл при ошибке
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Создание директории если не существует
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Парсинг главной страницы для получения списка брендов и моделей
async function parseMainPage() {
    console.log('🔍 Парсинг главной страницы encars.com.ru...');
    
    try {
        const html = await fetchPage('https://encars.com.ru/');
        
        // Извлекаем ссылки на модели автомобилей
        const modelLinks = [];
        const regex = /href="https:\/\/encars\.com\.ru\/([^"]+\/[^"]+)">([^<]+)</g;
        let match;
        
        while ((match = regex.exec(html)) !== null) {
            const [, path, name] = match;
            if (path.includes('/') && !path.includes('?') && name.trim()) {
                modelLinks.push({
                    url: `https://encars.com.ru/${path}`,
                    name: name.trim(),
                    path: path
                });
            }
        }
        
        // Фильтруем только нужные бренды
        const targetBrands = ['bmw', 'mercedes', 'audi', 'porsche', 'lexus', 'toyota', 'hyundai', 'kia', 'volvo', 'jaguar', 'land-rover', 'mazda'];
        const filteredLinks = modelLinks.filter(link => 
            targetBrands.some(brand => link.path.toLowerCase().includes(brand))
        );
        
        console.log(`📋 Найдено ${filteredLinks.length} моделей автомобилей`);
        return filteredLinks.slice(0, 50); // Ограничиваем для начала
        
    } catch (error) {
        console.error('❌ Ошибка парсинга главной страницы:', error.message);
        return [];
    }
}

// Парсинг страницы конкретной модели для получения изображений
async function parseModelPage(modelUrl, modelName) {
    try {
        console.log(`🔍 Парсинг страницы: ${modelName}`);
        
        const html = await fetchPage(modelUrl);
        const images = [];
        
        // Ищем изображения автомобилей
        const imageRegex = /src="([^"]*(?:jpg|jpeg|png|webp)[^"]*)"/gi;
        let match;
        
        while ((match = imageRegex.exec(html)) !== null) {
            const imageUrl = match[1];
            
            // Пропускаем логотипы, иконки и прочие мелкие изображения
            if (imageUrl.includes('logo') || imageUrl.includes('icon') || 
                imageUrl.includes('flag') || imageUrl.includes('avatar') ||
                imageUrl.width < 200 || imageUrl.height < 200) {
                continue;
            }
            
            // Преобразуем относительные URL в абсолютные
            let fullImageUrl = imageUrl;
            if (imageUrl.startsWith('//')) {
                fullImageUrl = 'https:' + imageUrl;
            } else if (imageUrl.startsWith('/')) {
                fullImageUrl = 'https://encars.com.ru' + imageUrl;
            }
            
            if (fullImageUrl.startsWith('http')) {
                images.push(fullImageUrl);
            }
        }
        
        // Удаляем дублирующие изображения и оставляем первые 4
        const uniqueImages = [...new Set(images)].slice(0, 4);
        
        return {
            name: modelName,
            url: modelUrl,
            images: uniqueImages
        };
        
    } catch (error) {
        console.error(`❌ Ошибка парсинга ${modelName}:`, error.message);
        return { name: modelName, url: modelUrl, images: [] };
    }
}

// Основная функция для парсинга и загрузки
async function main() {
    console.log('🚀 Запуск парсера encars.com.ru...\n');
    
    // Читаем текущую базу данных
    let currentCars = [];
    try {
        const carsData = fs.readFileSync('data/cars.json', 'utf8');
        currentCars = JSON.parse(carsData);
        console.log(`📊 Текущая база содержит ${currentCars.length} автомобилей\n`);
    } catch (error) {
        console.log('📊 Файл базы данных не найден, создаем новый\n');
    }
    
    // Получаем список моделей с сайта
    const models = await parseMainPage();
    
    if (models.length === 0) {
        console.log('❌ Не удалось получить список моделей');
        return;
    }
    
    console.log('\n📋 Найденные модели:');
    models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
    });
    
    // Парсим каждую модель для получения изображений
    const results = [];
    for (let i = 0; i < Math.min(models.length, 10); i++) { // Ограничиваем для тестирования
        const model = models[i];
        const result = await parseModelPage(model.url, model.name);
        results.push(result);
        
        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Выводим результаты
    console.log('\n📸 Результаты парсинга:');
    results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}: ${result.images.length} изображений`);
        result.images.forEach((img, imgIndex) => {
            console.log(`   ${imgIndex + 1}. ${img}`);
        });
    });
    
    // Сохраняем результаты в файл
    const outputData = {
        timestamp: new Date().toISOString(),
        totalModels: results.length,
        models: results
    };
    
    fs.writeFileSync('encars_parsed_data.json', JSON.stringify(outputData, null, 2), 'utf8');
    console.log('\n💾 Результаты сохранены в encars_parsed_data.json');
}

// Запускаем парсер
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { parseMainPage, parseModelPage, downloadImage };