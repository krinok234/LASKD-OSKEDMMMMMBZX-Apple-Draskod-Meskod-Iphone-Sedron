# EnderCore - Донат Сайт

Десктопное приложение для покупки доната на сервере Minecraft EnderCore, созданное на Rust + Tauri.

## Установка зависимостей

### 1. Установите Rust
```bash
# Windows
# Скачайте и установите с https://rustup.rs/
```

### 2. Установите Node.js
```bash
# Скачайте с https://nodejs.org/
```

### 3. Установите зависимости проекта
```bash
npm install
```

## Запуск приложения

### Режим разработки
```bash
npm run dev
```

### Сборка приложения
```bash
npm run build
```

Готовое приложение будет в папке `src-tauri/target/release/`

## Функционал

- ✅ Красивый интерфейс в стиле Minecraft
- ✅ Три категории привилегий (Survival, Minigames, Hardcore)
- ✅ Система промокодов
- ✅ Отображение последних покупок
- ✅ Отзывы игроков
- ✅ Адаптивный дизайн

## Настройка

Для интеграции с платежной системой отредактируйте функцию `handlePayment()` в файле `script.js`

## Структура проекта

```
endercore-donate/
├── index.html          # Главная страница
├── styles.css          # Стили
├── script.js           # JavaScript логика
├── package.json        # Node.js зависимости
├── src-tauri/          # Rust/Tauri бэкенд
│   ├── Cargo.toml      # Rust зависимости
│   ├── tauri.conf.json # Конфигурация Tauri
│   └── src/
│       └── main.rs     # Главный файл Rust
└── README.md           # Документация
```

## Лицензия

Создано для сервера EnderCore
