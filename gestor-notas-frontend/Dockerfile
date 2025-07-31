# Usar Node.js 18
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    git \
    libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Configurar npm para usar caché y timeouts más largos
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 3

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias sin ejecutar scripts
RUN npm install --only=production --ignore-scripts

# Copiar el código de la aplicación
COPY . .

# Instalar dependencias de desarrollo solo para build
RUN npm install --ignore-scripts

# Construir la aplicación
RUN npm run build

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Cambiar permisos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto 3000
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
