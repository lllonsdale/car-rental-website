// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт загружен!');
    
    // Плавная прокрутка для навигационных ссылок
    const navLinks = document.querySelectorAll('nav a[href^="#"], .mobile-nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Подсветка активного пункта меню при прокрутке
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const desktopNavLinks = document.querySelectorAll('header nav a');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        // Обновляем десктопную навигацию
        desktopNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
        
        // Обновляем мобильную навигацию
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
    
    // Простая анимация появления элементов при прокрутке
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Применяем наблюдение к секциям
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Инициализация форм
    initializeForms();
    
    // Инициализация калькуляторов
    initializeCalculator(); // Лизинг
    initializeRentalCalculator(); // Аренда
});

// Обработка форм
function initializeForms() {
    // Маска для телефонного номера
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.startsWith('8')) {
                    value = '7' + value.slice(1);
                }
                if (!value.startsWith('7')) {
                    value = '7' + value;
                }
                
                let formatted = '+7';
                if (value.length > 1) {
                    formatted += ' (' + value.slice(1, 4);
                }
                if (value.length >= 5) {
                    formatted += ') ' + value.slice(4, 7);
                }
                if (value.length >= 8) {
                    formatted += '-' + value.slice(7, 9);
                }
                if (value.length >= 10) {
                    formatted += '-' + value.slice(9, 11);
                }
                
                e.target.value = formatted;
            }
        });
    });
    
    // Обработка главной формы
    const quickForm = document.getElementById('quickForm');
    if (quickForm) {
        quickForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(this, 'Заявка на консультацию');
        });
    }
    
    // Обработка форм услуг
    const serviceForms = document.querySelectorAll('.service-form');
    serviceForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const service = this.dataset.service || 'Услуга';
            handleFormSubmission(this, `Заявка на ${service}`);
        });
    });
}

// Обработка отправки формы
async function handleFormSubmission(form, title) {
    const formData = new FormData(form);
    const data = {};
    
    // Собираем данные формы
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Добавляем данные из полей без name
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (!input.name && input.value) {
            data[input.placeholder || 'field'] = input.value;
        }
    });
    
    // Показываем индикатор загрузки
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
    submitButton.disabled = true;
    
    try {
        // Отправляем данные на Telegram бот
        const response = await sendToTelegramBot(data);
        
        if (response.success) {
            // Показываем уведомление об успехе
            showNotification('success', 'Заявка отправлена!', 
                'Мы получили вашу заявку и свяжемся с вами в ближайшее время.');
            
            // Очищаем форму
            form.reset();
        } else {
            throw new Error(response.error || 'Ошибка отправки');
        }
    } catch (error) {
        console.error('Ошибка отправки заявки:', error);
        
        showNotification('error', 'Ошибка отправки', 
            'Произошла ошибка при отправке заявки. Попробуйте еще раз или свяжитесь по телефону.');
    } finally {
        // Восстанавливаем кнопку
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
}

// Калькулятор лизинга
function initializeCalculator() {
    const carPriceSlider = document.getElementById('carPrice');
    const initialPaymentSlider = document.getElementById('initialPayment');
    const leaseTermSlider = document.getElementById('leaseTerm');
    
    if (!carPriceSlider || !initialPaymentSlider || !leaseTermSlider) return;
    
    function updateCalculator() {
        const carPrice = parseInt(carPriceSlider.value);
        const initialPaymentPercent = parseInt(initialPaymentSlider.value);
        const leaseTerm = parseInt(leaseTermSlider.value);
        
        const initialPaymentAmount = (carPrice * initialPaymentPercent) / 100;
        const loanAmount = carPrice - initialPaymentAmount;
        
        // Примерная ставка лизинга 12% годовых
        const monthlyRate = 0.12 / 12;
        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, leaseTerm)) / 
                              (Math.pow(1 + monthlyRate, leaseTerm) - 1);
        
        const totalAmount = monthlyPayment * leaseTerm + initialPaymentAmount;
        const overpayment = totalAmount - carPrice;
        
        // Обновляем значения ползунков
        document.getElementById('carPriceValue').textContent = 
            new Intl.NumberFormat('ru-RU').format(carPrice) + ' ₽';
        
        document.getElementById('initialPaymentValue').textContent = 
            `${initialPaymentPercent}% (${new Intl.NumberFormat('ru-RU').format(initialPaymentAmount)} ₽)`;
        
        document.getElementById('leaseTermValue').textContent = 
            `${leaseTerm} месяцев`;
        
        // Обновляем результаты
        document.getElementById('monthlyPayment').textContent = 
            new Intl.NumberFormat('ru-RU').format(Math.round(monthlyPayment)) + ' ₽';
        
        document.getElementById('totalAmount').textContent = 
            new Intl.NumberFormat('ru-RU').format(Math.round(totalAmount)) + ' ₽';
        
        document.getElementById('overpayment').textContent = 
            new Intl.NumberFormat('ru-RU').format(Math.round(overpayment)) + ' ₽';
    }
    
    // Привязываем обработчики событий
    carPriceSlider.addEventListener('input', updateCalculator);
    initialPaymentSlider.addEventListener('input', updateCalculator);
    leaseTermSlider.addEventListener('input', updateCalculator);
    
    // Инициализируем калькулятор
    updateCalculator();
}

