const fs = require('fs');
const https = require('https');
const path = require('path');

// Список моделей из encars.com.ru на основе предоставленного контекста
const encarsModels = {
    'Audi': [
        'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'E-Tron', 'Q2', 'Q3', 'Q4 E-Tron', 
        'Q5', 'Q7', 'Q8', 'R8', 'RS Q8', 'RS3', 'RS5', 'RS7', 'S3', 'S5', 
        'S6', 'S7', 'S8', 'SQ5', 'SQ7', 'SQ8'
    ],
    'BMW': [
        '1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '7 Series', 
        '8 Series', 'Gran Turismo (GT)', 'i3', 'i4', 'i5', 'i7', 'iX', 'iX3', 
        'M2', 'M3', 'M4', 'M5', 'M8', 'X1', 'X2', 'X3', 'X3M', 'X4', 'X4M', 
        'X5', 'X5M', 'X6', 'X6M', 'X7', 'XM', 'Z4'
    ],
    'Mercedes-Benz': [
        'A-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'GLA', 'GLB', 
        'GLC', 'GLE', 'GLS', 'G-Class', 'AMG GT', 'EQS'
    ],
    'Cadillac': [
        'CT4', 'CT5', 'CT5-V', 'Escalade', 'XT4', 'XT5', 'XT6'
    ],
    'Chevrolet': [
        'Camaro', 'Corvette'
    ]
};

// Функция для генерации цены
function generatePrice(brand, model) {
    const basePrices = {
        'BMW': 5000000,
        'Mercedes-Benz': 5500000,
        'Audi': 4800000,
        'Porsche': 8000000,
        'Lexus': 4500000,
        'Cadillac': 4500000,
        'Chevrolet': 3500000
    };
    
    let basePrice = basePrices[brand] || 3000000;
    
    // Увеличиваем цену для премиум моделей
    if (model.includes('AMG') || model.includes('M ') || model.includes('RS') || 
        model.includes('S-Class') || model.includes('7 Series') || model.includes('A8')) {
        basePrice *= 1.8;
    } else if (model.includes('Sport') || model.includes('xDrive') || model.includes('quattro')) {
        basePrice *= 1.3;
    }
    
    // Добавляем случайную вариацию ±20%
    const variation = 0.8 + Math.random() * 0.4;
    return Math.round(basePrice * variation);
}

// Функция для определения типа кузова
function getBodyType(model) {
    if (model.includes('X') || model.includes('Q') || model.includes('GLE') || 
        model.includes('GLC') || model.includes('GLA') || model.includes('Escalade') || 
        model.includes('XT')) {
        return 'внедорожник';
    } else if (model.includes('GT') || model.includes('Z4') || model.includes('Corvette')) {
        return 'купе';
    } else if (model.includes('Avant') || model.includes('Touring')) {
        return 'универсал';
    } else if (model.includes('i') || model.includes('E-Tron') || model.includes('EQS')) {
        return 'седан'; // электрокары чаще седаны
    } else if (model.includes('Coupe') || model.includes('2 Series')) {
        return 'купе';
    }
    return 'седан'; // по умолчанию
}

// Функция для определения типа топлива
function getFuelType(model) {
    if (model.includes('i') || model.includes('E-Tron') || model.includes('EQS')) {
        return 'электро';
    }
    return 'бензин';
}

// Функция для скачивания изображения
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        
        const request = https.get(url, { 
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(filepath);
                });
            } else {
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        });
        
        request.on('error', (err) => {
            reject(err);
        });
        
        file.on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

