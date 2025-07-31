#!/bin/bash

# Script para validar funcionalidad de notas compartidas
echo "🔍 Validando funcionalidad de notas compartidas con backend real en http://127.0.0.1:8000"
echo ""

# 1. Login como primer usuario
echo "1️⃣ Autenticando como test@example.com..."
LOGIN_RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}')

TOKEN1=$(echo $LOGIN_RESPONSE | jq -r '.token')
USER1=$(echo $LOGIN_RESPONSE | jq '.user')

if [ "$TOKEN1" = "null" ]; then
  echo "❌ Error: No se pudo obtener token para test@example.com"
  exit 1
fi

echo "✅ Usuario autenticado: $USER1"
echo "🔑 Token: ${TOKEN1:0:20}..."
echo ""

# 2. Crear una nota
echo "2️⃣ Creando una nota..."
CREATE_RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/notes \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"title":"Nota para Compartir","content":"Esta nota será compartida con otros usuarios","is_public":false}')

NOTE_ID=$(echo $CREATE_RESPONSE | jq -r '.id')

if [ "$NOTE_ID" = "null" ]; then
  echo "❌ Error: No se pudo crear la nota"
  echo "Respuesta: $CREATE_RESPONSE"
  exit 1
fi

echo "✅ Nota creada con ID: $NOTE_ID"
echo "📝 Título: $(echo $CREATE_RESPONSE | jq -r '.title')"
echo ""

# 3. Intentar login como segundo usuario (usuario compartido)
echo "3️⃣ Intentando autenticar como admin@example.com para compartir..."
LOGIN2_RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}')

TOKEN2=$(echo $LOGIN2_RESPONSE | jq -r '.token')

if [ "$TOKEN2" = "null" ]; then
  echo "⚠️ admin@example.com no existe, intentando crear otro usuario..."
  
  # Intentar registrar un nuevo usuario
  REGISTER_RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Usuario Compartido","email":"shared@example.com","password":"password"}')
  
  TOKEN2=$(echo $REGISTER_RESPONSE | jq -r '.token')
  USER2_EMAIL="shared@example.com"
else
  USER2_EMAIL="admin@example.com"
fi

echo "✅ Segundo usuario: $USER2_EMAIL"
echo "🔑 Token: ${TOKEN2:0:20}..."
echo ""

# 4. Compartir la nota
echo "4️⃣ Compartiendo la nota con $USER2_EMAIL..."
SHARE_RESPONSE=$(curl -s -X POST "http://127.0.0.1:8000/api/notes/$NOTE_ID/share" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER2_EMAIL\"}")

echo "📤 Respuesta de compartir: $SHARE_RESPONSE"
echo ""

# 5. Verificar que el segundo usuario puede ver la nota
echo "5️⃣ Verificando que $USER2_EMAIL puede ver la nota compartida..."
NOTES_RESPONSE=$(curl -s -X GET http://127.0.0.1:8000/api/notes \
  -H "Authorization: Bearer $TOKEN2")

echo "📋 Notas visibles para $USER2_EMAIL:"
echo $NOTES_RESPONSE | jq '.[] | {id: .id, title: .title, owner: .user.email, shared_with: .shared_with}'
echo ""

# 6. Intentar editar la nota como segundo usuario
echo "6️⃣ Intentando editar la nota como $USER2_EMAIL..."
EDIT_RESPONSE=$(curl -s -X PUT "http://127.0.0.1:8000/api/notes/$NOTE_ID" \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{"title":"Nota Editada por Usuario Compartido","content":"Esta nota fue editada por el usuario con quien fue compartida","is_public":false}')

if [ "$(echo $EDIT_RESPONSE | jq -r '.id')" = "$NOTE_ID" ]; then
  echo "✅ ÉXITO: El usuario con nota compartida pudo editarla"
  echo "📝 Nuevo título: $(echo $EDIT_RESPONSE | jq -r '.title')"
else
  echo "❌ FALLO: El usuario con nota compartida NO pudo editarla"
  echo "Respuesta: $EDIT_RESPONSE"
fi

echo ""
echo "🎯 VALIDACIÓN COMPLETADA"
