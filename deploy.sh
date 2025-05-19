#!/bin/bash

# Цвета для вывода сообщений
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Имя контейнера и образ
CONTAINER_NAME="tsgn-container"
IMAGE_NAME="tsgn-gen"
PORT="8181"

# Git репозиторий
GITREP="https://github.com/dfyzicka/tSiGen.git"

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}[INFO] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Проверка зависимостей
log "Проверка зависимостей..."
command -v docker >/dev/null 2>&1 || error "Docker не установлен. Установите Docker и попробуйте снова."
command -v git >/dev/null 2>&1 || error "Git не установлен. Установите Git и попробуйте снова."

# 1. Переходим в домашнюю директорию
log "Переход в домашнюю директорию..."
cd ~ || error "Не удалось перейти в домашнюю директорию"

# 2. Удаляем папку sigen, если она существует
log "Удаление папки sigen..."
if [ -d "sigen" ]; then
    rm -rf sigen || error "Не удалось удалить папку sigen"
else
    log "Папка sigen не существует, пропускаем удаление"
fi

# 3. Останавливаем и удаляем контейнер signature-container, если он существует
log "Остановка и удаление контейнера $CONTAINER_NAME..."
if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    docker stop "$CONTAINER_NAME" || error "Не удалось остановить контейнер $CONTAINER_NAME"
    docker rm "$CONTAINER_NAME" || error "Не удалось удалить контейнер $CONTAINER_NAME"
elif docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
    docker rm "$CONTAINER_NAME" || error "Не удалось удалить остановленный контейнер $CONTAINER_NAME"
else
    log "Контейнер $CONTAINER_NAME не существует, пропускаем"
fi

# 4. Удаляем Docker-образ signature-gen, если он существует
log "Удаление Docker-образа $IMAGE_NAME..."
if docker images -q "$IMAGE_NAME" | grep -q .; then
    docker rmi "$IMAGE_NAME" || error "Не удалось удалить образ $IMAGE_NAME"
else
    log "Образ $IMAGE_NAME не существует, пропускаем"
fi

# 5. Клонируем репозиторий с GitHub
log "Клонирование репозитория с GitHub..."
git clone $GITREP || error "Не удалось клонировать репозиторий"

# 6. Переходим в папку sigen
log "Переход в папку sigen..."
cd sigen || error "Не удалось перейти в папку sigen"

# 7. Сборка Docker-образа и запуск контейнера
log "Сборка Docker-образа $IMAGE_NAME..."
docker build -t "$IMAGE_NAME" . || error "Не удалось собрать Docker-образ"

log "Запуск контейнера $CONTAINER_NAME на порту $PORT..."
docker run -d -p "$PORT":80 --name "$CONTAINER_NAME" --restart always "$IMAGE_NAME" || error "Не удалось запустить контейнер"

# 8. Проверка, что контейнер запущен
log "Проверка состояния контейнера..."
if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    log "Контейнер $CONTAINER_NAME успешно запущен!"
    log "Приложение доступно по адресу: http://localhost:$PORT"
else
    error "Контейнер $CONTAINER_NAME не запустился, проверьте логи: docker logs $CONTAINER_NAME"
fi

# 9. Вывод логов для отладки
log "Вывод последних 10 строк логов контейнера..."
docker logs --tail 10 "$CONTAINER_NAME"
