<?php

namespace Tests\Unit;

use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NoteModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_note_belongs_to_user()
    {
        $user = User::factory()->create();
        $note = Note::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $note->user);
        $this->assertEquals($user->id, $note->user->id);
    }

    public function test_note_has_default_values()
    {
        $note = Note::factory()->create();

        $this->assertIsBool($note->is_public);
        $this->assertIsArray($note->shared_with);
    }

    public function test_note_shared_with_is_cast_to_array()
    {
        $note = Note::factory()->create([
            'shared_with' => ['test@example.com', 'another@example.com'],
        ]);

        $this->assertIsArray($note->shared_with);
        $this->assertContains('test@example.com', $note->shared_with);
        $this->assertContains('another@example.com', $note->shared_with);
    }

    public function test_note_is_public_is_cast_to_boolean()
    {
        $note = Note::factory()->create(['is_public' => 1]);

        $this->assertIsBool($note->is_public);
        $this->assertTrue($note->is_public);

        $note = Note::factory()->create(['is_public' => 0]);

        $this->assertIsBool($note->is_public);
        $this->assertFalse($note->is_public);
    }

    public function test_note_has_required_fillable_fields()
    {
        $fillable = (new Note)->getFillable();

        $expectedFillable = ['title', 'content', 'is_public', 'shared_with', 'user_id'];

        foreach ($expectedFillable as $field) {
            $this->assertContains($field, $fillable);
        }
    }

    public function test_note_has_timestamps()
    {
        $note = Note::factory()->create();

        $this->assertNotNull($note->created_at);
        $this->assertNotNull($note->updated_at);
    }
}
