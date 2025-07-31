# 📝 Gestor de Notas - Backend API

Un sistema completo de gestión de notas con autenticación JWT, compartición entre usuarios y permisos avanzados, desarrollado en Laravel 11.

## 🚀 Características

- ✅ **Autenticación JWT** con mensajes en español
- ✅ **CRUD completo de notas** con validaciones
- ✅ **Sistema de compartición** entre usuarios
- ✅ **Permisos granulares** (admin, propietario, usuario compartido)
- ✅ **Validación robusta** de IDs y datos
- ✅ **Mensajes de error en español**
- ✅ **Tests comprehensivos** (49 tests, 121 aserciones)
- ✅ **CI/CD con GitHub Actions**
- ✅ **Análisis de código** con PHPStan y Laravel Pint

## 🛠️ Tecnologías

- **Laravel 11** - Framework PHP
- **JWT Authentication** (tymon/jwt-auth v2.2)
- **MySQL** - Base de datos
- **PHPUnit** - Testing
- **GitHub Actions** - CI/CD
- **Laravel Pint** - Code styling
- **PHPStan** - Static analysis

## 📋 Endpoints API

### 🔒 Autenticación
```http
POST /api/register    # Registrar usuario
POST /api/login       # Iniciar sesión
POST /api/logout      # Cerrar sesión
GET  /api/me          # Perfil de usuario
```

### 📝 Gestión de Notas
```http
GET    /api/notes              # Listar notas del usuario
POST   /api/notes              # Crear nueva nota
PUT    /api/notes/{id}         # Actualizar nota
DELETE /api/notes/{id}         # Eliminar nota
POST   /api/notes/{id}/share   # Compartir nota
GET    /api/notes/shared       # Ver notas compartidas
```

### 🔍 Debug
```http
GET /api/notes/{id}/permissions # Verificar permisos de nota
```

## 🚀 Instalación

### Prerrequisitos
- PHP 8.4+
- Composer
- MySQL
- Node.js (opcional, para frontend)

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/TU_USUARIO/gestor-notas-backend.git
cd gestor-notas-backend
```

2. **Instalar dependencias**
```bash
composer install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

4. **Generar claves de aplicación**
```bash
php artisan key:generate
php artisan jwt:secret
```

5. **Configurar base de datos**
Edita `.env` con tus credenciales de MySQL:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestor_notas
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
```

6. **Ejecutar migraciones y seeders**
```bash
php artisan migrate --seed
```

7. **Iniciar servidor**
```bash
php artisan serve
```

## 👤 Usuarios Pre-creados

El seeder crea usuarios de prueba:

- **Administrador**: `admin@example.com` / `admin123`
- **Usuario Test**: `test@example.com` / `password`

## 🧪 Testing

### Ejecutar todos los tests
```bash
php artisan test
```

### Ejecutar tests específicos
```bash
php artisan test tests/Feature/NoteTest.php
php artisan test tests/Feature/IDValidationTest.php
```

### Coverage actual
- **49 tests** ejecutándose
- **121 aserciones** validadas
- Cobertura completa de funcionalidades

## 📁 Estructura del Proyecto

```
app/
├── Http/Controllers/
│   ├── AuthController.php      # Autenticación JWT
│   └── NoteController.php      # Gestión de notas
└── Models/
    ├── User.php               # Modelo de usuario
    └── Note.php               # Modelo de nota

tests/
├── Feature/
│   ├── AuthTest.php           # Tests de autenticación
│   ├── NoteTest.php           # Tests de notas
│   ├── SharedNoteEditTest.php # Tests de compartición
│   └── IDValidationTest.php   # Tests de validación
└── Unit/
    ├── UserModelTest.php      # Tests del modelo User
    └── NoteModelTest.php      # Tests del modelo Note

database/
├── migrations/                # Migraciones de BD
├── seeders/                   # Datos iniciales
└── factories/                 # Factories para testing
```

## 🔧 Configuración Adicional

### Variables de entorno importantes
```env
APP_NAME=GestorNotas
APP_LOCALE=es
JWT_SECRET=tu_jwt_secret_aqui
```

### Permisos de usuario
- **admin**: Puede ver y editar todas las notas
- **user**: Puede ver sus notas, notas públicas y notas compartidas con él

## 🔍 Validaciones Implementadas

### Validación de IDs
- ✅ Solo acepta IDs numéricos positivos en rutas
- ✅ Manejo de IDs extremadamente grandes
- ✅ Respuestas HTTP apropiadas (400, 404)
- ✅ Mensajes de error descriptivos en español

### Validación de datos
- ✅ Campos requeridos para notas (título, contenido)
- ✅ Validación de email para compartir
- ✅ Validación de permisos antes de operaciones

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🐛 Reportar Bugs

Si encuentras algún bug, por favor abre un issue con:
- Descripción detallada del problema
- Pasos para reproducir
- Versión de PHP y Laravel
- Logs relevantes

## 📞 Soporte

Para soporte o preguntas:
- Abre un issue en GitHub
- Revisa la documentación de tests para ejemplos de uso

---

Desarrollado con ❤️ usando Laravel 11
