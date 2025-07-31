# Makefile para Gestor de Notas

.PHONY: help dev prod stop logs clean test

# Mostrar ayuda por defecto
help:
	@echo "🚀 Gestor de Notas - Comandos disponibles:"
	@echo ""
	@echo "  dev      - Iniciar entorno de desarrollo"
	@echo "  prod     - Iniciar entorno de producción"
	@echo "  stop     - Detener todos los servicios"
	@echo "  logs     - Mostrar logs en tiempo real"
	@echo "  clean    - Limpiar contenedores e imágenes"
	@echo "  test     - Ejecutar tests"
	@echo "  migrate  - Ejecutar migraciones"
	@echo "  seed     - Ejecutar seeders"
	@echo "  install  - Instalar dependencias"
	@echo ""

# Entorno de desarrollo
dev:
	@echo "🚀 Iniciando entorno de desarrollo..."
	./setup-dev.sh

# Entorno de producción
prod:
	@echo "🚀 Iniciando entorno de producción..."
	./setup.sh

# Detener servicios
stop:
	@echo "⏹️ Deteniendo servicios..."
	docker-compose -f docker-compose.dev.yml down
	docker-compose down

# Ver logs
logs:
	@echo "📋 Mostrando logs..."
	docker-compose -f docker-compose.dev.yml logs -f

# Limpiar todo
clean: stop
	@echo "🧹 Limpiando contenedores e imágenes..."
	docker system prune -f
	docker volume prune -f

# Ejecutar tests
test:
	@echo "🧪 Ejecutando tests del backend..."
	docker-compose -f docker-compose.dev.yml exec backend php artisan test
	@echo "🧪 Ejecutando tests del frontend..."
	docker-compose -f docker-compose.dev.yml exec frontend npm test

# Ejecutar migraciones
migrate:
	@echo "📊 Ejecutando migraciones..."
	docker-compose -f docker-compose.dev.yml exec backend php artisan migrate

# Ejecutar seeders
seed:
	@echo "🌱 Ejecutando seeders..."
	docker-compose -f docker-compose.dev.yml exec backend php artisan db:seed

# Instalar dependencias
install:
	@echo "📦 Instalando dependencias del backend..."
	docker-compose -f docker-compose.dev.yml exec backend composer install
	@echo "📦 Instalando dependencias del frontend..."
	docker-compose -f docker-compose.dev.yml exec frontend npm install

# Acceso a contenedores
backend-shell:
	@echo "🐚 Accediendo al contenedor backend..."
	docker-compose -f docker-compose.dev.yml exec backend bash

frontend-shell:
	@echo "🐚 Accediendo al contenedor frontend..."
	docker-compose -f docker-compose.dev.yml exec frontend sh

# Comandos de Laravel comunes
artisan:
	docker-compose -f docker-compose.dev.yml exec backend php artisan $(filter-out $@,$(MAKECMDGOALS))

# Comandos de npm comunes
npm:
	docker-compose -f docker-compose.dev.yml exec frontend npm $(filter-out $@,$(MAKECMDGOALS))

%:
	@:
