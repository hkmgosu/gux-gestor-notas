# Usar Node.js 18
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código de la aplicación
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer puerto 3000
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
