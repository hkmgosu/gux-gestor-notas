<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NoteController extends Controller
{
    // Obtener notas del usuario actual
    public function index()
    {
        $user = Auth::user();
        
        if ($user->role === 'admin') {
            // admin ve todas las notas
            $notes = Note::with('user')->get();
        } else {
            // usuario normal ve sus notas, públicas y compartidas con él
            $notes = Note::with('user')
                ->where(function ($query) use ($user) {
                    $query->where('user_id', $user->id) // Sus propias notas
                        ->orWhere('is_public', true) // Notas públicas
                        ->orWhereJsonContains('shared_with', $user->email); // Notas compartidas con él
                })
                ->get();
        }
        
        return response()->json($notes);
    }

    // Crear nota
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required',
            'content' => 'required',
            'is_public' => 'boolean',
            'shared_with' => 'array',
        ], [
            'title.required' => 'El título es obligatorio.',
            'content.required' => 'El contenido es obligatorio.',
            'is_public.boolean' => 'El campo público debe ser verdadero o falso.',
            'shared_with.array' => 'El campo compartido con debe ser un arreglo.',
        ]);

        $note = Note::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'is_public' => $request->is_public ?? false,
            'shared_with' => $request->shared_with ?? [],
        ]);

        // Cargar la relación user para devolver datos completos
        $note->load('user');

        return response()->json($note, 201);
    }

    // Actualizar nota
    public function update(Request $request, $id)
    {
        // ✅ VALIDACIÓN ROBUSTA DE ID
        if (!$this->isValidId($id)) {
            return response()->json([
                'error' => 'ID de nota inválido. Debe ser un número entero positivo.',
                'provided_id' => $id
            ], 400);
        }

        try {
            $note = Note::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Nota no encontrada.',
                'note_id' => $id
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Error finding note', [
                'note_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'error' => 'Error interno al buscar la nota.',
                'note_id' => $id
            ], 500);
        }

        $user = Auth::user();
        
        // 🔍 DEBUG: Log para verificar permisos
        \Log::info('UPDATE NOTE DEBUG', [
            'note_id' => $note->id,
            'note_owner_id' => $note->user_id,
            'current_user_id' => $user->id,
            'current_user_email' => $user->email,
            'current_user_role' => $user->role,
            'note_shared_with' => $note->shared_with,
            'can_edit' => $this->canUserEditNote($user, $note)
        ]);
        
        // ✅ NUEVA VALIDACIÓN COMPLETA - Incluye usuarios compartidos
        if (!$this->canUserEditNote($user, $note)) {
            return response()->json([
                'error' => 'No autorizado. Solo el autor o usuarios con los que fue compartida pueden editar esta nota.',
                'debug' => [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'note_owner_id' => $note->user_id,
                    'note_shared_with' => $note->shared_with,
                    'user_role' => $user->role
                ]
            ], 403);
        }

        $request->validate([
            'title' => 'sometimes|required',
            'content' => 'sometimes|required',
            'is_public' => 'boolean',
            'shared_with' => 'array',
        ], [
            'title.required' => 'El título es obligatorio.',
            'content.required' => 'El contenido es obligatorio.',
            'is_public.boolean' => 'El campo público debe ser verdadero o falso.',
            'shared_with.array' => 'El campo compartido con debe ser un arreglo.',
        ]);

        $note->update($request->only(['title', 'content', 'is_public', 'shared_with']));
        
        // Cargar la relación user para devolver datos completos
        $note->load('user');
        
        return response()->json($note);
    }

    // Eliminar nota
    public function destroy($id)
    {
        // ✅ VALIDACIÓN ROBUSTA DE ID
        if (!$this->isValidId($id)) {
            return response()->json([
                'error' => 'ID de nota inválido. Debe ser un número entero positivo.',
                'provided_id' => $id
            ], 400);
        }

        try {
            $note = Note::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Nota no encontrada.',
                'note_id' => $id
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Error finding note for deletion', [
                'note_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'error' => 'Error interno al buscar la nota.',
                'note_id' => $id
            ], 500);
        }

        $user = Auth::user();
        
        // ✅ APLICAR MISMA LÓGICA PARA DELETE
        if (!$this->canUserEditNote($user, $note)) {
            return response()->json([
                'error' => 'No autorizado. Solo el autor o usuarios con los que fue compartida pueden eliminar esta nota.'
            ], 403);
        }

        try {
            $note->delete();
            return response()->json(['message' => 'Nota eliminada correctamente']);
        } catch (\Exception $e) {
            \Log::error('Error deleting note', [
                'note_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'error' => 'Error interno al eliminar la nota.'
            ], 500);
        }
    }

    // Compartir nota (agregar email a shared_with)
    public function share(Request $request, $id)
    {
        // ✅ VALIDACIÓN ROBUSTA DE ID
        if (!$this->isValidId($id)) {
            return response()->json([
                'error' => 'ID de nota inválido. Debe ser un número entero positivo.',
                'provided_id' => $id
            ], 400);
        }

        try {
            $note = Note::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Nota no encontrada.',
                'note_id' => $id
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Error finding note for sharing', [
                'note_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'error' => 'Error interno al buscar la nota.',
                'note_id' => $id
            ], 500);
        }

        $user = Auth::user();
        
        // ✅ APLICAR MISMA LÓGICA PARA SHARE
        if (!$this->canUserEditNote($user, $note)) {
            return response()->json([
                'error' => 'No autorizado. Solo el autor o usuarios con los que fue compartida pueden compartir esta nota.'
            ], 403);
        }

        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe tener un formato válido.',
        ]);

        $sharedWith = $note->shared_with ?? [];
        if (!in_array($request->email, $sharedWith)) {
            $sharedWith[] = $request->email;
            $note->shared_with = $sharedWith;
            $note->save();
        }

        return response()->json(['message' => 'Nota compartida correctamente con ' . $request->email]);
    }

    // Obtener notas compartidas conmigo
    public function getSharedNotes()
    {
        $user = Auth::user();
        $sharedNotes = Note::whereJsonContains('shared_with', $user->email)
            ->with('user') // Include the owner information
            ->get();

        return response()->json($sharedNotes);
    }

    // 🔍 DEBUG: Verificar permisos de una nota específica
    public function checkPermissions($id)
    {
        // ✅ VALIDACIÓN ROBUSTA DE ID
        if (!$this->isValidId($id)) {
            return response()->json([
                'error' => 'ID de nota inválido. Debe ser un número entero positivo.',
                'provided_id' => $id
            ], 400);
        }

        try {
            $note = Note::with('user')->findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Nota no encontrada.',
                'note_id' => $id
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Error finding note for permissions check', [
                'note_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'error' => 'Error interno al buscar la nota.',
                'note_id' => $id
            ], 500);
        }

        $user = Auth::user();
        
        return response()->json([
            'note_id' => $note->id,
            'note_title' => $note->title,
            'note_owner_id' => $note->user_id,
            'note_owner_email' => $note->user->email,
            'current_user_id' => $user->id,
            'current_user_email' => $user->email,
            'current_user_role' => $user->role,
            'note_shared_with' => $note->shared_with,
            'can_edit' => $this->canUserEditNote($user, $note),
            'permissions' => [
                'is_admin' => $user->role === 'admin',
                'is_owner' => $note->user_id === $user->id,
                'is_shared_with_user' => $note->shared_with && is_array($note->shared_with) && in_array($user->email, $note->shared_with),
            ]
        ]);
    }

    // ✅ MÉTODO HELPER PARA VALIDAR PERMISOS COMPLETOS
    private function canUserEditNote($user, $note)
    {
        // Admin puede editar cualquier nota
        if ($user->role === 'admin') {
            \Log::info('PERMISSION: Admin access granted', ['user_id' => $user->id]);
            return true;
        }
        
        // Propietario puede editar su nota
        if ($note->user_id === $user->id) {
            \Log::info('PERMISSION: Owner access granted', ['user_id' => $user->id, 'note_id' => $note->id]);
            return true;
        }
        
        // Usuario puede editar notas compartidas con él
        if ($note->shared_with && is_array($note->shared_with)) {
            $isShared = in_array($user->email, $note->shared_with);
            \Log::info('PERMISSION: Shared access check', [
                'user_email' => $user->email,
                'shared_with' => $note->shared_with,
                'is_shared' => $isShared
            ]);
            return $isShared;
        }
        
        \Log::info('PERMISSION: Access denied', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'note_id' => $note->id,
            'note_owner_id' => $note->user_id,
            'shared_with' => $note->shared_with
        ]);
        
        return false;
    }

    // ✅ MÉTODO HELPER PARA VALIDAR IDs ROBUSTAMENTE
    private function isValidId($id)
    {
        // Verificar que no sea null, vacío o falsy
        if (empty($id) && $id !== '0') {
            \Log::warning('Invalid ID: empty or null', ['provided_id' => $id]);
            return false;
        }

        // Verificar que sea numérico
        if (!is_numeric($id)) {
            \Log::warning('Invalid ID: not numeric', ['provided_id' => $id]);
            return false;
        }

        // Convertir a entero y verificar que sea positivo
        $numericId = (int) $id;
        if ($numericId <= 0) {
            \Log::warning('Invalid ID: not positive', ['provided_id' => $id, 'numeric_id' => $numericId]);
            return false;
        }

        // Verificar que la conversión no haya cambiado el valor (evita IDs como "123abc")
        if ((string) $numericId !== (string) $id) {
            \Log::warning('Invalid ID: conversion mismatch', [
                'provided_id' => $id,
                'numeric_id' => $numericId,
                'converted_back' => (string) $numericId
            ]);
            return false;
        }

        return true;
    }
}
