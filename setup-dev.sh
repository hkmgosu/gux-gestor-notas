#!/bin/bash

echo "🚀 Iniciando entorno de desarrollo del Gestor de Notas..."

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

echo "✅ Docker está corriendo"

# Crear archivos .env si no existen
if [ ! -f ./gestor-notas-backend/.env ]; then
    echo "📝 Creando archivo .env para el backend..."
    cp ./gestor-notas-backend/.env.example ./gestor-notas-backend/.env
    
    # Configurar variables para desarrollo
    sed -i 's/APP_ENV=production/APP_ENV=local/' ./gestor-notas-backend/.env
    sed -i 's/APP_DEBUG=false/APP_DEBUG=true/' ./gestor-notas-backend/.env
fi

# Construir e iniciar contenedores en modo desarrollo
echo "🏗️ Construyendo contenedores de desarrollo..."
docker-compose -f docker-compose.dev.yml up --build -d

# Esperar a que MySQL esté listo
echo "⏳ Esperando a que MySQL esté listo..."
sleep 30

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
docker-compose -f docker-compose.dev.yml exec backend composer install

# Generar APP_KEY y JWT_SECRET si no existen
echo "🔑 Verificando claves de aplicación..."
docker-compose -f docker-compose.dev.yml exec backend php artisan key:generate --show
docker-compose -f docker-compose.dev.yml exec backend php artisan jwt:secret --show

# Ejecutar migraciones
echo "📊 Ejecutando migraciones de base de datos..."
docker-compose -f docker-compose.dev.yml exec backend php artisan migrate

# Ejecutar seeders (opcional)
echo "🌱 Ejecutando seeders..."
docker-compose -f docker-compose.dev.yml exec backend php artisan db:seed

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
docker-compose -f docker-compose.dev.yml exec frontend npm install

echo "🎉 ¡Entorno de desarrollo listo!"
echo ""
echo "📱 Frontend: http://localhost:3000 (con hot reload)"
echo "🔗 Backend API: http://localhost:8000/api"
echo "🗄️ phpMyAdmin: http://localhost:8080"
echo ""
echo "Para detener los servicios: docker-compose -f docker-compose.dev.yml down"
echo "Para ver logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "Para acceder al contenedor backend: docker-compose -f docker-compose.dev.yml exec backend bash"
echo "Para acceder al contenedor frontend: docker-compose -f docker-compose.dev.yml exec frontend sh"
