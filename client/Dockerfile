# Используем официальный образ Node.js
FROM node:18 AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект в контейнер
COPY . .

# Собираем проект
RUN npm run build

# Используем nginx для статического хостинга
FROM nginx:alpine

# Копируем собранные файлы из предыдущего шага
COPY --from=build /app/dist /usr/share/nginx/html

# Открываем порт для nginx
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
