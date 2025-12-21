# 🚀 QuickGPT - Ваш персональный ИИ-ассистент
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow![Node.js](https://img.shields.io/badge/Node.js-v20-green![React](https://img.shields.io/badge/React-18-blueQuickGPT — полнофункциональный чат-бот на базе искусственного интеллекта с системой кредитов, галереей и поддержкой платежей через ЮKassa. Создавайте чаты, генерируйте текст и изображения, управляйте балансом кредитов.

## ✨ Основные возможности

### 🎭 Чат с ИИ — неограниченные беседы с мощными языковыми моделями
### 🖼️ Генерация изображений — создавайте уникальные арты по текстовым описаниям
### 💳 Система кредитов — покупайте планы (Стандарт, Премиум, Ультра)
### 🏦 ЮKassa платежи — безопасная оплата с автоматическим начислением
### 🌙 Темная тема — адаптивный дизайн для комфортной работы
### 📱 Адаптивный UI — работает на всех устройствах

## 🛠️ Технологический стек
### Frontend	Backend	База данных	Инструменты
### React 18	Node.js	MongoDB	TailwindCSS
### React Hot Toast	Express.js	Mongoose	Axios
### React Router	JWT Auth		Vercel
### React Context	ЮKassa API		Git/GitHub

## 🚀 Быстрый старт

### Предварительные требования
#### Node.js 18+
#### MongoDB (локально или MongoDB Atlas)
#### ЮKassa тестовые ключи (опционально)

## Установка

### Клонируйте репозиторий

### git clone https://github.com/artEvg/QuickGPT.git
### cd QuickGPT

## Установите зависимости

### cd client && npm install
### cd ../server && npm install

## Создайте .env файлы

### cd server/.env.example server/.env
### cd client/.env.example client/.env

## Настройка переменных окружения

### server/.env:
#### PORT=5000
#### MONGODB_URI=your_mongodb_connection_string
#### JWT_SECRET=your_jwt_secret
#### YUKASSA_SHOP_ID=your_shop_id
#### YUKASSA_SECRET_KEY=your_secret_key
#### BASE_URL=http://localhost:3000

### client/.env:
#### VITE_SERVER_URL=http://localhost:5000

## Запуск проекта

### Backend (новый терминал)
#### cd server
#### npm run dev

### Frontend (новый терминал)  
#### cd client
#### npm run dev

### 🌐 Frontend: http://localhost:3000
### 🔧 Backend: http://localhost:5000

## 📁 Структура проекта

### QuickGPT/
### ├── client/              # React Frontend
### │   ├── src/
### │   │   ├── components/  # UI компоненты
### │   │   ├── context/     # React Context
### │   │   ├── pages/       # Страницы (Credits, Chat, Login)
### │   │   └── assets/      # Статические файлы
### ├── server/              # Node.js Backend
### │   ├── controllers/     # Бизнес-логика
### │   ├── models/          # Mongoose схемы
### │   ├── middlewares/     # Middleware (auth)
### │   ├── routes/          # API роуты
### │   └── server.js        # Express сервер
### └── README.md

## 💳 Планы кредитов

### План	Цена	Кредиты	Возможности
### Стандарт	499 ₽	100	100 текстов + 50 изображений
### Премиум	999 ₽	500	PRO модели + приоритет
### Ультра	1499 ₽	1000	VIP поддержка + менеджер

## 🤝 Как внести вклад

### Форкните репозиторий
### Создайте ветку git checkout -b feature/AmazingFeature
### Зафиксируйте изменения git commit -m 'Add some AmazingFeature'
### Запушьте в ветку git push origin feature/AmazingFeature
### Откройте Pull Request

## 🐛 Возможные проблемы

### Проблема	Решение
#### userId required	Проверьте JWT токен и creditController.js
#### EMFILE: too many open files	Закройте лишние вкладки VS Code
#### ЮKassa не работает	Используйте тестовые ключи

## 📄 Лицензия
### Этот проект лицензирован по MIT License - см. файл LICENSE для деталей.

## 🙏 Благодарности
### ЮKassa — платежная система
### TailwindCSS — стилизация
### React Hot Toast — уведомления

## ⭐ Если проект полезен — поставьте звезду!
## 📢 Поделитесь с друзьями-разработчиками
## 💬 Вопросы? Создайте Issue!
