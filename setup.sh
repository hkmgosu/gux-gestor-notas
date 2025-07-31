#!/bin/bash

echo "🚀 Iniciando setup del Gestor de Notas..."

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
fi

# Generar APP_KEY y JWT_SECRET
echo "🔑 Generando claves de aplicación..."
docker-compose run --rm backend php artisan key:generate
docker-compose run --rm backend php artisan jwt:secret

# Construir e iniciar contenedores
echo "🏗️ Construyendo contenedores..."
docker-compose up --build -d

# Esperar a que MySQL esté listo
echo "⏳ Esperando a que MySQL esté listo..."
sleep 30

# Ejecutar migraciones
echo "📊 Ejecutando migraciones de base de datos..."
docker-compose exec backend php artisan migrate --force

# Ejecutar seeders (opcional)
echo "🌱 Ejecutando seeders..."
docker-compose exec backend php artisan db:seed --force

echo "🎉 ¡Setup completado!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:8000/api"
echo "🗄️ phpMyAdmin: http://localhost:8080"
echo ""
echo "Para detener los servicios: docker-compose down"
echo "Para ver logs: docker-compose logs -f"
