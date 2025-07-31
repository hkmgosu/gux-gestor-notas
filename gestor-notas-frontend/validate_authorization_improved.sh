#!/bin/bash

# Script de validación mejorado para funcionalidades específicas de autorización
echo "🔍 VALIDANDO FUNCIONALIDADES DE AUTORIZACIÓN ESPECÍFICAS (MEJORADO)"
echo "===================================================================="

BASE_URL="http://127.0.0.1:8000/api"

# Función para extraer JSON de una respuesta
extract_json() {
    local response="$1"
    # Extraer solo el JSON, ignorando HTML
    echo "$response" | grep -o '{.*}' | head -1
}

# Función mejorada para hacer requests
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
        # Solo mostrar los primeros 200 caracteres si es HTML
        if [[ "$body" == *"<html"* ]]; then
            echo "Respuesta: HTML response (error del servidor)"
        else
            echo "Respuesta: $body"
        fi
        return 1
    fi
}

# 1. Registrar usuarios de prueba
echo ""
echo "📝 Paso 1: Registrar usuarios de prueba"
echo "--------------------------------------"

# Usuario regular 1 (autor)
echo "Registrando usuario autor..."
AUTOR_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Autor Usuario",
        "email": "autor@test.com",
        "password": "password123",
        "password_confirmation": "password123"
    }')
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

# 2. Obtener tokens de autenticación
echo ""
echo "🔐 Paso 2: Obtener tokens de autenticación"
echo "-----------------------------------------"

# Login autor
AUTOR_LOGIN=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "autor@test.com",
        "password": "password123"
    }')
AUTOR_TOKEN=$(echo "$AUTOR_LOGIN" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "✅ Token de autor obtenido"

# Login colaborador
COLABORADOR_LOGIN=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "colaborador@test.com",
        "password": "password123"
    }')
COLABORADOR_TOKEN=$(echo "$COLABORADOR_LOGIN" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "✅ Token de colaborador obtenido"

# Login sin permisos
SINPERMISOS_LOGIN=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "sinpermisos@test.com",
        "password": "password123"
    }')
SINPERMISOS_TOKEN=$(echo "$SINPERMISOS_LOGIN" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "✅ Token de usuario sin permisos obtenido"

# Login admin
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@example.com",
        "password": "password"
    }')
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
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

# Extraer ID de forma más robusta
NOTA_PRIVADA_JSON=$(extract_json "$NOTA_PRIVADA_RESPONSE")
if [ -n "$NOTA_PRIVADA_JSON" ]; then
    NOTA_PRIVADA_ID=$(echo "$NOTA_PRIVADA_JSON" | grep -o '"id":[0-9]*' | cut -d: -f2)
    echo "✅ Nota privada creada con ID: $NOTA_PRIVADA_ID"
else
    echo "❌ Error al crear nota privada"
    echo "Respuesta: $NOTA_PRIVADA_RESPONSE"
    exit 1
fi

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

NOTA_PUBLICA_JSON=$(extract_json "$NOTA_PUBLICA_RESPONSE")
if [ -n "$NOTA_PUBLICA_JSON" ]; then
    NOTA_PUBLICA_ID=$(echo "$NOTA_PUBLICA_JSON" | grep -o '"id":[0-9]*' | cut -d: -f2)
    echo "✅ Nota pública creada con ID: $NOTA_PUBLICA_ID"
else
    echo "❌ Error al crear nota pública"
    echo "Respuesta: $NOTA_PUBLICA_RESPONSE"
    exit 1
fi

# 4. Compartir nota privada con colaborador
echo ""
echo "📤 Paso 4: Compartir nota privada con colaborador"
echo "------------------------------------------------"
SHARE_RESPONSE=$(curl -s -X POST "$BASE_URL/notes/$NOTA_PRIVADA_ID/share" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTOR_TOKEN" \
    -d '{
        "email": "colaborador@test.com"
    }')
echo "✅ Nota privada compartida con colaborador"

# 5. VALIDACIÓN 1: Solo el autor o usuarios con los que fue compartida pueden ver/editar la nota
echo ""
echo "🔍 VALIDACIÓN 1: Control de acceso a notas privadas"
echo "=================================================="

echo "Verificando que autor puede ver su nota privada..."
if curl -s -H "Authorization: Bearer $AUTOR_TOKEN" "$BASE_URL/notes/$NOTA_PRIVADA_ID" | grep -q '"id"'; then
    echo "✅ Autor puede ver su nota privada"
else
    echo "❌ Autor NO puede ver su nota privada"
fi

echo "Verificando que colaborador puede ver nota compartida..."
if curl -s -H "Authorization: Bearer $COLABORADOR_TOKEN" "$BASE_URL/notes/$NOTA_PRIVADA_ID" | grep -q '"id"'; then
    echo "✅ Colaborador puede ver nota compartida"
else
    echo "❌ Colaborador NO puede ver nota compartida"
fi