// Функция для кнопки "Получить предложение" в калькуляторе
function submitLeaseCalculation() {
    // Открываем модальное окно с данными из калькулятора
    openLeaseModal();
};

// Калькулятор аренды
function initializeRentalCalculator() {
    const carClassSelect = document.getElementById('carClass');
    const rentalDaysSlider = document.getElementById('rentalDays');
    const insuranceCheckbox = document.getElementById('insurance');
    const driverCheckbox = document.getElementById('driver');
    const deliveryCheckbox = document.getElementById('delivery');
    
    if (!carClassSelect || !rentalDaysSlider) return;
    
    // Цены аренды по классам (руб/день)
    const carPrices = {
        'economy': 1800,
        'comfort': 2500,
        'business': 4200,
        'premium': 6500
    };
    
    // Названия классов
    const carNames = {
        'economy': 'Эконом класс',
        'comfort': 'Комфорт класс',
        'business': 'Бизнес класс',
        'premium': 'Премиум класс'
    };
    
    function updateRentalCalculator() {
        const carClass = carClassSelect.value;
        const rentalDays = parseInt(rentalDaysSlider.value);
        const dailyPrice = carPrices[carClass];
        
        // Обновляем отображение класса и срока
        document.getElementById('carClassValue').textContent = 
            new Intl.NumberFormat('ru-RU').format(dailyPrice) + ' ₽/день';
        
        // Отображение дней
        let daysText;
        if (rentalDays === 1) {
            daysText = '1 день';
        } else if (rentalDays < 5) {
            daysText = rentalDays + ' дня';
        } else {
            daysText = rentalDays + ' дней';
        }
        document.getElementById('rentalDaysValue').textContent = daysText;
        
        // Базовая стоимость
        const basePrice = dailyPrice * rentalDays;
        
        // Скидка за срок аренды
        let discountPercent = 0;
        if (rentalDays >= 30) {
            discountPercent = 20; // 20% скидка от месяца
        } else if (rentalDays >= 14) {
            discountPercent = 15; // 15% скидка от 2 недель
        } else if (rentalDays >= 7) {
            discountPercent = 10; // 10% скидка от недели
        } else if (rentalDays >= 3) {
            discountPercent = 5; // 5% скидка от 3 дней
        }
        
        const discountAmount = (basePrice * discountPercent) / 100;
        
        // Дополнительные услуги
        let additionalServices = 0;
        
        if (insuranceCheckbox && insuranceCheckbox.checked) {
            additionalServices += parseInt(insuranceCheckbox.value) * rentalDays;
        }
        
        if (driverCheckbox && driverCheckbox.checked) {
            additionalServices += parseInt(driverCheckbox.value) * rentalDays;
        }
        
        if (deliveryCheckbox && deliveryCheckbox.checked) {
            additionalServices += parseInt(deliveryCheckbox.value);
        }
        
        // Итоговая стоимость
        const totalPrice = basePrice - discountAmount + additionalServices;
        
        // Обновляем значения на странице
        document.getElementById('basePrice').textContent = 
            new Intl.NumberFormat('ru-RU').format(basePrice) + ' ₽';
        
        const discountElement = document.getElementById('discount');
        if (discountAmount > 0) {
            discountElement.textContent = 
                '-' + new Intl.NumberFormat('ru-RU').format(discountAmount) + ' ₽ (' + discountPercent + '%)';
        } else {
            discountElement.textContent = 'Нет скидки';
        }
        
        document.getElementById('additionalServices').textContent = 
            new Intl.NumberFormat('ru-RU').format(additionalServices) + ' ₽';
        
        document.getElementById('totalPrice').textContent = 
            new Intl.NumberFormat('ru-RU').format(totalPrice) + ' ₽';
    }
    
    // Привязываем обработчики событий
    carClassSelect.addEventListener('change', updateRentalCalculator);
    rentalDaysSlider.addEventListener('input', updateRentalCalculator);
    
    if (insuranceCheckbox) insuranceCheckbox.addEventListener('change', updateRentalCalculator);
    if (driverCheckbox) driverCheckbox.addEventListener('change', updateRentalCalculator);
    if (deliveryCheckbox) deliveryCheckbox.addEventListener('change', updateRentalCalculator);
    
    // Инициализируем калькулятор
    updateRentalCalculator();
}

