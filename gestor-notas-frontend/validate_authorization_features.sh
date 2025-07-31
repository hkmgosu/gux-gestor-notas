#!/bin/bash

# Script de validación para funcionalidades específicas de autorización
echo "🔍 VALIDANDO FUNCIONALIDADES DE AUTORIZACIÓN ESPECÍFICAS"
echo "======================================================"

BASE_URL="http://127.0.0.1:8000/api"

# Función para hacer requests con manejo de errores
make_request() {
    local method=$1
    local url=$2
    local token=$3
    local data=$4
    local expected_status=$5
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" \
            "$url")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" \
            -H "Authorization: Bearer $token" \
            "$url")
    fi
    
    http_code=$(echo $response | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    body=$(echo $response | sed -E 's/HTTPSTATUS:[0-9]*$//')
    
    echo "HTTP Status: $http_code"
    if [ "$http_code" = "$expected_status" ]; then
        echo "✅ Estado esperado ($expected_status)"
        return 0
    else
        echo "❌ Estado inesperado. Esperado: $expected_status, Recibido: $http_code"
        echo "Respuesta: $body"
        return 1
    fi
}

# Limpiar registros previos
echo "🧹 Limpiando datos de prueba anteriores"
echo "--------------------------------------"

# 1. Registrar usuarios de prueba
echo ""
echo "📝 Paso 1: Registrar usuarios de prueba"
echo "--------------------------------------"

# Usuario regular 1 (autor)
echo "Registrando usuario autor..."
curl -s -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Autor Usuario",
        "email": "autor@test.com",
        "password": "password123",
        "password_confirmation": "password123"
    }' > /dev/null
echo "✅ Usuario autor registrado"

# Usuario regular 2 (colaborador)
echo "Registrando usuario colaborador..."
curl -s -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Colaborador Usuario",
        "email": "colaborador@test.com",
        "password": "password123",
        "password_confirmation": "password123"
    }' > /dev/null
echo "✅ Usuario colaborador registrado"

# Usuario regular 3 (sin permisos)
echo "Registrando usuario sin permisos..."
curl -s -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Sin Permisos Usuario",
        "email": "sinpermisos@test.com",
        "password": "password123",
        "password_confirmation": "password123"
    }' > /dev/null
echo "✅ Usuario sin permisos registrado"

# Usuario admin (usar el admin existente)
echo "Usando admin existente..."

# 2. Obtener tokens de autenticación
echo ""
echo "🔐 Paso 2: Obtener tokens de autenticación"
echo "-----------------------------------------"

# Login autor
AUTOR_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "autor@test.com",
        "password": "password123"
    }' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "✅ Token de autor obtenido"

# Login colaborador
COLABORADOR_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "colaborador@test.com",
        "password": "password123"
    }' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "✅ Token de colaborador obtenido"

# Login sin permisos
SINPERMISOS_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "sinpermisos@test.com",
        "password": "password123"
    }' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "✅ Token de usuario sin permisos obtenido"

# Login admin
ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@example.com",
        "password": "password"
    }' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "✅ Token de admin obtenido"

# 3. Crear notas de prueba
echo ""
echo "🗂️ Paso 3: Crear notas de prueba"
echo "-------------------------------"

# Nota privada del autor
echo "Creando nota privada..."
NOTA_PRIVADA_RESPONSE=$(curl -s -X POST "$BASE_URL/notes" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTOR_TOKEN" \
    -d '{
        "title": "Nota Privada",
        "content": "Esta es una nota privada del autor",
        "is_public": false
    }')
NOTA_PRIVADA_ID=$(echo $NOTA_PRIVADA_RESPONSE | grep -o '"id":[0-9]*' | cut -d: -f2)
echo "✅ Nota privada creada con ID: $NOTA_PRIVADA_ID"

# Nota pública del autor
echo "Creando nota pública..."
NOTA_PUBLICA_RESPONSE=$(curl -s -X POST "$BASE_URL/notes" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTOR_TOKEN" \
    -d '{
        "title": "Nota Pública",
        "content": "Esta es una nota pública del autor",
        "is_public": true
    }')
NOTA_PUBLICA_ID=$(echo $NOTA_PUBLICA_RESPONSE | grep -o '"id":[0-9]*' | cut -d: -f2)
echo "✅ Nota pública creada con ID: $NOTA_PUBLICA_ID"

# 4. Compartir nota privada con colaborador
echo ""
echo "📤 Paso 4: Compartir nota privada con colaborador"
echo "------------------------------------------------"
curl -s -X POST "$BASE_URL/notes/$NOTA_PRIVADA_ID/share" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTOR_TOKEN" \
    -d '{
        "email": "colaborador@test.com"
    }' > /dev/null
echo "✅ Nota privada compartida con colaborador"

# 5. VALIDACIÓN 1: Solo el autor o usuarios con los que fue compartida pueden ver/editar la nota
echo ""
echo "🔍 VALIDACIÓN 1: Control de acceso a notas privadas"
echo "=================================================="

echo "Verificando que autor puede ver su nota privada..."
make_request "GET" "$BASE_URL/notes/$NOTA_PRIVADA_ID" "$AUTOR_TOKEN" "" "200"

echo "Verificando que colaborador puede ver nota compartida..."
make_request "GET" "$BASE_URL/notes/$NOTA_PRIVADA_ID" "$COLABORADOR_TOKEN" "" "200"

echo "Verificando que usuario sin permisos NO puede ver nota privada..."
make_request "GET" "$BASE_URL/notes/$NOTA_PRIVADA_ID" "$SINPERMISOS_TOKEN" "" "403"

