require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Конфигурация
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Проверяем наличие обязательных переменных окружения
if (!BOT_TOKEN) {
    console.error('❌ Ошибка: BOT_TOKEN не найден в переменных окружения');
    console.error('📝 Создайте бота через @BotFather и добавьте токен в .env файл');
    process.exit(1);
}

if (!CHAT_ID) {
    console.error('❌ Ошибка: CHAT_ID не найден в переменных окружения');
    console.error('📝 Добавьте ваш chat_id в .env файл');
    process.exit(1);
}

// Инициализация бота
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Инициализация Express сервера
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
});

// ======================== TELEGRAM BOT COMMANDS ========================

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🚗 *Добро пожаловать в бот Автомобильных услуг!*

Этот бот будет уведомлять вас о новых заявках с сайта.

📋 *Доступные команды:*
/start - Показать это сообщение
/help - Справка
/status - Статус бота
/stats - Статистика заявок

🔔 *Chat ID:* \`${chatId}\`
_(используйте этот ID в настройках)_
    `;
    
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    
    console.log(`📱 Новый пользователь запустил бота: ${msg.from.first_name} (${chatId})`);
});

// Команда /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
🆘 *Справка по боту*

*Функции бота:*
• Получение заявок с сайта автомобильных услуг
• Уведомления о новых клиентах
• Статистика по заявкам

*Типы заявок:*
🔹 Аренда автомобилей
🔹 Лизинг автомобилей  
🔹 Покупка под ключ
🔹 Консультации

*Технические команды:*
/start - Перезапуск бота
/status - Проверка работы
/stats - Статистика

💬 По вопросам обращайтесь к администратору
    `;
    
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Команда /status
bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    
    const statusMessage = `
✅ *Статус бота*

🤖 Бот: Активен
⏰ Время работы: ${uptimeHours}ч ${uptimeMinutes}м
🌐 Сервер: Запущен на порту ${PORT}
📊 Память: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB

🔧 Режим: ${NODE_ENV}
📅 Время: ${new Date().toLocaleString('ru-RU')}
    `;
    
    bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
});

// Статистика заявок (простая реализация)
let applicationStats = {
    total: 0,
    rental: 0,
    leasing: 0,
    purchase: 0,
    consultation: 0,
    today: 0,
    lastReset: new Date().toDateString()
};

bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    
    // Сброс дневной статистики если новый день
    if (applicationStats.lastReset !== new Date().toDateString()) {
        applicationStats.today = 0;
        applicationStats.lastReset = new Date().toDateString();
    }
    
    const statsMessage = `
📊 *Статистика заявок*

📈 *Общая статистика:*
• Всего заявок: ${applicationStats.total}
• Сегодня: ${applicationStats.today}

📋 *По типам услуг:*
🚗 Аренда: ${applicationStats.rental}
🤝 Лизинг: ${applicationStats.leasing}
🌍 Под ключ: ${applicationStats.purchase}
💬 Консультации: ${applicationStats.consultation}

