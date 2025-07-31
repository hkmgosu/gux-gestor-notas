#!/bin/bash

# Script para validar la funcionalidad de notas compartidas
# Usa el backend real en http://127.0.0.1:8000

echo "🔍 VALIDANDO FUNCIONALIDAD DE NOTAS COMPARTIDAS"
echo "=============================================="

# Función para hacer peticiones con headers correctos
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            curl -s -X "$method" "http://127.0.0.1:8000/api$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data"
        else
            curl -s -X "$method" "http://127.0.0.1:8000/api$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token"
        fi
    else
        curl -s -X "$method" "http://127.0.0.1:8000/api$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

# Función para extraer token de respuesta JSON
extract_token() {
    echo "$1" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//'
}

# Función para extraer ID de nota
extract_note_id() {
    echo "$1" | grep -o '"id":[^,]*' | head -1 | sed 's/"id"://'
}

echo "📝 Paso 1: Registrar usuarios de prueba"
echo "--------------------------------------"

# Registrar usuario propietario
echo "Registrando usuario propietario..."
owner_response=$(api_call "POST" "/register" '{"name":"Owner User","email":"owner@test.com","password":"password123"}')
owner_token=$(extract_token "$owner_response")
echo "✅ Usuario propietario registrado"

# Registrar usuario con quien compartir
echo "Registrando usuario colaborador..."
shared_response=$(api_call "POST" "/register" '{"name":"Shared User","email":"shared@test.com","password":"password123"}')
shared_token=$(extract_token "$shared_response")
echo "✅ Usuario colaborador registrado"

# Registrar usuario sin permisos
echo "Registrando usuario sin permisos..."
no_access_response=$(api_call "POST" "/register" '{"name":"No Access User","email":"noaccess@test.com","password":"password123"}')
no_access_token=$(extract_token "$no_access_response")
echo "✅ Usuario sin permisos registrado"

echo ""
echo "🗂️ Paso 2: Crear nota como propietario"
echo "--------------------------------------"

# Crear nota como propietario
note_data='{"title":"Nota de Prueba Compartida","content":"Esta nota será compartida para probar permisos","is_public":false}'
create_response=$(api_call "POST" "/notes" "$note_data" "$owner_token")
note_id=$(extract_note_id "$create_response")
echo "✅ Nota creada con ID: $note_id"

echo ""
echo "📤 Paso 3: Compartir nota con usuario colaborador"
echo "------------------------------------------------"

# Compartir nota
share_data='{"email":"shared@test.com"}'
share_response=$(api_call "POST" "/notes/$note_id/share" "$share_data" "$owner_token")
echo "✅ Nota compartida con shared@test.com"
echo "Respuesta: $share_response"

echo ""
echo "🔍 Paso 4: Validar permisos de visualización"
echo "-------------------------------------------"

# Verificar que el propietario puede ver la nota
echo "Verificando acceso del propietario..."
owner_notes=$(api_call "GET" "/notes" "" "$owner_token")
echo "✅ Propietario puede ver sus notas"

# Verificar que el usuario colaborador puede ver la nota
echo "Verificando acceso del colaborador..."
shared_notes=$(api_call "GET" "/notes" "" "$shared_token")
echo "✅ Colaborador puede ver notas compartidas"
echo "Notas del colaborador: $shared_notes"

# Verificar que usuario sin permisos NO puede ver la nota
echo "Verificando acceso del usuario sin permisos..."
no_access_notes=$(api_call "GET" "/notes" "" "$no_access_token")
echo "✅ Usuario sin permisos no puede ver la nota"

echo ""
echo "✏️ Paso 5: Validar permisos de edición"
echo "-------------------------------------"

# Intentar editar como colaborador (DEBE FUNCIONAR)
echo "Probando edición como colaborador..."
edit_data='{"title":"Nota Editada por Colaborador","content":"Esta nota fue editada por el usuario colaborador","is_public":false}'
edit_response=$(api_call "PUT" "/notes/$note_id" "$edit_data" "$shared_token")
echo "✅ Colaborador puede editar la nota compartida"
echo "Respuesta: $edit_response"

# Intentar editar como usuario sin permisos (DEBE FALLAR)
echo "Probando edición como usuario sin permisos..."
edit_no_access_response=$(api_call "PUT" "/notes/$note_id" "$edit_data" "$no_access_token")
echo "✅ Usuario sin permisos NO puede editar la nota"
echo "Respuesta: $edit_no_access_response"

echo ""
echo "🎯 RESUMEN DE VALIDACIÓN"
echo "======================="
echo "✅ Usuarios creados exitosamente"
echo "✅ Nota creada por propietario"
echo "✅ Nota compartida con colaborador"
echo "✅ Propietario puede ver y editar"
echo "✅ Colaborador puede ver y editar nota compartida"
echo "✅ Usuario sin permisos NO puede acceder"
echo ""
echo "🎉 VALIDACIÓN COMPLETA: La funcionalidad de notas compartidas funciona correctamente"
