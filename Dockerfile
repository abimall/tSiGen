# Базовый образ с Nginx
FROM nginx:alpine

# Копируем все файлы проекта в папку Nginx
COPY . /usr/share/nginx/html

# Открываем порт 80
EXPOSE 80
