# ==========================
# 🏗️ Etapa de construcción
# ==========================
FROM node:18-alpine AS build

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias e instalarlas
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la app para producción
RUN npm run build


# ==========================
# 🚀 Etapa de producción
# ==========================
FROM nginx:alpine

# Copiar el archivo de configuración de Nginx (plantilla con variables)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copiar los archivos compilados del build anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Variables de entorno (puedes cambiarlas en tu Docker run o Docker Compose)
ENV PORT=80
ENV BACKEND_URL=http://localhost:8080

# Exponer el puerto del contenedor
EXPOSE 80

# Nginx usará automáticamente las variables definidas arriba gracias al sistema de plantillas
CMD ["nginx", "-g", "daemon off;"]
