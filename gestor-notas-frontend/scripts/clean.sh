#!/bin/bash

# Script de limpieza del proyecto
echo "🧹 Limpiando proyecto..."

# Eliminar directorios de build y caché
echo "Eliminando archivos de build..."
rm -rf .next
rm -rf .swc
rm -rf coverage
rm -rf dist
rm -rf out

# Eliminar archivos temporales
echo "Eliminando archivos temporales..."
find . -name "*.log" -delete 2>/dev/null
find . -name "*.tmp" -delete 2>/dev/null
find . -name "*.temp" -delete 2>/dev/null
find . -name "*~" -delete 2>/dev/null
find . -name "*.swp" -delete 2>/dev/null
find . -name "*.swo" -delete 2>/dev/null

# Eliminar archivos de sistema
echo "Eliminando archivos de sistema..."
find . -name ".DS_Store" -delete 2>/dev/null
find . -name "Thumbs.db" -delete 2>/dev/null

echo "✅ Limpieza completada!"
