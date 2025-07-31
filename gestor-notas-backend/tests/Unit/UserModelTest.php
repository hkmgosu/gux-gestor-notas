<?php

namespace Tests\Unit;

use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_default_role()
    {
        $user = User::factory()->create();

        $this->assertEquals('user', $user->role);
    }

    public function test_user_can_be_admin()
    {
        $admin = User::factory()->admin()->create();

        $this->assertEquals('admin', $admin->role);
    }

    public function test_user_has_notes_relationship()
    {
        $user = User::factory()->create();
        $notes = Note::factory()->count(3)->create(['user_id' => $user->id]);

        $this->assertCount(3, $user->notes);
        $this->assertInstanceOf(Note::class, $user->notes->first());
    }

    public function test_user_password_is_hidden()
    {
        $user = User::factory()->create();

        $userArray = $user->toArray();

        $this->assertArrayNotHasKey('password', $userArray);
    }

    public function test_user_email_is_unique()
    {
        $email = 'test@example.com';
        User::factory()->create(['email' => $email]);

        $this->expectException(\Illuminate\Database\QueryException::class);
        User::factory()->create(['email' => $email]);
    }
}