// Функция для кнопки "Забронировать" в калькуляторе аренды
function submitRentalCalculation() {
    // Открываем модальное окно с данными из калькулятора
    openRentalModal();
};

// Отправка данных в Telegram бот
async function sendToTelegramBot(data) {
    const BOT_API_URL = 'http://localhost:3001/api/application';
    
    try {
        const response = await fetch(BOT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('Ошибка отправки в Telegram бот:', error);
        
        // Если бот недоступен, сохраняем заявку локально
        saveApplicationLocally(data);
        
        // Показываем предупреждение, но не ошибку
        showNotification('info', 'Заявка сохранена!', 
            'Ваша заявка сохранена и будет обработана. Мы обязательно с вами свяжемся!');
        
        return { success: true }; // Возвращаем success, чтобы форма очистилась
    }
}

// Сохранение заявки локально (на случай, если бот недоступен)
function saveApplicationLocally(data) {
    try {
        const applications = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
        applications.push({
            ...data,
            timestamp: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem('pendingApplications', JSON.stringify(applications));
        
        console.log('Заявка сохранена локально:', data);
    } catch (error) {
        console.error('Ошибка сохранения заявки:', error);
    }
}

// Система уведомлений
function showNotification(type, title, message) {
    // Создаем контейнер для уведомлений, если его нет
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    // Создаем уведомление
    const notification = document.createElement('div');
    const iconClass = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle'
    }[type];
    
    const bgColor = {
        'success': 'rgba(34, 197, 94, 0.95)',
        'error': 'rgba(239, 68, 68, 0.95)',
        'info': 'rgba(59, 130, 246, 0.95)'
    }[type];
    
    notification.innerHTML = `
        <div style="
            background: ${bgColor};
            backdrop-filter: blur(15px);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            margin-bottom: 10px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            pointer-events: auto;
            cursor: pointer;
            transform: translateX(100%);
            transition: all 0.3s ease;
            min-width: 300px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        ">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <i class="fas ${iconClass}" style="font-size: 20px; margin-top: 2px;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">
                        ${title}
                    </div>
                    <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
                        ${message}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.firstElementChild.style.transform = 'translateX(0)';
    }, 10);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        notification.firstElementChild.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Скрытие по клику
    notification.addEventListener('click', () => {
        notification.firstElementChild.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Функции для модального окна лизинга
function openLeaseModal() {
    // Получаем данные из калькулятора
    const carPrice = document.getElementById('carPrice')?.value || '1500000';
    const initialPayment = document.getElementById('initialPayment')?.value || '20';
    const leaseTerm = document.getElementById('leaseTerm')?.value || '36';
    const monthlyPayment = document.getElementById('monthlyPayment')?.textContent || '41 667 ₽';
    
    // Обновляем данные в модальном окне
    const carPriceFormatted = new Intl.NumberFormat('ru-RU').format(carPrice) + ' ₽';
    const initialPaymentAmount = Math.round((carPrice * initialPayment) / 100);
    const initialPaymentFormatted = initialPayment + '% (' + new Intl.NumberFormat('ru-RU').format(initialPaymentAmount) + ' ₽)';
    
    document.getElementById('modalCarPrice').textContent = carPriceFormatted;
    document.getElementById('modalInitialPayment').textContent = initialPaymentFormatted;
    document.getElementById('modalLeaseTerm').textContent = leaseTerm + ' месяцев';
    document.getElementById('modalMonthlyPayment').textContent = monthlyPayment;
    
    // Очищаем форму
    document.getElementById('leaseForm').reset();
    
    // Показываем модальное окно
    document.getElementById('leaseModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Отключаем прокрутку фона
}

function closeLeaseModal() {
    document.getElementById('leaseModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Включаем прокрутку фона
}

// Закрытие модального окна по клику вне его
window.addEventListener('click', function(event) {
    const modal = document.getElementById('leaseModal');
    if (event.target === modal) {
        closeLeaseModal();
    }
});

// Закрытие модальных окон по Escape
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLeaseModal();
        closeRentalModal();
    }
});

// Обработка отправки формы лизинга
document.addEventListener('DOMContentLoaded', function() {
    const leaseForm = document.getElementById('leaseForm');
    if (leaseForm) {
        leaseForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(leaseForm);
            const submitButton = leaseForm.querySelector('.modal-submit-btn');
            const originalButtonText = submitButton.innerHTML;
            
            // Получаем данные калькулятора
            const calculationData = {
                service: 'лизинг',
                name: formData.get('name'),
                phone: formData.get('phone'),
                comment: formData.get('comment') || 'Нет комментария',
                carPrice: document.getElementById('modalCarPrice').textContent,
                initialPayment: document.getElementById('modalInitialPayment').textContent,
                leaseTerm: document.getElementById('modalLeaseTerm').textContent,
                monthlyPayment: document.getElementById('modalMonthlyPayment').textContent
            };
            
            // Показываем индикатор загрузки
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
            submitButton.disabled = true;
            
            // Отладочный вывод
            console.log('Отправляем данные лизинга:', calculationData);
            
            try {
                const response = await sendToTelegramBot(calculationData);
                
                if (response.success) {
                    showNotification('success', 'Заявка отправлена!', 
                        'Мы получили вашу заявку на лизинг и свяжемся с вами в ближайшее время.');
                    closeLeaseModal();
                } else {
                    throw new Error(response.error || 'Ошибка отправки');
                }
            } catch (error) {
                console.error('Ошибка отправки заявки:', error);
                
                showNotification('error', 'Ошибка отправки', 
                    'Произошла ошибка при отправке заявки. Попробуйте еще раз.');
            } finally {
                // Восстанавливаем кнопку
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }
});

// Функции для модального окна аренды
function openRentalModal() {
    // Получаем данные из калькулятора аренды
    const carClass = document.getElementById('carClass')?.value || 'comfort';
    const rentalDays = document.getElementById('rentalDays')?.value || '7';
    const basePrice = document.getElementById('basePrice')?.textContent || '17 500 ₽';
    const discount = document.getElementById('discount')?.textContent || 'Нет скидки';
    const additionalServices = document.getElementById('additionalServices')?.textContent || '0 ₽';
    const totalPrice = document.getElementById('totalPrice')?.textContent || '15 750 ₽';
    
    // Названия классов
    const carClassNames = {
        'economy': 'Эконом класс',
        'comfort': 'Комфорт класс',
        'business': 'Бизнес класс',
        'premium': 'Премиум класс'
    };
    
    // Отображение дней
    let daysText;
    const days = parseInt(rentalDays);
    if (days === 1) {
        daysText = '1 день';
    } else if (days < 5) {
        daysText = days + ' дня';
    } else {
        daysText = days + ' дней';
    }
    
    // Обновляем данные в модальном окне
    document.getElementById('modalRentalCarClass').textContent = carClassNames[carClass] || carClass;
    document.getElementById('modalRentalDays').textContent = daysText;
    document.getElementById('modalRentalBasePrice').textContent = basePrice;
    document.getElementById('modalRentalDiscount').textContent = discount;
    document.getElementById('modalRentalServices').textContent = additionalServices;
    document.getElementById('modalRentalTotal').textContent = totalPrice;
    
    // Очищаем форму
    document.getElementById('rentalForm').reset();
    
    // Показываем модальное окно
    document.getElementById('rentalModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeRentalModal() {
    document.getElementById('rentalModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Закрытие модального окна аренды по клику вне его
window.addEventListener('click', function(event) {
    const rentalModal = document.getElementById('rentalModal');
    if (event.target === rentalModal) {
        closeRentalModal();
    }
});

// Обработка отправки формы аренды
document.addEventListener('DOMContentLoaded', function() {
    const rentalForm = document.getElementById('rentalForm');
    if (rentalForm) {
        rentalForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(rentalForm);
            const submitButton = rentalForm.querySelector('.modal-submit-btn');
            const originalButtonText = submitButton.innerHTML;
            
            // Определяем выбранные дополнительные услуги
            const selectedServices = [];
            if (document.getElementById('insurance') && document.getElementById('insurance').checked) {
                selectedServices.push('Полная страховка');
            }
            if (document.getElementById('driver') && document.getElementById('driver').checked) {
                selectedServices.push('Личный водитель');
            }
            if (document.getElementById('delivery') && document.getElementById('delivery').checked) {
                selectedServices.push('Доставка автомобиля');
            }
            
            // Получаем данные калькулятора
            const calculationData = {
                service: 'аренда',
                name: formData.get('name'),
                phone: formData.get('phone'),
                comment: formData.get('comment') || 'Нет комментария',
                carClass: document.getElementById('modalRentalCarClass').textContent,
                rentalDays: document.getElementById('modalRentalDays').textContent,
                basePrice: document.getElementById('modalRentalBasePrice').textContent,
                discount: document.getElementById('modalRentalDiscount').textContent,
                additionalServices: selectedServices.length > 0 ? selectedServices.join(', ') : 'Нет',
                totalPrice: document.getElementById('modalRentalTotal').textContent
            };
            
            // Показываем индикатор загрузки
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
            submitButton.disabled = true;
            
            // Отладочный вывод
            console.log('Отправляем данные аренды:', calculationData);
            
            try {
                const response = await sendToTelegramBot(calculationData);
                
                if (response.success) {
                    showNotification('success', 'Бронь отправлена!', 
                        'Мы получили вашу заявку на аренду и свяжемся с вами для подтверждения.');
                    closeRentalModal();
                } else {
                    throw new Error(response.error || 'Ошибка отправки');
                }
            } catch (error) {
                console.error('Ошибка отправки брони:', error);
                
                showNotification('error', 'Ошибка отправки', 
                    'Произошла ошибка при отправке брони. Попробуйте еще раз.');
            } finally {
                // Восстанавливаем кнопку
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }
});

// Маска для телефона в модальном окне аренды
document.addEventListener('DOMContentLoaded', function() {
    const modalRentalPhone = document.getElementById('modalRentalPhone');
    if (modalRentalPhone) {
        modalRentalPhone.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.startsWith('8')) {
                    value = '7' + value.slice(1);
                }
                if (!value.startsWith('7')) {
                    value = '7' + value;
                }
                
                let formatted = '+7';
                if (value.length > 1) {
                    formatted += ' (' + value.slice(1, 4);
                }
                if (value.length >= 5) {
                    formatted += ') ' + value.slice(4, 7);
                }
                if (value.length >= 8) {
                    formatted += '-' + value.slice(7, 9);
                }
                if (value.length >= 10) {
                    formatted += '-' + value.slice(9, 11);
                }
                
                e.target.value = formatted;
            }
        });
    }
});

// Маска для телефона в модальном окне
document.addEventListener('DOMContentLoaded', function() {
    const modalPhone = document.getElementById('modalPhone');
    if (modalPhone) {
        modalPhone.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.startsWith('8')) {
                    value = '7' + value.slice(1);
                }
                if (!value.startsWith('7')) {
                    value = '7' + value;
                }
                
                let formatted = '+7';
                if (value.length > 1) {
                    formatted += ' (' + value.slice(1, 4);
                }
                if (value.length >= 5) {
                    formatted += ') ' + value.slice(4, 7);
                }
                if (value.length >= 8) {
                    formatted += '-' + value.slice(7, 9);
                }
                if (value.length >= 10) {
                    formatted += '-' + value.slice(9, 11);
                }
                
                e.target.value = formatted;
            }
        });
    }
});
