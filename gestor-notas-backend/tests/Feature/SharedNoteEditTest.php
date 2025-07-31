<?php

namespace Tests\Feature;

use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class SharedNoteEditTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_user_can_edit_note_shared_with_them()
    {
        // Crear dos usuarios
        $owner = User::factory()->create(['email' => 'owner@test.com']);
        $sharedUser = User::factory()->create(['email' => 'shared@test.com']);
        
        // El propietario crea una nota
        $note = Note::factory()->create([
            'user_id' => $owner->id,
            'title' => 'Nota Original',
            'content' => 'Contenido Original',
            'shared_with' => ['shared@test.com']
        ]);

        // El usuario compartido obtiene token
        $token = auth('api')->login($sharedUser);

        // El usuario compartido intenta editar la nota
        $updateData = [
            'title' => 'Título Editado por Usuario Compartido',
            'content' => 'Contenido Editado por Usuario Compartido',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/notes/{$note->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'title' => 'Título Editado por Usuario Compartido',
                    'content' => 'Contenido Editado por Usuario Compartido',
                ]);

        // Verificar que la nota se actualizó en la base de datos
        $this->assertDatabaseHas('notes', [
            'id' => $note->id,
            'title' => 'Título Editado por Usuario Compartido',
            'content' => 'Contenido Editado por Usuario Compartido',
        ]);
    }

    public function test_user_cannot_edit_note_not_shared_with_them()
    {
        // Crear tres usuarios
        $owner = User::factory()->create(['email' => 'owner@test.com']);
        $sharedUser = User::factory()->create(['email' => 'shared@test.com']);
        $otherUser = User::factory()->create(['email' => 'other@test.com']);
        
        // El propietario crea una nota compartida solo con un usuario específico
        $note = Note::factory()->create([
            'user_id' => $owner->id,
            'title' => 'Nota Original',
            'content' => 'Contenido Original',
            'shared_with' => ['shared@test.com'] // Solo compartida con shared@test.com
        ]);

        // El otro usuario (no compartido) obtiene token
        $token = auth('api')->login($otherUser);

        // El usuario NO compartido intenta editar la nota
        $updateData = [
            'title' => 'Intento de Edición No Autorizada',
            'content' => 'Este contenido no debería guardarse',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/notes/{$note->id}", $updateData);

        $response->assertStatus(403)
                ->assertJsonStructure(['error']);

        // Verificar que la nota NO se actualizó
        $this->assertDatabaseHas('notes', [
            'id' => $note->id,
            'title' => 'Nota Original',
            'content' => 'Contenido Original',
        ]);
    }

    public function test_check_permissions_endpoint_works()
    {
        // Crear dos usuarios
        $owner = User::factory()->create(['email' => 'owner@test.com']);
        $sharedUser = User::factory()->create(['email' => 'shared@test.com']);
        
        // El propietario crea una nota compartida
        $note = Note::factory()->create([
            'user_id' => $owner->id,
            'shared_with' => ['shared@test.com']
        ]);

        // El usuario compartido obtiene token
        $token = auth('api')->login($sharedUser);

        // Verificar permisos usando el endpoint de debug
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson("/api/notes/{$note->id}/permissions");

        $response->assertStatus(200)
                ->assertJson([
                    'can_edit' => true,
                    'permissions' => [
                        'is_admin' => false,
                        'is_owner' => false,
                        'is_shared_with_user' => true,
                    ]
                ]);
    }

    public function test_admin_can_edit_any_note()
    {
        // Crear usuario admin y usuario regular
        $admin = User::factory()->admin()->create();
        $regularUser = User::factory()->create(['email' => 'user@test.com']);
        
        // Usuario regular crea una nota privada
        $note = Note::factory()->create([
            'user_id' => $regularUser->id,
            'title' => 'Nota Privada',
            'content' => 'Contenido Privado',
            'shared_with' => [] // No compartida
        ]);

        // Admin obtiene token
        $token = auth('api')->login($admin);

        // Admin edita la nota
        $updateData = [
            'title' => 'Editado por Admin',
            'content' => 'Contenido editado por admin',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/notes/{$note->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'title' => 'Editado por Admin',
                    'content' => 'Contenido editado por admin',
                ]);
    }
}
