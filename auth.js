// Переключение между формами входа и регистрации
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Переключение активной вкладки
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Переключение форм
        document.querySelectorAll('.auth-form-container').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${targetTab}-form`).classList.add('active');
    });
});

// Обработка формы входа
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, rememberMe })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('login-message', 'success', 'Вход выполнен успешно! Перенаправление...');
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('username', data.username);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage('login-message', 'error', data.message || 'Неверный логин или пароль');
        }
    } catch (error) {
        showMessage('login-message', 'error', 'Ошибка подключения к серверу');
    }
});

// Обработка формы регистрации
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nickname = document.getElementById('reg-nickname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;
    const agreeTerms = document.getElementById('agree-terms').checked;
    
    // Валидация
    if (password !== passwordConfirm) {
        showMessage('register-message', 'error', 'Пароли не совпадают');
        return;
    }
    
    if (!agreeTerms) {
        showMessage('register-message', 'error', 'Необходимо согласиться с правилами');
        return;
    }
    
    if (nickname.length < 3 || nickname.length > 16) {
        showMessage('register-message', 'error', 'Никнейм должен быть от 3 до 16 символов');
        return;
    }
    
    if (password.length < 8) {
        showMessage('register-message', 'error', 'Пароль должен быть минимум 8 символов');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickname, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('register-message', 'success', 'Регистрация успешна! Можете войти в аккаунт');
            setTimeout(() => {
                document.querySelector('[data-tab="login"]').click();
                document.getElementById('login-username').value = nickname;
            }, 2000);
        } else {
            showMessage('register-message', 'error', data.message || 'Ошибка регистрации');
        }
    } catch (error) {
        showMessage('register-message', 'error', 'Ошибка подключения к серверу');
    }
});

// Функция отображения сообщений
function showMessage(elementId, type, message) {
    const messageEl = document.getElementById(elementId);
    messageEl.className = `auth-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

// Проверка авторизации при загрузке
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    
    if (token && username) {
        // Пользователь уже авторизован
        updateHeaderForLoggedInUser(username);
    }
});

// Обновление хедера для авторизованного пользователя
function updateHeaderForLoggedInUser(username) {
    const nav = document.querySelector('nav');
    const authLink = nav.querySelector('a[href="auth.html"]');
    
    if (authLink) {
        authLink.textContent = username;
        authLink.href = '#';
        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Выйти из аккаунта?')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('username');
                window.location.reload();
            }
        });
    }
}
