# MultiBank - Инструкция для хакатона

## Краткое описание проекта

**MultiBank** - мультибанковский финансовый агрегатор, который объединяет данные из разных банков через Open Banking API и предоставляет пользователям единую картину их финансов с аналитикой, прогнозированием и управлением бюджетом.

## Ключевые особенности

✅ **Агрегация счетов** - объединение всех счетов из разных банков  
✅ **Финансовая аналитика** - анализ расходов по категориям, тренды, графики  
✅ **Управление бюджетом** - создание и отслеживание бюджетов по категориям  
✅ **Прогнозирование** - прогноз баланса на основе исторических данных  
✅ **Монетизация** - система подписок (Free, Premium, Business)  

## Технологический стек

- **Backend**: Go 1.21, Gin, GORM, PostgreSQL
- **Frontend**: React, Vite, TailwindCSS, Recharts
- **API**: Open Banking API (sandbox: https://vbank.open.bankingapi.ru)
- **Безопасность**: OAuth 2.0, AES-GCM шифрование токенов

## Быстрый старт

### 1. Клонирование и настройка

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd VTB

# Создайте .env файл в корне проекта
cat > .env << EOF
DATABASE_URL=postgres://postgres:postgres@db:5432/multibank?sslmode=disable
PORT=8080
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_REDIRECT_URL=http://localhost:8080/api/connect/callback
SANDBOX_BASE_URL=https://vbank.open.bankingapi.ru
ENCRYPTION_KEY=32-byte-long-encryption-key-12345678
EOF
```

### 2. Запуск через Docker Compose

```bash
docker-compose up -d
```

Сервисы будут доступны:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

### 3. Локальный запуск

**Backend:**
```bash
cd backend
go mod download
go run ./cmd/api/main.go
```

**Frontend:**
```bash
cd frontend/m
npm install
npm run dev
```

## Демонстрация функционала

1. **Регистрация и вход**
   - Откройте http://localhost:3000
   - Зарегистрируйте нового пользователя
   - Войдите в систему

2. **Подключение банка**
   - Перейдите в раздел "Банки"
   - Выберите банк для подключения
   - Пройдите OAuth авторизацию
   - Синхронизируйте данные

3. **Просмотр дашборда**
   - Откройте главную страницу
   - Просмотрите общий баланс
   - Изучите аналитику расходов
   - Проверьте статус бюджетов

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Банки
- `GET /api/banks` - Список банков
- `POST /api/connect/:bank` - Подключение банка
- `GET /api/connect/callback` - OAuth callback
- `POST /api/sync/:userbank` - Синхронизация данных

### Dashboard
- `GET /api/dashboard/summary` - Финансовая сводка
- `GET /api/dashboard/transactions` - Транзакции
- `GET /api/dashboard/analytics` - Аналитика расходов

### Подписки
- `GET /api/subscription` - Информация о подписке
- `POST /api/subscription` - Создание/обновление подписки

## Бизнес-модель

**Freemium с подписками:**
- **Free**: До 2 банков, базовая аналитика, 30 дней истории
- **Premium** (299₽/мес): Неограниченные банки, расширенная аналитика, экспорт данных
- **Business** (999₽/мес): API доступ, многопользовательский доступ, интеграции

## Архитектура

- **Модульная структура** - легко добавлять новые банки
- **Масштабируемая архитектура** - stateless API, горизонтальное масштабирование
- **Безопасность** - шифрование токенов, OAuth 2.0, обработка ошибок

## Обработка ошибок

Система корректно обрабатывает:
- Истечение токенов
- Ошибки авторизации (401)
- Превышение лимитов запросов (429)
- Недоступность сервисов банков (503)
- Ошибки расшифровки токенов

## Документация

- `README.md` - Полная инструкция по установке и запуску
- `PROJECT_DESCRIPTION.md` - Подробное описание проекта
- `QUICKSTART.md` - Быстрый старт

## Контакты

Для вопросов и поддержки обращайтесь к команде разработки.