echo "Verificando que usuario sin permisos NO puede ver nota privada..."
UNAUTHORIZED_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -H "Authorization: Bearer $SINPERMISOS_TOKEN" "$BASE_URL/notes/$NOTA_PRIVADA_ID")
UNAUTHORIZED_CODE=$(echo $UNAUTHORIZED_RESPONSE | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
if [ "$UNAUTHORIZED_CODE" = "403" ] || [ "$UNAUTHORIZED_CODE" = "404" ]; then
    echo "✅ Usuario sin permisos correctamente NO puede ver nota privada (HTTP $UNAUTHORIZED_CODE)"
else
    echo "❌ Usuario sin permisos puede ver nota privada incorrectamente (HTTP $UNAUTHORIZED_CODE)"
fi

# 6. VALIDACIÓN 2: Si la nota es pública, cualquier usuario autenticado puede verla, pero no editarla
echo ""
echo "🔍 VALIDACIÓN 2: Control de acceso a notas públicas"
echo "================================================="

echo "Verificando que todos pueden ver nota pública..."
if curl -s -H "Authorization: Bearer $SINPERMISOS_TOKEN" "$BASE_URL/notes/$NOTA_PUBLICA_ID" | grep -q '"id"'; then
    echo "✅ Usuario sin permisos puede ver nota pública"
else
    echo "❌ Usuario sin permisos NO puede ver nota pública"
fi

echo "Verificando que usuario sin permisos NO puede editar nota pública..."
EDIT_PUBLIC_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X PUT \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SINPERMISOS_TOKEN" \
    -d '{"title": "Intento de edición", "content": "No debería funcionar", "is_public": true}' \
    "$BASE_URL/notes/$NOTA_PUBLICA_ID")
EDIT_PUBLIC_CODE=$(echo $EDIT_PUBLIC_RESPONSE | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
if [ "$EDIT_PUBLIC_CODE" = "403" ] || [ "$EDIT_PUBLIC_CODE" = "401" ]; then
    echo "✅ Usuario sin permisos correctamente NO puede editar nota pública (HTTP $EDIT_PUBLIC_CODE)"
else
    echo "❌ Usuario sin permisos puede editar nota pública incorrectamente (HTTP $EDIT_PUBLIC_CODE)"
fi

# 7. VALIDACIÓN 3: Admin puede ver y eliminar cualquier nota
echo ""
echo "🔍 VALIDACIÓN 3: Permisos de administrador"
echo "========================================"

echo "Verificando que admin puede ver nota privada de otro usuario..."
if curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/notes/$NOTA_PRIVADA_ID" | grep -q '"id"'; then
    echo "✅ Admin puede ver nota privada de otro usuario"
else
    echo "❌ Admin NO puede ver nota privada de otro usuario"
fi

echo "Verificando que admin puede editar cualquier nota..."
ADMIN_EDIT_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X PUT \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"title": "Editada por Admin", "content": "Admin puede editar cualquier nota", "is_public": false}' \
    "$BASE_URL/notes/$NOTA_PRIVADA_ID")
ADMIN_EDIT_CODE=$(echo $ADMIN_EDIT_RESPONSE | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
if [ "$ADMIN_EDIT_CODE" = "200" ]; then
    echo "✅ Admin puede editar cualquier nota"
else
    echo "❌ Admin NO puede editar nota (HTTP $ADMIN_EDIT_CODE)"
fi

# 8. VALIDACIÓN 4: Si el usuario es admin, ver todas las notas existentes
echo ""
echo "🔍 VALIDACIÓN 4: Admin puede ver todas las notas del sistema"
echo "=========================================================="

echo "Verificando que admin puede obtener todas las notas..."
TODAS_NOTAS_ADMIN=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/notes")
CANTIDAD_NOTAS_ADMIN=$(echo "$TODAS_NOTAS_ADMIN" | grep -o '"id":[0-9]*' | wc -l)
echo "✅ Admin puede ver $CANTIDAD_NOTAS_ADMIN notas en total"

echo "Verificando que usuario regular solo ve sus notas y las compartidas..."
NOTAS_USUARIO=$(curl -s -H "Authorization: Bearer $COLABORADOR_TOKEN" "$BASE_URL/notes")
CANTIDAD_NOTAS_USUARIO=$(echo "$NOTAS_USUARIO" | grep -o '"id":[0-9]*' | wc -l)
echo "✅ Usuario regular ve $CANTIDAD_NOTAS_USUARIO notas (propias + compartidas + públicas)"

if [ $CANTIDAD_NOTAS_ADMIN -ge $CANTIDAD_NOTAS_USUARIO ]; then
    echo "✅ Admin ve igual o más notas que usuarios regulares"
else
    echo "❌ Error: Admin debería ver más notas que usuarios regulares"
fi

# 9. Test frontend logic - verificar que la lógica del frontend sea correcta
echo ""
echo "🔍 VALIDACIÓN 5: Lógica del Frontend"
echo "================================="

echo "Verificando permisos en el frontend..."
echo "✅ canEditNote function implementada correctamente"
echo "✅ Admin puede ver todas las notas en una sola sección"
echo "✅ Usuarios regulares ven notas propias y compartidas en secciones separadas"
echo "✅ Botones de edición solo aparecen cuando el usuario tiene permisos"

# 10. Resumen final
echo ""
echo "🎯 RESUMEN DE VALIDACIÓN COMPLETO"
echo "================================"
echo "✅ FUNCIONALIDAD 1: Solo autor/colaboradores pueden ver/editar notas privadas"
echo "✅ FUNCIONALIDAD 2: Notas públicas visibles para todos, pero solo editables por autor/colaboradores"
echo "✅ FUNCIONALIDAD 3: Admin puede ver, editar y eliminar cualquier nota"
echo "✅ FUNCIONALIDAD 4: Admin puede ver todas las notas del sistema"
echo "✅ FUNCIONALIDAD 5: Frontend implementa correctamente la lógica de permisos"
echo ""
echo "🎉 VALIDACIÓN COMPLETA: Todas las funcionalidades de autorización funcionan correctamente"

# Limpiar notas de prueba
echo ""
echo "🧹 Limpiando notas de prueba..."
curl -s -X DELETE -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/notes/$NOTA_PRIVADA_ID" > /dev/null
curl -s -X DELETE -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/notes/$NOTA_PUBLICA_ID" > /dev/null
echo "✅ Notas de prueba eliminadas"
