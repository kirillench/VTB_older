# Инструкция по запуску фронтенда

## Быстрый старт

```bash
cd frontend/m
npm install --legacy-peer-deps
npm run dev
```

Фронтенд будет доступен на: http://localhost:3000

## Остановка

```bash
# Найти процесс
lsof -ti:3000

# Остановить
kill $(lsof -ti:3000)
```

## Переменные окружения

Файл `.env` уже создан с настройками:
```
VITE_API_URL=http://localhost:8080/api
```

## Структура проекта

- `src/` - исходный код
- `public/` - статические файлы
- `index.html` - главная HTML страница
- `vite.config.js` - конфигурация Vite
- `tailwind.config.js` - конфигурация Tailwind CSS
- `postcss.config.cjs` - конфигурация PostCSS

## Команды

- `npm run dev` - запуск dev сервера
- `npm run build` - сборка для production
- `npm run preview` - предпросмотр production сборки

