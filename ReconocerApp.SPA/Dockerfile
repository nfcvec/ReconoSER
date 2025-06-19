# Usar una imagen base de Node.js
FROM node:22 as build

# Establecer el directorio de trabajo
WORKDIR /app

# Pasar argumentos de entorno desde el docker-compose
ARG SKIP_PREFLIGHT_CHECK
ARG BROWSER
ARG VITE_CLIENT_ID
ARG VITE_AUTHORITY
ARG VITE_POPUP_REDIRECT_URI
ARG VITE_TITLE
ARG VITE_API_URL

# Establecer las variables de entorno
ENV SKIP_PREFLIGHT_CHECK=$SKIP_PREFLIGHT_CHECK
ENV BROWSER=$BROWSER
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
ENV VITE_AUTHORITY=$VITE_AUTHORITY
ENV VITE_POPUP_REDIRECT_URI=$VITE_POPUP_REDIRECT_URI
ENV VITE_TITLE=$VITE_TITLE
ENV VITE_API_URL=$VITE_API_URL

# Copiar los archivos necesarios
COPY package*.json ./

# Eliminar node_modules y package-lock.json si existen
RUN rm -rf node_modules package-lock.json

# Instalar las dependencias
RUN npm install --loglevel=verbose

# Copiar el resto del código de la aplicación
COPY . .

# Construir la aplicación
RUN npm run build

# Usar una imagen base de Node.js para servir la aplicación
FROM node:22-alpine

# Instalar 'serve' globalmente
RUN npm install -g serve

# Copiar los archivos construidos desde la etapa anterior
COPY --from=build /app/dist /app/dist

# Establecer el directorio de trabajo
WORKDIR /app

# Exponer el puerto en el que la aplicación se ejecutará
EXPOSE 3000

# Comando para ejecutar 'serve'
CMD ["serve", "-s", "dist", "-l", "3000"]