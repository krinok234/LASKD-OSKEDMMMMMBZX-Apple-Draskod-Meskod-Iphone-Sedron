// Расширенный сервер с базой данных и API для авторизации
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

const PORT = 3000;

// Инициализация базы данных SQLite
const db = new sqlite3.Database('./endercore.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err);
    } else {
        console.log('✅ База данных подключена');
        initDatabase();
    }
});

// Создание таблиц
function initDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            balance INTEGER DEFAULT 0,
            total_donated INTEGER DEFAULT 0
        )
    `, (err) => {
        if (err) console.error('Ошибка создания таблицы users:', err);
        else console.log('✅ Таблица users готова');
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            privilege_name TEXT NOT NULL,
            privilege_category TEXT NOT NULL,
            price INTEGER NOT NULL,
            purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('Ошибка создания таблицы purchases:', err);
        else console.log('✅ Таблица purchases готова');
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('Ошибка создания таблицы sessions:', err);
        else console.log('✅ Таблица sessions готова');
    });
}

// Хеширование пароля
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Генерация токена
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// MIME типы
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Обработка API запросов
function handleApiRequest(req, res, url, body) {
    // Регистрация
    if (url === '/api/register' && req.method === 'POST') {
        const { nickname, email, password } = body;

        // Валидация
        if (!nickname || !email || !password) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Все поля обязательны' }));
            return;
        }

        const passwordHash = hashPassword(password);

        db.run(
            'INSERT INTO users (nickname, email, password_hash) VALUES (?, ?, ?)',
            [nickname, email, passwordHash],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Никнейм или email уже используется' }));
                    } else {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Ошибка сервера' }));
                    }
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        message: 'Регистрация успешна',
                        userId: this.lastID 
                    }));
                }
            }
        );
    }
    // Вход
    else if (url === '/api/login' && req.method === 'POST') {
        const { username, password, rememberMe } = body;
        const passwordHash = hashPassword(password);

        db.get(
            'SELECT * FROM users WHERE (nickname = ? OR email = ?) AND password_hash = ?',
            [username, username, passwordHash],
            (err, user) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Ошибка сервера' }));
                } else if (!user) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Неверный логин или пароль' }));
                } else {
                    const token = generateToken();
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 1));

                    db.run(
                        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
                        [user.id, token, expiresAt.toISOString()],
                        (err) => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ message: 'Ошибка создания сессии' }));
                            } else {
                                db.run(
                                    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                                    [user.id]
                                );

                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    message: 'Вход выполнен',
                                    token: token,
                                    username: user.nickname,
                                    balance: user.balance
                                }));
                            }
                        }
                    );
                }
            }
        );
    }
    // Получение профиля
    else if (url === '/api/profile' && req.method === 'GET') {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Требуется авторизация' }));
            return;
        }

        db.get(
            `SELECT u.* FROM users u 
             JOIN sessions s ON u.id = s.user_id 
             WHERE s.token = ? AND s.expires_at > datetime('now')`,
            [token],
            (err, user) => {
                if (err || !user) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Неверный токен' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        nickname: user.nickname,
                        email: user.email,
                        balance: user.balance,
                        totalDonated: user.total_donated,
                        createdAt: user.created_at
                    }));
                }
            }
        );
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'API endpoint не найден' }));
    }
}

// Создание сервера
const server = http.createServer((req, res) => {
    const url = req.url;

    // API запросы
    if (url.startsWith('/api/')) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const parsedBody = body ? JSON.parse(body) : {};
                handleApiRequest(req, res, url, parsedBody);
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Неверный формат данных' }));
            }
        });
        return;
    }

    // Статические файлы
    let filePath = '.' + url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Файл не найден</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Ошибка сервера: ' + error.code, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📝 Откройте браузер и перейдите по адресу выше\n`);
    console.log(`🔐 База данных: endercore.db`);
    console.log(`📊 API endpoints:`);
    console.log(`   POST /api/register - Регистрация`);
    console.log(`   POST /api/login - Вход`);
    console.log(`   GET  /api/profile - Профиль пользователя\n`);
});

// Закрытие БД при завершении
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('\n✅ База данных закрыта');
        process.exit(0);
    });
});
