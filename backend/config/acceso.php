<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Politica de inicio de sesion
    |--------------------------------------------------------------------------
    |
    | Se lee desde config y no desde env() para que siga funcionando cuando la
    | configuracion este en cache en el servidor.
    |
    */

    'intentos_por_minuto' => (int) env('ACCESO_INTENTOS_POR_MINUTO', 5),

    'fallos_antes_de_bloqueo' => (int) env('ACCESO_FALLOS_ANTES_DE_BLOQUEO', 5),

    'minutos_de_bloqueo' => (int) env('ACCESO_MINUTOS_DE_BLOQUEO', 15),

    /*
    |--------------------------------------------------------------------------
    | Primer administrador
    |--------------------------------------------------------------------------
    |
    | Credenciales que usa SeederAdministrador. El dump de la base siembra los
    | roles pero ningun usuario.
    |
    */

    'admin' => [
        'usuario' => env('ADMIN_USUARIO', 'admin'),
        'contrasena' => env('ADMIN_CONTRASENA'),
        'nombres' => env('ADMIN_NOMBRES', 'Administrador'),
        'apellidos' => env('ADMIN_APELLIDOS', 'del Sistema'),
        'documento' => env('ADMIN_DOCUMENTO', '00000001'),
    ],

];
