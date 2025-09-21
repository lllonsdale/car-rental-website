#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re

def update_car_images():
    # Читаем JSON файл
    with open('data/cars.json', 'r', encoding='utf-8') as f:
        cars = json.load(f)
    
    print(f"Обрабатываем {len(cars)} автомобилей...")
    
    # Маппинг ID автомобилей к путям изображений
    car_mappings = {
        # BMW
        "bmw-x7-2024": "images/bmw/x7_2024",
        "bmw-3-series-2023": "images/bmw/3_series_2023", 
        "bmw-x5-2022": "images/bmw/x5_2022",
        "bmw-i4-2024": "images/bmw/i4_2024",
        "bmw-m5-2024": "images/bmw/m5_2024",
        "bmw-x5-2023": "images/bmw/x5_2023",
        
        # Mercedes-Benz
        "mercedes-s-class-2023": "images/mercedes-benz/s_class_2023",
        "mercedes-amg-gt-2023": "images/mercedes-benz/amg_gt_2023",
        "mercedes-gle-2024": "images/mercedes-benz/gle_2024",
        
        # Audi
        "audi-q8-2024": "images/audi/q8_2024",
        "audi-a8-2024": "images/audi/a8_2024", 
        "audi-a4-2023": "images/audi/a4_2023",
        "audi-e-tron-2024": "images/audi/e_tron_2024",
        "audi-rs6-2024": "images/audi/rs6_avant_2024",
        
        # Porsche
        "porsche-cayenne-2024": "images/porsche/cayenne_2024",
        
        # Lexus
        "lexus-es-2024": "images/lexus/es_2024",
        "lexus-rx-2023": "images/lexus/rx_2023",
        
        # Toyota
        "toyota-camry-2023": "images/toyota/camry_2023",
        "toyota-rav4-2024": "images/toyota/rav4_2024",
        
        # Hyundai
        "hyundai-sonata-2023": "images/hyundai/sonata_2023",
        "hyundai-tucson-2024": "images/hyundai/tucson_2024",
        
        # KIA
        "kia-k5-2023": "images/kia/k5_2023",
        "kia-sportage-2024": "images/kia/sportage_2024",
        
        # Volvo
        "volvo-xc90-2023": "images/volvo/xc90_2023",
        "volvo-s90-2024": "images/volvo/s90_2024",
        
        # Jaguar
        "jaguar-f-pace-2023": "images/jaguar/f_pace_2023",
        
        # Land Rover
        "land-rover-discovery-2024": "images/land-rover/discovery_sport_2024",
        
        # Mazda
        "mazda-cx5-2023": "images/mazda/cx5_2023"
    }
    
    # Обновляем каждый автомобиль
    updated_count = 0
    for car in cars:
        car_id = car.get('id')
        if car_id in car_mappings:
            base_path = car_mappings[car_id]
            
            # Обновляем главное изображение
            car['image'] = f"{base_path}_side.jpg"
            
            # Обновляем массив изображений
            car['images'] = [
                f"{base_path}_side.jpg",
                f"{base_path}_front.jpg", 
                f"{base_path}_rear.jpg",
                f"{base_path}_interior.jpg"
            ]
            
            updated_count += 1
            print(f"✓ Обновлен: {car_id}")
        else:
            print(f"✗ Не найден маппинг для: {car_id}")
    
    # Сохраняем обновленный JSON
    with open('data/cars.json', 'w', encoding='utf-8') as f:
        json.dump(cars, f, ensure_ascii=False, indent=2)
    
    print(f"\nОбновление завершено!")
    print(f"Обновлено автомобилей: {updated_count}")
    print(f"Всего автомобилей: {len(cars)}")

if __name__ == "__main__":
    update_car_images()