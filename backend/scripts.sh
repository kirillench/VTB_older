#!/bin/bash

# Скрипт для управления бэкенд сервером

case "$1" in
    start)
        echo "🚀 Запуск сервера..."
        cd "$(dirname "$0")/.."
        go run ./cmd/api/main.go &
        sleep 2
        if lsof -ti:8080 >/dev/null 2>&1; then
            echo "✅ Сервер запущен на http://localhost:8080"
            echo "PID: $(lsof -ti:8080)"
        else
            echo "❌ Ошибка запуска сервера"
        fi
        ;;
    stop)
        echo "🛑 Остановка сервера..."
        PID=$(lsof -ti:8080 2>/dev/null)
        if [ -n "$PID" ]; then
            kill $PID
            echo "✅ Сервер остановлен (PID: $PID)"
        else
            echo "⚠️ Сервер не запущен"
        fi
        ;;
    restart)
        $0 stop
        sleep 1
        $0 start
        ;;
    status)
        PID=$(lsof -ti:8080 2>/dev/null)
        if [ -n "$PID" ]; then
            echo "✅ Сервер запущен (PID: $PID)"
            echo "URL: http://localhost:8080"
        else
            echo "⚠️ Сервер не запущен"
        fi
        ;;
    logs)
        echo "📋 Логи сервера (последние 50 строк):"
        tail -50 /tmp/multibank.log 2>/dev/null || echo "Логи не найдены"
        ;;
    *)
        echo "Использование: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Команды:"
        echo "  start   - Запустить сервер"
        echo "  stop    - Остановить сервер"
        echo "  restart - Перезапустить сервер"
        echo "  status  - Проверить статус сервера"
        echo "  logs    - Показать логи"
        exit 1
        ;;
esac

