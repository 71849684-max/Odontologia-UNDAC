<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'servicio' => 'Sistema de Odontología',
        'capa' => 'backend',
    ]);
});