// Основная функция
async function main() {
    console.log('🚀 Расширение базы данных из каталога encars.com.ru...\n');
    
    // Читаем текущую базу
    let currentCars = [];
    try {
        const data = fs.readFileSync('data/cars.json', 'utf8');
        currentCars = JSON.parse(data);
        console.log(`📊 Текущая база: ${currentCars.length} автомобилей`);
    } catch (error) {
        console.log('📊 Создаем новую базу данных');
    }
    
    // Создаем множество для проверки дубликатов
    const existingModels = new Set();
    currentCars.forEach(car => {
        existingModels.add(`${car.brand}-${car.model}-${car.year}`);
    });
    
    console.log('\n🔍 Модели в каталоге encars.com.ru:');
    Object.entries(encarsModels).forEach(([brand, models]) => {
        console.log(`${brand}: ${models.length} моделей`);
    });
    
    // Добавляем новые модели
    const newCars = [];
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2]; // 2024, 2023, 2022
    
    for (const [brand, models] of Object.entries(encarsModels)) {
        for (const model of models) {
            // Добавляем по одной машине каждой модели для текущего года
            const year = currentYear;
            const carKey = `${brand}-${model}-${year}`;
            
            if (!existingModels.has(carKey)) {
                const carId = `${brand.toLowerCase().replace(/\s+/g, '-')}-${model.toLowerCase().replace(/\s+/g, '-')}-${year}`;
                
                const newCar = {
                    id: carId,
                    brand: brand,
                    model: model,
                    year: year.toString(),
                    price: generatePrice(brand, model),
                    bodyType: getBodyType(model),
                    fuel: getFuelType(model),
                    transmission: 'автомат',
                    engineVolume: model.includes('i') || model.includes('E-Tron') ? 0 : 2.0 + Math.random() * 2.0,
                    power: Math.round(200 + Math.random() * 300),
                    drive: getBodyType(model) === 'внедорожник' ? 'полный' : (brand === 'BMW' ? 'задний' : 'передний'),
                    image: `images/${brand.toLowerCase().replace(/\s+/g, '-')}/${model.toLowerCase().replace(/\s+/g, '_')}_${year}_side.jpg`,
                    images: [
                        `images/${brand.toLowerCase().replace(/\s+/g, '-')}/${model.toLowerCase().replace(/\s+/g, '_')}_${year}_side.jpg`,
                        `images/${brand.toLowerCase().replace(/\s+/g, '-')}/${model.toLowerCase().replace(/\s+/g, '_')}_${year}_front.jpg`,
                        `images/${brand.toLowerCase().replace(/\s+/g, '-')}/${model.toLowerCase().replace(/\s+/g, '_')}_${year}_rear.jpg`,
                        `images/${brand.toLowerCase().replace(/\s+/g, '-')}/${model.toLowerCase().replace(/\s+/g, '_')}_${year}_interior.jpg`
                    ],
                    description: `Премиальный автомобиль ${brand} ${model} ${year} года с отличными характеристиками и современными технологиями`,
                    available: true,
                    mileage: Math.round(1000 + Math.random() * 49000),
                    color: ['черный', 'белый', 'серебристый', 'синий', 'красный', 'серый'][Math.floor(Math.random() * 6)],
                    city: ['Москва', 'Санкт-Петербург'][Math.floor(Math.random() * 2)],
                    category: newCar => newCar.price > 7000000 ? 'premium' : 'business'
                };
                
                // Исправляем category
                newCar.category = newCar.price > 7000000 ? 'premium' : 'business';
                
                newCars.push(newCar);
                existingModels.add(carKey);
            }
        }
    }
    
    console.log(`\n✅ Добавлено ${newCars.length} новых моделей`);
    
    // Объединяем с существующими
    const allCars = [...currentCars, ...newCars];
    
    // Сохраняем расширенную базу
    fs.writeFileSync('data/cars.json', JSON.stringify(allCars, null, 2), 'utf8');
    console.log(`💾 Сохранено в базу данных: ${allCars.length} автомобилей`);
    
    // Создаем папки для изображений
    const brands = [...new Set(allCars.map(car => car.brand.toLowerCase().replace(/\s+/g, '-')))];
    brands.forEach(brand => {
        const brandDir = `images/${brand}`;
        if (!fs.existsSync(brandDir)) {
            fs.mkdirSync(brandDir, { recursive: true });
            console.log(`📁 Создана папка: ${brandDir}`);
        }
    });
    
    console.log('\n📋 Итоговая статистика:');
    const brandStats = {};
    allCars.forEach(car => {
        brandStats[car.brand] = (brandStats[car.brand] || 0) + 1;
    });
    
    Object.entries(brandStats).forEach(([brand, count]) => {
        console.log(`${brand}: ${count} моделей`);
    });
    
    console.log(`\n🎉 База данных расширена до ${allCars.length} автомобилей!`);
    console.log('\n📸 Следующий шаг: скачивание изображений с encars.com.ru...');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { encarsModels, generatePrice, getBodyType, getFuelType };