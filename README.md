# MultiBank - Мультибанковский финансовый агрегатор

## Описание проекта

MultiBank - это платформа для агрегации финансовых данных из различных банков через Open Banking API. Проект предоставляет пользователям единую картину их финансов, аналитику расходов, прогнозирование и управление бюджетом.

**Основные функции:**
- Агрегация счетов и карт из разных банков
- Финансовая аналитика и визуализация данных
- Управление бюджетом и категориями расходов
- Прогнозирование баланса
- Система подписок (Free, Premium, Business)

**Бизнес-модель:** Freemium с подписками (299₽/мес Premium, 999₽/мес Business)

Подробное описание проекта см. в файле `PROJECT_DESCRIPTION.md`

## Требования

- Go 1.21 или выше
- Node.js 18+ и npm
- PostgreSQL 14+
- Docker и Docker Compose (опционально)

## Вариант 1: Запуск через Docker Compose (рекомендуется)

### 1. Создайте файл `.env` в корне проекта:

```env
# Database
DATABASE_URL=postgres://postgres:postgres@db:5432/multibank?sslmode=disable

# Server
PORT=8080

# OAuth (для работы с банками)
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_REDIRECT_URL=http://localhost:8080/api/connect/callback
SANDBOX_BASE_URL=https://vbank.open.bankingapi.ru

# Encryption
ENCRYPTION_KEY=32-byte-long-encryption-key-12345678
```

### 2. Создайте Dockerfile для backend:

Создайте файл `backend/Dockerfile`:

```dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main ./cmd/api

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
```

### 3. Создайте Dockerfile для frontend:

Создайте файл `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY m/package*.json ./
RUN npm install

COPY m/ .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 4. Запустите через Docker Compose:

```bash
docker-compose up -d
```

Сервисы будут доступны:
- Backend: http://localhost:8080
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432

## Вариант 2: Локальный запуск

### Backend

1. Установите зависимости:

```bash
cd backend
go mod download
```

2. Создайте файл `.env` в папке `backend/`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/multibank?sslmode=disable
PORT=8080
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_REDIRECT_URL=http://localhost:8080/api/connect/callback
SANDBOX_BASE_URL=https://vbank.open.bankingapi.ru
ENCRYPTION_KEY=32-byte-long-encryption-key-12345678
```

3. Запустите PostgreSQL (если еще не запущен):

```bash
# Через Docker
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=multibank \
  -p 5432:5432 \
  postgres:14

# Или используйте локальный PostgreSQL
```

4. Запустите backend:

```bash
cd backend
go run ./cmd/api/main.go
```

Backend будет доступен на http://localhost:8080

### Frontend

1. Установите зависимости:

```bash
cd frontend/m
npm install
```

2. Создайте файл `.env` в папке `frontend/m/`:

```env
VITE_API_URL=http://localhost:8080/api
```

3. Запустите frontend:

```bash
cd frontend/m
npm run dev
```

Frontend будет доступен на http://localhost:3000

## Проверка работы

1. Откройте http://localhost:3000 в браузере
2. Зарегистрируйте нового пользователя
3. Войдите в систему
4. Попробуйте подключить банк

## API Endpoints

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/banks` - Список банков
- `POST /api/connect/:bank` - Подключение банка
- `GET /api/connect/callback` - Callback для OAuth
- `POST /api/sync/:userbank` - Синхронизация данных банка
- `GET /api/accounts` - Список счетов
- `GET /api/accounts/:id/transactions` - Транзакции счета

## Примечания

- Для работы с реальными банками необходимо получить `OAUTH_CLIENT_ID` и `OAUTH_CLIENT_SECRET` от провайдера Open Banking API
- `ENCRYPTION_KEY` должен быть ровно 32 байта для AES-256
- В демо-режиме используется заголовок `X-Demo-User` для идентификации пользователя

