<?php

namespace Tests\Feature;

use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class NoteTest extends TestCase
{
    use RefreshDatabase;
    use WithFaker;

    private function authenticateUser($user = null)
    {
        $user = $user ?: User::factory()->create();
        $token = auth('api')->login($user);

        return [$user, $token];
    }

    private function authenticateAdmin()
    {
        $admin = User::factory()->admin()->create();
        $token = auth('api')->login($admin);

        return [$admin, $token];
    }

    public function test_user_can_create_note()
    {
        [$user, $token] = $this->authenticateUser();

        $noteData = [
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraph(),
            'is_public' => false,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/notes', $noteData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'title',
                'content',
                'is_public',
                'shared_with',
                'user_id',
                'created_at',
                'updated_at',
            ]);

        $this->assertDatabaseHas('notes', [
            'title' => $noteData['title'],
            'content' => $noteData['content'],
            'user_id' => $user->id,
            'is_public' => false,
        ]);
    }

    public function test_user_cannot_create_note_without_title()
    {
        [$user, $token] = $this->authenticateUser();

        $noteData = [
            'content' => $this->faker->paragraph(),
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/notes', $noteData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_user_cannot_create_note_without_content()
    {
        [$user, $token] = $this->authenticateUser();

        $noteData = [
            'title' => $this->faker->sentence(),
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/notes', $noteData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_user_can_view_their_own_notes()
    {
        [$user, $token] = $this->authenticateUser();

        // Create notes for this user
        $userNotes = Note::factory()->count(3)->create(['user_id' => $user->id]);

        // Create notes for other users
        Note::factory()->count(2)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/notes');

        // Solo debe ver sus propias notas (3)
        $response->assertStatus(200);
        
        $responseData = $response->json();
        $userNotesCount = collect($responseData)->where('user_id', $user->id)->count();
        
        $this->assertEquals(3, $userNotesCount, 'User should only see their own notes');
    }

    public function test_admin_can_view_all_notes()
    {
        [$admin, $token] = $this->authenticateAdmin();

        // Create notes for different users
        Note::factory()->count(5)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/notes');

        $response->assertStatus(200)
            ->assertJsonCount(5);
    }

    public function test_user_can_view_public_notes()
    {
        [$user, $token] = $this->authenticateUser();

        // Create private note for this user
        Note::factory()->create(['user_id' => $user->id, 'is_public' => false]);

        // Create public notes for other users
        Note::factory()->count(2)->create(['is_public' => true]);

        // Create private notes for other users (should not be visible)
        Note::factory()->count(2)->create(['is_public' => false]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/notes');

        $response->assertStatus(200)
            ->assertJsonCount(3); // 1 own + 2 public
    }

    public function test_user_can_update_their_own_note()
    {
        [$user, $token] = $this->authenticateUser();
        $note = Note::factory()->create(['user_id' => $user->id]);

        $updateData = [
            'title' => 'Updated Title',
            'content' => 'Updated Content',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->putJson("/api/notes/{$note->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'title' => 'Updated Title',
                'content' => 'Updated Content',
            ]);

        $this->assertDatabaseHas('notes', [
            'id' => $note->id,
            'title' => 'Updated Title',
            'content' => 'Updated Content',
        ]);
    }

    public function test_user_cannot_update_other_users_note()
    {
        [$user, $token] = $this->authenticateUser();
        $otherUser = User::factory()->create();
        $note = Note::factory()->create(['user_id' => $otherUser->id]);

        $updateData = [
            'title' => 'Updated Title',
            'content' => 'Updated Content',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->putJson("/api/notes/{$note->id}", $updateData);

        $response->assertStatus(403)
            ->assertJson(['error' => 'No autorizado. Solo el autor o usuarios con los que fue compartida pueden editar esta nota.']);
    }

    public function test_admin_can_update_any_note()
    {
        [$admin, $token] = $this->authenticateAdmin();
        $user = User::factory()->create();
        $note = Note::factory()->create(['user_id' => $user->id]);

        $updateData = [
            'title' => 'Admin Updated Title',
            'content' => 'Admin Updated Content',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->putJson("/api/notes/{$note->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'title' => 'Admin Updated Title',
                'content' => 'Admin Updated Content',
            ]);
    }

    public function test_user_can_delete_their_own_note()
    {
        [$user, $token] = $this->authenticateUser();
        $note = Note::factory()->create(['user_id' => $user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->deleteJson("/api/notes/{$note->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Nota eliminada correctamente']);

        $this->assertDatabaseMissing('notes', ['id' => $note->id]);
    }

    public function test_user_cannot_delete_other_users_note()
    {
        [$user, $token] = $this->authenticateUser();
        $otherUser = User::factory()->create();
        $note = Note::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->deleteJson("/api/notes/{$note->id}");

        $response->assertStatus(403)
            ->assertJson(['error' => 'No autorizado. Solo el autor o usuarios con los que fue compartida pueden eliminar esta nota.']);

        $this->assertDatabaseHas('notes', ['id' => $note->id]);
    }

    public function test_user_can_share_their_note()
    {
        [$user, $token] = $this->authenticateUser();
        $note = Note::factory()->create(['user_id' => $user->id]);
        $targetEmail = $this->faker->email();

        $shareData = [
            'email' => $targetEmail,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson("/api/notes/{$note->id}/share", $shareData);

        $response->assertStatus(200)
            ->assertJson(['message' => "Nota compartida correctamente con {$targetEmail}"]);

        $note->refresh();
        $this->assertContains($targetEmail, $note->shared_with);
    }

    public function test_user_can_view_shared_notes()
    {
        [$user, $token] = $this->authenticateUser();
        $otherUser = User::factory()->create();

        // Create notes shared with this user
        $sharedNotes = Note::factory()->count(2)->create([
            'user_id' => $otherUser->id,
            'shared_with' => [$user->email],
        ]);

        // Create notes not shared with this user
        Note::factory()->count(2)->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/notes/shared');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_unauthenticated_user_cannot_access_notes()
    {
        $response = $this->getJson('/api/notes');
        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_create_notes()
    {
        $noteData = [
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraph(),
        ];

        $response = $this->postJson('/api/notes', $noteData);
        $response->assertStatus(401);
    }
}
