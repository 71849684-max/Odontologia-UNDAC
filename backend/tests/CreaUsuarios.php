<?php

namespace Tests;

use App\Models\Persona;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * El esquema clinico no tiene factories: persona y usuario se crean a mano
 * sobre las mismas tablas que usa la aplicacion.
 */
trait CreaUsuarios
{
    protected function crearUsuario(
        string $nombreUsuario,
        string $contrasena,
        ?string $codigoRol = null,
        bool $estado = true,
    ): Usuario {
        $persona = Persona::create([
            'tipo_documento' => 'DNI',
            'numero_documento' => str_pad((string) random_int(1, 99999999), 8, '0', STR_PAD_LEFT),
            'nombres' => 'Persona',
            'apellidos' => 'De Prueba',
            'estado' => true,
        ]);

        $usuario = new Usuario;
        $usuario->forceFill([
            'id_persona' => $persona->getKey(),
            'nombre_usuario' => $nombreUsuario,
            'contrasena_hash' => Hash::make($contrasena),
            'estado' => $estado,
            'intentos_fallidos' => 0,
        ])->save();

        if ($codigoRol !== null) {
            DB::table('usuario_rol')->insert([
                'id_usuario' => $usuario->getKey(),
                'id_rol' => Rol::where('codigo_rol', $codigoRol)->value('id_rol'),
                'permitido' => 1,
                'asignado_en' => now(),
            ]);
        }

        return $usuario;
    }
}
