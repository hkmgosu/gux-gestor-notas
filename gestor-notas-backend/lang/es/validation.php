<?php

return [
    'required' => 'El campo :attribute es obligatorio.',
    'email' => 'El campo :attribute debe ser una dirección de correo válida.',
    'unique' => 'El :attribute ya ha sido registrado.',
    'min' => [
        'string' => 'El campo :attribute debe tener al menos :min caracteres.',
    ],
    'max' => [
        'string' => 'El campo :attribute no debe ser mayor que :max caracteres.',
    ],
    'string' => 'El campo :attribute debe ser una cadena de texto.',
    'boolean' => 'El campo :attribute debe ser verdadero o falso.',
    'array' => 'El campo :attribute debe ser un arreglo.',
    'sometimes' => 'El campo :attribute es opcional.',

    'attributes' => [
        'name' => 'nombre',
        'email' => 'correo electrónico',
        'password' => 'contraseña',
        'title' => 'título',
        'content' => 'contenido',
        'is_public' => 'público',
        'shared_with' => 'compartido con',
    ],
];
