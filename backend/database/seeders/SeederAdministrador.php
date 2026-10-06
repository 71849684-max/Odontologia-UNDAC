<?php

namespace Database\Seeders;

use App\Identidad\Dominio\CodigoRol;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

/**
 * Crea el primer administrador sobre una cuenta de docente.
 * El dump siembra los roles, pero ninguna cuenta.
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

        $rol = DB::table('rol')->where('codigo_rol', CodigoRol::ADMINISTRADOR)->where('estado', 1)->first();

        if ($rol === null) {
            throw new RuntimeException(
                'No existe el rol ADMINISTRADOR. Importa bd_clinica_undac.sql antes de ejecutar este seeder.'
            );
        }

        DB::transaction(function () use ($nombreUsuario, $contrasena, $rol): void {
            $documento = (string) config('acceso.admin.documento');
            $docente = DB::table('docente')
                ->where('tipo_documento', 'DNI')
                ->where('numero_documento', $documento)
                ->first();

            if ($docente === null) {
                $idDocente = DB::table('docente')->insertGetId([
                    'codigo_docente' => 'DOC-'.$documento,
                    'tipo_documento' => 'DNI',
                    'numero_documento' => $documento,
                    'nombres' => (string) config('acceso.admin.nombres'),
                    'apellidos' => (string) config('acceso.admin.apellidos'),
                    'estado' => 1,
                    'creado_en' => now(),
                ]);
            } else {
                $idDocente = $docente->id_docente;
            }

            $existente = DB::table('usuario_docente')->where('nombre_usuario', $nombreUsuario)->first();
            $datos = [
                'id_docente' => $idDocente,
                'id_rol' => $rol->id_rol,
                'contrasena_hash' => Hash::make($contrasena),
                'estado' => 1,
                'intentos_fallidos' => 0,
                'bloqueado_hasta' => null,
                'contrasena_cambiada_en' => now(),
            ];

            if ($existente === null) {
                DB::table('usuario_docente')->insert($datos + [
                    'nombre_usuario' => $nombreUsuario,
                    'creado_en' => now(),
                ]);
            } else {
                DB::table('usuario_docente')->where('id_usuario_docente', $existente->id_usuario_docente)->update($datos);
            }

            $this->command?->info("Administrador listo: {$nombreUsuario}");
        });
    }
}
