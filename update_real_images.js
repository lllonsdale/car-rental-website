const fs = require('fs');
const path = require('path');

function updateCarImagePaths() {
    console.log('🔄 Обновление путей к реально скачанным изображениям...\n');
    
    // Читаем базу данных
    let cars = [];
    try {
        const data = fs.readFileSync('data/cars.json', 'utf8');
        cars = JSON.parse(data);
        console.log(`📊 Загружено ${cars.length} автомобилей из базы данных`);
    } catch (error) {
        console.error('❌ Ошибка чтения базы данных:', error.message);
        return;
    }
    
    // Получаем список всех скачанных изображений
    const imageFiles = {};
    const brandFolders = ['bmw', 'mercedes-benz', 'audi', 'porsche', 'lexus', 'toyota', 'hyundai', 'kia', 'volvo', 'jaguar', 'land-rover', 'mazda'];
    
    brandFolders.forEach(brandFolder => {
        const brandPath = `images/${brandFolder}`;
        if (fs.existsSync(brandPath)) {
            const files = fs.readdirSync(brandPath).filter(file => file.endsWith('.jpg'));
            imageFiles[brandFolder] = files;
            console.log(`📁 ${brandFolder}: ${files.length} изображений`);
        }
    });
    
    let updatedCars = 0;
    let carsWithImages = 0;
    
    // Обновляем пути для каждого автомобиля
    cars.forEach(car => {
        const brandFolder = car.brand.toLowerCase().replace(/\s+/g, '-');
        const modelName = car.model.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
        const year = car.year;
        
        // Ищем соответствующие изображения
        const carImages = [];
        const angles = ['side', 'front', 'rear', 'interior'];
        
        if (imageFiles[brandFolder]) {
            angles.forEach(angle => {
                // Пробуем различные варианты названий файлов
                const possibleNames = [
                    `${modelName}_${year}_${angle}.jpg`,
                    `${modelName.replace(/_/g, '-')}_${year}_${angle}.jpg`,
                    `${car.model.toLowerCase().replace(/\s+/g, '-')}_${year}_${angle}.jpg`,
                    `${car.model.toLowerCase().replace(/\s+/g, '')}_${year}_${angle}.jpg`
                ];
                
                for (const fileName of possibleNames) {
                    if (imageFiles[brandFolder].includes(fileName)) {
                        carImages.push(`images/${brandFolder}/${fileName}`);
                        break;
                    }
                }
            });
        }
        
        // Если нашли изображения, обновляем пути
        if (carImages.length > 0) {
            // Обновляем главное изображение (первое - обычно side)
            car.image = carImages[0];
            
            // Обновляем массив изображений
            car.images = carImages;
            
            // Если не хватает изображений, дополняем первым
            while (car.images.length < 4) {
                car.images.push(car.images[0]);
            }
            
            carsWithImages++;
            console.log(`✅ ${car.brand} ${car.model} ${car.year}: ${carImages.length} изображений`);
        } else {
            // Создаем пути для placeholder изображений
            car.image = `images/${brandFolder}/${modelName}_${year}_side.jpg`;
            car.images = [
                `images/${brandFolder}/${modelName}_${year}_side.jpg`,
                `images/${brandFolder}/${modelName}_${year}_front.jpg`,
                `images/${brandFolder}/${modelName}_${year}_rear.jpg`,
                `images/${brandFolder}/${modelName}_${year}_interior.jpg`
            ];
            console.log(`⚠️  ${car.brand} ${car.model} ${car.year}: изображения не найдены, используются placeholder пути`);
        }
        
        updatedCars++;
    });
    
    // Сохраняем обновленную базу данных
    try {
        fs.writeFileSync('data/cars.json', JSON.stringify(cars, null, 2), 'utf8');
        console.log(`\n💾 Обновленная база данных сохранена`);
    } catch (error) {
        console.error('❌ Ошибка сохранения базы данных:', error.message);
        return;
    }
    
    console.log(`\n📊 Статистика обновления:`);
    console.log(`   • Всего автомобилей: ${cars.length}`);
    console.log(`   • Обновлено записей: ${updatedCars}`);
    console.log(`   • С реальными изображениями: ${carsWithImages}`);
    console.log(`   • Без изображений: ${updatedCars - carsWithImages}`);
    
    // Проверим несколько конкретных автомобилей
    console.log(`\n🔍 Проверка конкретных автомобилей:`);
    const testCars = cars.slice(0, 5);
    testCars.forEach(car => {
        console.log(`   ${car.brand} ${car.model}: ${car.image}`);
        console.log(`     Массив изображений: ${car.images.length} файлов`);
    });
    
    console.log(`\n✅ Обновление путей к изображениям завершено!`);
}

if (require.main === module) {
    updateCarImagePaths();
}

module.exports = { updateCarImagePaths };