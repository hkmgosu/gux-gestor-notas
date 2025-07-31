<?php

namespace Tests\Feature;

use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IDValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    private function authenticateUser()
    {
        $user = User::factory()->create();
        $token = auth('api')->login($user);
        return [$user, $token];
    }

    public function test_invalid_id_route_not_found()
    {
        [$user, $token] = $this->authenticateUser();

        // Test con ID no numérico - debería dar 404 (ruta no encontrada)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->putJson('/api/notes/abc', [
            'title' => 'Test',
            'content' => 'Content'
        ]);

        $response->assertStatus(404);
    }

    public function test_zero_id_route_not_found()
    {
        [$user, $token] = $this->authenticateUser();

        // Test con ID 0 - debería dar 404 (ruta no encontrada)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->putJson('/api/notes/0', [
            'title' => 'Test',
            'content' => 'Content'
        ]);

        $response->assertStatus(404);
    }

    public function test_negative_id_route_not_found()
    {
        [$user, $token] = $this->authenticateUser();

        // Test con ID negativo - debería dar 404 (ruta no encontrada)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->deleteJson('/api/notes/-1');

        $response->assertStatus(404);
    }

    public function test_very_large_id_bad_request()
    {
        [$user, $token] = $this->authenticateUser();

        // Test con ID extremadamente grande - debería dar 400 Bad Request
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->putJson('/api/notes/999999999999999999999', [
            'title' => 'Test',
            'content' => 'Content'
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'ID de nota inválido. Debe ser un número entero positivo.']);
    }

    public function test_valid_id_but_note_not_exists()
    {
        [$user, $token] = $this->authenticateUser();

        // Test con ID válido pero nota no existe - debería dar 404
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->putJson('/api/notes/99999', [
            'title' => 'Test',
            'content' => 'Content'
        ]);

        $response->assertStatus(404)
            ->assertJson(['error' => 'Nota no encontrada.']);
    }

    public function test_valid_operations_work()
    {
        [$user, $token] = $this->authenticateUser();

        // Crear una nota
        $note = Note::factory()->create(['user_id' => $user->id]);

        // Test con ID válido - debería funcionar
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->putJson("/api/notes/{$note->id}", [
            'title' => 'Título Actualizado',
            'content' => 'Contenido actualizado'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'title' => 'Título Actualizado',
                'content' => 'Contenido actualizado'
            ]);
    }

    public function test_permissions_endpoint_with_invalid_id()
    {
        [$user, $token] = $this->authenticateUser();

        // Test permissions con ID inválido
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/notes/999999999999999999999/permissions');

        $response->assertStatus(400)
            ->assertJson(['error' => 'ID de nota inválido. Debe ser un número entero positivo.']);
    }

    public function test_share_endpoint_with_invalid_id()
    {
        [$user, $token] = $this->authenticateUser();

        // Test share con ID inválido
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/notes/999999999999999999999/share', [
            'email' => 'test@example.com'
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'ID de nota inválido. Debe ser un número entero positivo.']);
    }
}
