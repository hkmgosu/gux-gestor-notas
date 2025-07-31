# Gestor de Notas

Una aplicación completa de gestión de notas con frontend en Next.js y backend en Laravel, todo dockerizado para facilitar el desarrollo y despliegue.

## 🏗️ Arquitectura

- **Frontend**: Next.js 15 con React 19, TypeScript y Tailwind CSS
- **Backend**: Laravel 12 con PHP 8.2, API REST y autenticación JWT
- **Base de datos**: MySQL 8.0
- **Containerización**: Docker & Docker Compose

## 📁 Estructura del Proyecto

```
gestor-notas/
├── gestor-notas-frontend/     # Aplicación Next.js
├── gestor-notas-backend/      # API Laravel
├── docker-compose.yml         # Configuración Docker para producción
├── docker-compose.dev.yml     # Configuración Docker para desarrollo
├── setup.sh                   # Script de setup para producción
├── setup-dev.sh              # Script de setup para desarrollo
└── README.md                  # Esta documentación
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker Desktop instalado y corriendo
- Git

### Configuración para Desarrollo

1. **Clonar el repositorio**:
   ```bash
   git clone <tu-repositorio>
   cd gestor-notas
   ```

2. **Ejecutar el script de desarrollo**:
   ```bash
   chmod +x setup-dev.sh
   ./setup-dev.sh
   ```

3. **Acceder a la aplicación**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - phpMyAdmin: http://localhost:8080

### Configuración para Producción

1. **Ejecutar el script de producción**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

## 🐳 Comandos Docker

### Desarrollo

```bash
# Iniciar servicios
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Detener servicios
docker-compose -f docker-compose.dev.yml down

# Acceder al contenedor backend
docker-compose -f docker-compose.dev.yml exec backend bash

# Acceder al contenedor frontend
docker-compose -f docker-compose.dev.yml exec frontend sh

# Ejecutar migraciones
docker-compose -f docker-compose.dev.yml exec backend php artisan migrate

# Ejecutar tests del backend
docker-compose -f docker-compose.dev.yml exec backend php artisan test

# Ejecutar tests del frontend
docker-compose -f docker-compose.dev.yml exec frontend npm test
```

### Producción

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reconstruir contenedores
docker-compose up --build -d
```

## 🔧 Configuración

### Variables de Entorno

#### Backend (.env)
Las principales variables que necesitas configurar:

```env
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:your-app-key-here
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=gestor_notas
DB_USERNAME=gestor_user
DB_PASSWORD=gestor_password
JWT_SECRET=your-jwt-secret-here
```

#### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Base de Datos

La configuración de MySQL por defecto:
- **Host**: localhost:3306
- **Database**: gestor_notas
- **Usuario**: gestor_user
- **Contraseña**: gestor_password
- **Root Password**: root_password

## 📊 Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Frontend | 3000 | Aplicación Next.js |
| Backend | 8000 | API Laravel |
| MySQL | 3306 | Base de datos |
| phpMyAdmin | 8080 | Administrador de BD |

## 🧪 Testing

### Backend (Laravel)
```bash
docker-compose -f docker-compose.dev.yml exec backend php artisan test
```

### Frontend (Next.js)
```bash
docker-compose -f docker-compose.dev.yml exec frontend npm test
```

## 📝 Desarrollo

### Agregar Dependencias

#### Backend
```bash
docker-compose -f docker-compose.dev.yml exec backend composer require package-name
```

#### Frontend
```bash
docker-compose -f docker-compose.dev.yml exec frontend npm install package-name
```

### Migraciones de Base de Datos

```bash
# Crear migración
docker-compose -f docker-compose.dev.yml exec backend php artisan make:migration create_table_name

# Ejecutar migraciones
docker-compose -f docker-compose.dev.yml exec backend php artisan migrate

# Rollback
docker-compose -f docker-compose.dev.yml exec backend php artisan migrate:rollback
```

## 🐛 Troubleshooting

### Error: "Docker no está corriendo"
- Asegúrate de que Docker Desktop esté iniciado

### Error: "Puerto ya en uso"
- Verifica que no tengas otros servicios corriendo en los puertos 3000, 8000, 3306, o 8080

### Error de conexión a la base de datos
- Espera unos segundos más para que MySQL termine de inicializar
- Verifica las credenciales en el archivo .env

### Frontend no se conecta al backend
- Verifica que la variable `NEXT_PUBLIC_API_URL` esté correctamente configurada

### Error: "failed to solve: Unavailable: error reading from server: EOF"
- Este error puede ocurrir durante la instalación de dependencias de npm
- Solución: Ejecutar `docker system prune -f` y volver a intentar
- Alternativamente: `docker-compose down` y `docker-compose up --build`

### Error: "Couldn't find any `pages` or `app` directory"
- Este error ocurre cuando Next.js trata de ejecutar lint antes de copiar el código
- Los Dockerfiles están optimizados para evitar este problema usando `--ignore-scripts`
- Si persiste: Verificar que el directorio `src/pages` existe en el frontend

### Error durante npm ci en el contenedor
- Verificar que el archivo `package.json` no tenga scripts `prepare` problemáticos
- Los Dockerfiles usan `--ignore-scripts` para evitar estos problemas
- Si necesitas ejecutar scripts manualmente: `docker-compose exec frontend npm run <script>`

### Advertencia: "the attribute `version` is obsolete"
- Esta advertencia es normal en versiones recientes de Docker Compose
- Los archivos ya están actualizados para evitar esta advertencia

### Error de permisos en Windows
- Si tienes problemas con permisos, ejecuta Docker Desktop como administrador
- Asegúrate de que WSL2 esté habilitado si usas Docker Desktop en Windows

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
