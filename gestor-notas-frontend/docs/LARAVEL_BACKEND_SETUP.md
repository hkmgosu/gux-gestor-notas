# Laravel Backend Setup Guide

## Required Laravel Backend Configuration

Your Laravel backend running on `localhost:8000` needs to have the following endpoints and configurations:

### 1. CORS Configuration

Add to your Laravel `.env` file:
```env
FRONTEND_URL=http://localhost:3000
```

In `config/cors.php`:
```php
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:3000'),
],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

### 2. Required API Routes

Your Laravel `routes/api.php` should include:

```php
// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notes', [NoteController::class, 'index']);
    Route::post('/notes', [NoteController::class, 'store']);
    Route::put('/notes/{id}', [NoteController::class, 'update']);
    Route::delete('/notes/{id}', [NoteController::class, 'destroy']);
    Route::get('/notes/shared', [NoteController::class, 'shared']);
    Route::post('/notes/{id}/share', [NoteController::class, 'share']);
});
```

### 3. Expected Response Format

#### Login/Register Response:
```json
{
    "token": "your-jwt-token-here",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "role": "user"
    }
}
```

#### Notes Response:
```json
[
    {
        "id": 1,
        "title": "Note Title",
        "content": "Note content",
        "is_public": false,
        "shared_with": ["user2@example.com"],
        "owner_email": "owner@example.com"
    }
]
```

### 4. User Model

Ensure your User model has:
```php
protected $fillable = [
    'email',
    'password',
    'role',
];

protected $hidden = [
    'password',
    'remember_token',
];
```

### 5. Note Model

```php
protected $fillable = [
    'title',
    'content',
    'is_public',
    'shared_with',
    'owner_email',
];

protected $casts = [
    'shared_with' => 'array',
    'is_public' => 'boolean',
];
```

### 6. Database Migrations

#### Users table:
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('email')->unique();
    $table->string('password');
    $table->enum('role', ['admin', 'user'])->default('user');
    $table->timestamps();
});
```

#### Notes table:
```php
Schema::create('notes', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('content');
    $table->boolean('is_public')->default(false);
    $table->json('shared_with')->nullable();
    $table->string('owner_email');
    $table->timestamps();
});
```

### 7. Start Your Laravel Backend

Make sure your Laravel backend is running:
```bash
cd your-laravel-project
php artisan serve --port=8000
```

## Testing the Connection

1. **Start both servers:**
   - Laravel: `php artisan serve --port=8000`
   - Next.js: `npm run dev` (port 3000)

2. **Test login:**
   - Go to `http://localhost:3000/login`
   - Use credentials from your Laravel database
   - Check browser network tab for API calls to `localhost:8000`

3. **Check CORS:**
   - Open browser DevTools
   - Look for CORS errors in console
   - Ensure requests are going to `localhost:8000/api/*`

## Common Issues

1. **CORS Error:** Configure CORS properly in Laravel
2. **401 Unauthorized:** Check token format and authentication middleware
3. **Connection Refused:** Ensure Laravel server is running on port 8000
4. **Route Not Found:** Verify API routes are properly defined
