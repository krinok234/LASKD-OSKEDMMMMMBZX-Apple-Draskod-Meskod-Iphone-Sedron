// Данные привилегий
const privileges = {
    survival: [
        { name: 'VIP', price: 100, features: ['Цветной ник', 'Доступ к /fly', '5 домов'] },
        { name: 'Premium', price: 250, features: ['Все из VIP', 'Кит Premium', '10 домов'] },
        { name: 'Elite', price: 500, features: ['Все из Premium', 'Кит Elite', '20 домов'] },
        { name: 'Legend', price: 1000, features: ['Все из Elite', 'Кит Legend', 'Неограниченно домов'] },
        { name: 'God', price: 2000, features: ['Все из Legend', 'Кит God', 'Особые возможности'] }
    ],
    minigames: [
        { name: 'VIP', price: 150, features: ['Цветной ник', 'Доступ к VIP лобби'] },
        { name: 'Premium', price: 300, features: ['Все из VIP', 'Особые косметические предметы'] },
        { name: 'Elite', price: 600, features: ['Все из Premium', 'Приоритет в очереди'] }
    ],
    hardcore: [
        { name: 'Warrior', price: 200, features: ['Дополнительная жизнь', 'Стартовый набор'] },
        { name: 'Champion', price: 500, features: ['Все из Warrior', '3 дополнительные жизни'] },
        { name: 'Immortal', price: 1500, features: ['Все из Champion', 'Особые способности'] }
    ]
};

let currentCategory = 'survival';

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updatePrivilegeSelect();
    setupEventListeners();
    createSnow();
    setupSmoothScroll();
    highlightActiveSection();
});

// Обработчики событий
function setupEventListeners() {
    // Переключение категорий
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            updatePrivilegeSelect();
        });
    });

    // Кнопка оплаты
    document.getElementById('payBtn').addEventListener('click', handlePayment);

    // Карусель игроков
    setupCarousel('.players-carousel', '.players-list');
    setupCarousel('.review-carousel', '.review-card');
}

// Обновление списка привилегий
function updatePrivilegeSelect() {
    const select = document.getElementById('privilege');
    select.innerHTML = '<option value="">Выберите товар</option>';
    
    privileges[currentCategory].forEach((priv, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${priv.name} - ${priv.price}₽`;
        select.appendChild(option);
    });
}

// Обработка оплаты
function handlePayment() {
    const nickname = document.getElementById('nickname').value;
    const privilegeIndex = document.getElementById('privilege').value;
    const promo = document.getElementById('promo').value;

    if (!nickname) {
        alert('Введите ваш никнейм!');
        return;
    }

    if (privilegeIndex === '') {
        alert('Выберите привилегию!');
        return;
    }

    const selectedPrivilege = privileges[currentCategory][privilegeIndex];
    let finalPrice = selectedPrivilege.price;

    // Применение промокода (пример)
    if (promo.toLowerCase() === 'endercore2024') {
        finalPrice = Math.round(finalPrice * 0.9); // 10% скидка
        alert(`Промокод применен! Скидка 10%`);
    }

    // Здесь должна быть интеграция с платежной системой
    const confirmMsg = `Игрок: ${nickname}\nПривилегия: ${selectedPrivilege.name}\nКатегория: ${currentCategory.toUpperCase()}\nЦена: ${finalPrice}₽\n\nПродолжить оплату?`;
    
    if (confirm(confirmMsg)) {
        alert('Перенаправление на страницу оплаты...\n(Здесь должна быть интеграция с платежной системой)');
        // window.open('payment-url', '_blank');
    }
}

// Настройка карусели
function setupCarousel(containerSelector, itemSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const prevBtn = container.querySelector('.prev');
    const nextBtn = container.querySelector('.next');
    const items = container.querySelector(itemSelector);

    if (prevBtn && items) {
        prevBtn.addEventListener('click', () => {
            items.scrollBy({ left: -150, behavior: 'smooth' });
        });
    }

    if (nextBtn && items) {
        nextBtn.addEventListener('click', () => {
            items.scrollBy({ left: 150, behavior: 'smooth' });
        });
    }
}

// Создание падающего снега (точки)
function createSnow() {
    const snowContainer = document.querySelector('.snow-container');
    const snowflakeCount = 30; // Меньше снежинок

    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // Случайные параметры для каждой точки
        const startPosition = Math.random() * 100;
        const fallDuration = 8 + Math.random() * 8; // 8-16 секунд
        const size = 2 + Math.random() * 2; // 2-4px
        const delay = Math.random() * 5; // задержка 0-5 секунд
        
        snowflake.style.left = startPosition + '%';
        snowflake.style.width = size + 'px';
        snowflake.style.height = size + 'px';
        snowflake.style.animationDuration = fallDuration + 's';
        snowflake.style.animationDelay = delay + 's';
        
        snowContainer.appendChild(snowflake);
    }
}

// Плавная прокрутка к секциям
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Подсветка активной секции в навигации
function highlightActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}
