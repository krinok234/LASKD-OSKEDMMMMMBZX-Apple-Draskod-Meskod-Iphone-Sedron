# Настройка системы авторизации

## Установка зависимостей

```bash
npm install sqlite3
```

## Запуск сервера с базой данных

```bash
npm run start:auth
```

Сервер запустится на http://localhost:3000

## Структура базы данных

### Таблица `users`
- `id` - уникальный ID пользователя
- `nickname` - игровой никнейм (уникальный)
- `email` - email (уникальный)
- `password_hash` - хеш пароля (SHA-256)
- `created_at` - дата регистрации
- `last_login` - последний вход
- `balance` - баланс пользователя
- `total_donated` - всего пожертвовано

### Таблица `purchases`
- `id` - ID покупки
- `user_id` - ID пользователя
- `privilege_name` - название привилегии
- `privilege_category` - категория (survival/minigames/hardcore)
- `price` - цена
- `purchase_date` - дата покупки

### Таблица `sessions`
- `id` - ID сессии
- `user_id` - ID пользователя
- `token` - токен авторизации
- `created_at` - дата создания
- `expires_at` - дата истечения

## API Endpoints

### POST /api/register
Регистрация нового пользователя

**Body:**
```json
{
  "nickname": "Player123",
  "email": "player@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "message": "Регистрация успешна",
  "userId": 1
}
```

### POST /api/login
Вход в систему

**Body:**
```json
{
  "username": "Player123",
  "password": "securepassword",
  "rememberMe": true
}
```

**Response (200):**
```json
{
  "message": "Вход выполнен",
  "token": "abc123...",
  "username": "Player123",
  "balance": 0
}
```

### GET /api/profile
Получение профиля пользователя

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "nickname": "Player123",
  "email": "player@example.com",
  "balance": 0,
  "totalDonated": 0,
  "createdAt": "2026-02-02 12:00:00"
}
```

## Безопасность

✅ Пароли хешируются с помощью SHA-256
✅ Токены генерируются криптографически безопасным способом
✅ Сессии имеют срок действия (1 день или 30 дней с "Запомнить меня")
✅ SQL-инъекции предотвращены параметризованными запросами
✅ Уникальность email и никнейма на уровне БД

## Использование

1. Откройте http://localhost:3000/auth.html
2. Зарегистрируйтесь или войдите
3. После входа токен сохраняется в localStorage
4. Используйте токен для авторизованных запросов

## База данных

Файл базы данных: `endercore.db`

Для просмотра БД используйте:
- DB Browser for SQLite
- SQLite Studio
- Или командную строку: `sqlite3 endercore.db`

## Интеграция с донатом

После авторизации можно:
- Привязать покупки к пользователю
- Отслеживать историю покупок
- Показывать баланс
- Давать бонусы постоянным клиентам