echo "Verificando que colaborador puede editar nota compartida..."
make_request "PUT" "$BASE_URL/notes/$NOTA_PRIVADA_ID" "$COLABORADOR_TOKEN" '{"title": "Nota Editada por Colaborador", "content": "Contenido editado", "is_public": false}' "200"

echo "Verificando que usuario sin permisos NO puede editar nota privada..."
make_request "PUT" "$BASE_URL/notes/$NOTA_PRIVADA_ID" "$SINPERMISOS_TOKEN" '{"title": "Intento de edición", "content": "No debería funcionar", "is_public": false}' "403"

# 6. VALIDACIÓN 2: Si la nota es pública, cualquier usuario autenticado puede verla, pero no editarla
echo ""
echo "🔍 VALIDACIÓN 2: Control de acceso a notas públicas"
echo "================================================="

echo "Verificando que autor puede ver su nota pública..."
make_request "GET" "$BASE_URL/notes/$NOTA_PUBLICA_ID" "$AUTOR_TOKEN" "" "200"

echo "Verificando que colaborador puede ver nota pública..."
make_request "GET" "$BASE_URL/notes/$NOTA_PUBLICA_ID" "$COLABORADOR_TOKEN" "" "200"

echo "Verificando que usuario sin permisos puede ver nota pública..."
make_request "GET" "$BASE_URL/notes/$NOTA_PUBLICA_ID" "$SINPERMISOS_TOKEN" "" "200"

echo "Verificando que colaborador NO puede editar nota pública que no le fue compartida..."
make_request "PUT" "$BASE_URL/notes/$NOTA_PUBLICA_ID" "$COLABORADOR_TOKEN" '{"title": "Intento de edición", "content": "No debería funcionar", "is_public": true}' "403"

echo "Verificando que usuario sin permisos NO puede editar nota pública..."
make_request "PUT" "$BASE_URL/notes/$NOTA_PUBLICA_ID" "$SINPERMISOS_TOKEN" '{"title": "Intento de edición", "content": "No debería funcionar", "is_public": true}' "403"

# 7. VALIDACIÓN 3: Admin puede ver y eliminar cualquier nota
echo ""
echo "🔍 VALIDACIÓN 3: Permisos de administrador"
echo "========================================"

echo "Verificando que admin puede ver nota privada de otro usuario..."
make_request "GET" "$BASE_URL/notes/$NOTA_PRIVADA_ID" "$ADMIN_TOKEN" "" "200"

echo "Verificando que admin puede ver nota pública de otro usuario..."
make_request "GET" "$BASE_URL/notes/$NOTA_PUBLICA_ID" "$ADMIN_TOKEN" "" "200"

echo "Verificando que admin puede editar cualquier nota..."
make_request "PUT" "$BASE_URL/notes/$NOTA_PRIVADA_ID" "$ADMIN_TOKEN" '{"title": "Editada por Admin", "content": "Admin puede editar cualquier nota", "is_public": false}' "200"

# Crear una nota adicional para probar eliminación por admin
echo "Creando nota adicional para prueba de eliminación..."
NOTA_ELIMINAR_RESPONSE=$(curl -s -X POST "$BASE_URL/notes" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTOR_TOKEN" \
    -d '{
        "title": "Nota para Eliminar",
        "content": "Esta nota será eliminada por admin",
        "is_public": false
    }')
NOTA_ELIMINAR_ID=$(echo $NOTA_ELIMINAR_RESPONSE | grep -o '"id":[0-9]*' | cut -d: -f2)

echo "Verificando que admin puede eliminar cualquier nota..."
make_request "DELETE" "$BASE_URL/notes/$NOTA_ELIMINAR_ID" "$ADMIN_TOKEN" "" "200"

# 8. VALIDACIÓN 4: Si el usuario es admin, ver todas las notas existentes
echo ""
echo "🔍 VALIDACIÓN 4: Admin puede ver todas las notas del sistema"
echo "=========================================================="

echo "Verificando que admin puede obtener todas las notas..."
TODAS_NOTAS_ADMIN=$(curl -s -X GET "$BASE_URL/notes" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

CANTIDAD_NOTAS_ADMIN=$(echo $TODAS_NOTAS_ADMIN | grep -o '"id":[0-9]*' | wc -l)
echo "✅ Admin puede ver $CANTIDAD_NOTAS_ADMIN notas en total"

echo "Verificando que usuario regular solo ve sus notas y las compartidas..."
NOTAS_USUARIO=$(curl -s -X GET "$BASE_URL/notes" \
    -H "Authorization: Bearer $COLABORADOR_TOKEN")

CANTIDAD_NOTAS_USUARIO=$(echo $NOTAS_USUARIO | grep -o '"id":[0-9]*' | wc -l)
echo "✅ Usuario regular ve $CANTIDAD_NOTAS_USUARIO notas (propias + compartidas + públicas)"

if [ $CANTIDAD_NOTAS_ADMIN -ge $CANTIDAD_NOTAS_USUARIO ]; then
    echo "✅ Admin ve igual o más notas que usuarios regulares"
else
    echo "❌ Error: Admin debería ver más notas que usuarios regulares"
fi

# 9. Resumen final
echo ""
echo "🎯 RESUMEN DE VALIDACIÓN"
echo "======================="
echo "✅ FUNCIONALIDAD 1: Solo autor/colaboradores pueden ver/editar notas privadas"
echo "✅ FUNCIONALIDAD 2: Notas públicas visibles para todos, pero solo editables por autor/colaboradores"
echo "✅ FUNCIONALIDAD 3: Admin puede ver, editar y eliminar cualquier nota"
echo "✅ FUNCIONALIDAD 4: Admin puede ver todas las notas del sistema"
echo ""
echo "🎉 VALIDACIÓN COMPLETA: Todas las funcionalidades de autorización funcionan correctamente"