📅 Последнее обновление: ${new Date().toLocaleString('ru-RU')}
    `;
    
    bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
});

// ======================== API ENDPOINTS ========================

// Главная страница API
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Telegram Bot API для автомобильных услуг',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Endpoint для получения заявок с сайта
app.post('/api/application', async (req, res) => {
    try {
        const applicationData = req.body;
        
        // Валидация данных
        if (!applicationData || typeof applicationData !== 'object') {
            return res.status(400).json({ 
                error: 'Неверный формат данных заявки',
                received: typeof applicationData 
            });
        }

        // Форматирование сообщения для Telegram
        const message = formatApplicationMessage(applicationData);
        
        // Отправка в Telegram
        await bot.sendMessage(CHAT_ID, message, { 
            parse_mode: 'Markdown',
            disable_web_page_preview: true 
        });
        
        // Обновление статистики
        updateStats(applicationData);
        
        // Логирование
        console.log('📨 Новая заявка отправлена в Telegram:', {
            type: applicationData.service || 'неизвестно',
            timestamp: new Date().toISOString()
        });
        
        res.json({ 
            success: true, 
            message: 'Заявка успешно отправлена в Telegram',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Ошибка при обработке заявки:', error);
        
        res.status(500).json({ 
            error: 'Внутренняя ошибка сервера', 
            details: NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ======================== HELPER FUNCTIONS ========================

// Форматирование сообщения о заявке
function formatApplicationMessage(data) {
    const timestamp = new Date().toLocaleString('ru-RU');
    
    // Определяем тип услуги и эмодзи
    const serviceEmojis = {
        'аренда': '🚗',
        'лизинг': '🤝',
        'под-ключ': '🌍',
        'консультация': '💬'
    };
    
    const serviceType = data.service || 'Не указано';
    const emoji = serviceEmojis[serviceType.toLowerCase()] || '📋';
    
    let message = `${emoji} *НОВАЯ ЗАЯВКА*\n\n`;
    
    // Основная информация
    message += `📋 *Услуга:* ${serviceType}\n`;
    message += `👤 *Имя:* ${data.name || 'Не указано'}\n`;
    message += `📞 *Телефон:* ${data.phone || 'Не указан'}\n`;
    
    // Дополнительные поля в зависимости от данных
    if (data.message && data.message.trim()) {
        message += `💬 *Сообщение:* ${data.message}\n`;
    }
    
    // Специфичные поля для разных типов заявок
    if (data['Класс автомобиля']) {
        message += `🚙 *Класс авто:* ${data['Класс автомобиля']}\n`;
    }
    
    if (data['Срок аренды']) {
        message += `📅 *Срок:* ${data['Срок аренды']}\n`;
    }
    
    if (data['Марка и модель']) {
        message += `🚗 *Марка и модель:* ${data['Марка и модель']}\n`;
    }
    
    if (data['Страна покупки']) {
        message += `🌍 *Страна покупки:* ${data['Страна покупки']}\n`;
    }
    
    if (data['Бюджет (₽)']) {
        const budget = parseInt(data['Бюджет (₽)']);
        message += `💰 *Бюджет:* ${budget.toLocaleString('ru-RU')} ₽\n`;
    }
    
    if (data['Макс. год выпуска']) {
        message += `📆 *Макс. год выпуска:* ${data['Макс. год выпуска']}\n`;
    }
    
    // Данные калькулятора лизинга
    if (data.carPrice) {
        message += `\n💰 *Расчет лизинга:*\n`;
        message += `• Стоимость авто: ${data.carPrice}\n`;
        message += `• Первоначальный взнос: ${data.initialPayment}\n`;
        message += `• Срок: ${data.leaseTerm}\n`;
        message += `• Ежемесячный платеж: ${data.monthlyPayment}\n`;
    }
    
    // Данные калькулятора аренды
    if (data.carClass && data.rentalDays) {
        message += `\n🚗 *Расчет аренды:*\n`;
        message += `• Класс авто: ${data.carClass}\n`;
        message += `• Срок: ${data.rentalDays}\n`;
        message += `• Базовая стоимость: ${data.basePrice}\n`;
        
        if (data.discount && data.discount !== 'Нет скидки') {
            message += `• Скидка: ${data.discount}\n`;
        }
        
        if (data.additionalServices && data.additionalServices !== 'Нет' && data.additionalServices !== '0 ₽') {
            message += `• Доп. услуги: ${data.additionalServices}\n`;
        }
        
        message += `• *Итого: ${data.totalPrice}*\n`;
    }
    
    // Комментарий
    if (data.comment && data.comment.trim() && data.comment !== 'Нет комментария') {
        message += `\n📝 *Комментарий:* ${data.comment}\n`;
    }
    
    message += `\n⏰ *Время:* ${timestamp}`;
    
    return message;
}

// Обновление статистики
function updateStats(data) {
    applicationStats.total++;
    applicationStats.today++;
    
    const serviceType = (data.service || '').toLowerCase();
    
    switch (serviceType) {
        case 'аренда':
            applicationStats.rental++;
            break;
        case 'лизинг':
            applicationStats.leasing++;
            break;
        case 'под-ключ':
            applicationStats.purchase++;
            break;
        case 'консультация':
            applicationStats.consultation++;
            break;
    }
}

// ======================== ERROR HANDLERS ========================

// Обработка ошибок Telegram бота
bot.on('error', (error) => {
    console.error('❌ Ошибка Telegram бота:', error);
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Необработанное отклонение промиса:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Необработанное исключение:', error);
    process.exit(1);
});

// ======================== SERVER START ========================

const server = app.listen(PORT, () => {
    console.log('🚀 =================================');
    console.log('🤖 Telegram Bot для автомобильных услуг');
    console.log('🚀 =================================');
    console.log(`📡 Сервер запущен на порту: ${PORT}`);
    console.log(`🌍 API доступен по адресу: http://localhost:${PORT}`);
    console.log(`🔧 Режим: ${NODE_ENV}`);
    console.log(`📅 Время запуска: ${new Date().toLocaleString('ru-RU')}`);
    console.log('🚀 =================================');
    
    if (NODE_ENV === 'development') {
        console.log('💡 Для тестирования отправьте POST запрос на:');
        console.log(`   http://localhost:${PORT}/api/application`);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Получен сигнал SIGTERM, завершение работы...');
    server.close(() => {
        console.log('✅ Сервер остановлен');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n📴 Получен сигнал SIGINT, завершение работы...');
    server.close(() => {
        console.log('✅ Сервер остановлен');
        process.exit(0);
    });
});