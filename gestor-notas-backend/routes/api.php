<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\NoteController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/notes', [NoteController::class, 'index']);
    Route::post('/notes', [NoteController::class, 'store']);
    
    // ✅ VALIDACIONES ROBUSTAS: Solo acepta IDs numéricos positivos
    Route::put('/notes/{id}', [NoteController::class, 'update'])->where('id', '[1-9][0-9]*');
    Route::delete('/notes/{id}', [NoteController::class, 'destroy'])->where('id', '[1-9][0-9]*');
    Route::post('/notes/{id}/share', [NoteController::class, 'share'])->where('id', '[1-9][0-9]*');
    Route::get('/notes/{id}/permissions', [NoteController::class, 'checkPermissions'])->where('id', '[1-9][0-9]*');
    
    Route::get('/notes/shared', [NoteController::class, 'getSharedNotes']);
});
