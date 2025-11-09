# Быстрый старт

## Самый простой способ - Docker Compose

1. **Создайте файл `.env` в корне проекта:**

```bash
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

2. **Запустите все сервисы:**

```bash
docker-compose up -d
```

3. **Откройте в браузере:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## Локальный запуск (без Docker)

### Backend

```bash
# 1. Запустите PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=multibank \
  -p 5432:5432 \
  postgres:14

# 2. Создайте .env в backend/
cd backend
cat > .env << EOF
DATABASE_URL=postgres://postgres:postgres@localhost:5432/multibank?sslmode=disable
PORT=8080
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_REDIRECT_URL=http://localhost:8080/api/connect/callback
SANDBOX_BASE_URL=https://vbank.open.bankingapi.ru
ENCRYPTION_KEY=32-byte-long-encryption-key-12345678
EOF

# 3. Установите зависимости и запустите
go mod download
go run ./cmd/api/main.go
```

### Frontend

```bash
# 1. Перейдите в папку frontend
cd frontend/m

# 2. Создайте .env
cat > .env << EOF
VITE_API_URL=http://localhost:8080/api
EOF

# 3. Установите зависимости и запустите
npm install
npm run dev
```

## Проверка работы

1. Откройте http://localhost:3000
2. Зарегистрируйте нового пользователя
3. Войдите в систему
4. Попробуйте подключить банк

## Остановка

```bash
# Docker Compose
docker-compose down

# Локальный PostgreSQL
docker stop postgres && docker rm postgres
```

