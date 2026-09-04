<?php

namespace Database\Seeders;

use App\Models\Persona;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

/**
 * Crea el primer administrador. El dump de la base siembra los roles pero no
 * ningun usuario, asi que sin este seeder nadie puede iniciar sesion.
 */
class SeederAdministrador extends Seeder
{
    public function run(): void
    {
        $nombreUsuario = trim((string) config('acceso.admin.usuario'));
        $contrasena = (string) config('acceso.admin.contrasena');

        if ($nombreUsuario === '' || $contrasena === '') {
            throw new RuntimeException(
                'Define ADMIN_USUARIO y ADMIN_CONTRASENA en el archivo .env antes de ejecutar este seeder.'
            );
        }

        $rol = Rol::where('codigo_rol', Rol::ADMINISTRADOR)->first();

        if ($rol === null) {
            throw new RuntimeException(
                'No existe el rol ADMINISTRADOR. Importa bd_clinica_undac.sql antes de ejecutar este seeder.'
            );
        }

        DB::transaction(function () use ($nombreUsuario, $contrasena, $rol): void {
            $persona = Persona::firstOrCreate(
                [
                    'tipo_documento' => 'DNI',
                    'numero_documento' => (string) config('acceso.admin.documento'),
                ],
                [
                    'nombres' => (string) config('acceso.admin.nombres'),
                    'apellidos' => (string) config('acceso.admin.apellidos'),
                    'estado' => true,
                ],
            );

            $usuario = Usuario::firstOrNew(['nombre_usuario' => $nombreUsuario]);

            $usuario->forceFill([
                'id_persona' => $persona->getKey(),
                'contrasena_hash' => Hash::make($contrasena),
                'estado' => true,
                'intentos_fallidos' => 0,
                'bloqueado_hasta' => null,
                'contrasena_cambiada_en' => now(),
            ])->save();

            DB::table('usuario_rol')->updateOrInsert(
                [
                    'id_usuario' => $usuario->getKey(),
                    'id_rol' => $rol->getKey(),
                ],
                [
                    'permitido' => 1,
                    'asignado_en' => now(),
                ],
            );

            $this->command?->info("Administrador listo: {$nombreUsuario}");
        });
    }
}
