# 📝 Gestor de Notas Frontend

Sistema de gestión de notas con autenticación JWT, autorización por roles y funcionalidades de búsqueda y filtrado.

## ✨ Características

- 🔐 **Autenticación JWT** - Login/registro seguro
- 👥 **Sistema de Roles** - Usuario regular y administrador  
- 📝 **Gestión de Notas** - CRUD completo de notas
- 🤝 **Notas Compartidas** - Colaboración entre usuarios
- 🌐 **Notas Públicas** - Visibles para todos los usuarios autenticados
- 🔍 **Búsqueda y Filtrado** - Buscar por texto y filtrar por tipo
- 🎨 **Interfaz Responsive** - Diseño adaptable con Tailwind CSS
- ✅ **Tests Unitarios** - Cobertura completa con Jest

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- Backend Laravel corriendo en `http://127.0.0.1:8000`

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd gestor-notas-frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ver cobertura
npm run test:coverage
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Componentes de aplicación
│   ├── components/         # Componentes reutilizables
│   └── contexts/          # Contextos de React
├── pages/                 # Páginas de Next.js
├── styles/               # Estilos CSS
├── types/                # Definiciones TypeScript
└── __tests__/            # Tests unitarios
```

## 📚 Documentación

- [🔐 Guía de Autenticación](docs/AUTHENTICATION_GUIDE.md)
- [🏗️ Configuración Backend Laravel](docs/LARAVEL_BACKEND_SETUP.md)
- [🔍 Implementación Búsqueda/Filtros](docs/SEARCH_FILTER_IMPLEMENTATION.md)
- [🧪 Guía de Testing](docs/TESTING.md)
- [🚀 Configuración GitHub Actions](docs/GITHUB_ACTIONS_SETUP.md)

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter ESLint
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
```

## 🧹 Limpieza del Proyecto

```bash
# Ejecutar script de limpieza
chmod +x scripts/clean.sh
./scripts/clean.sh
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
