<?php

namespace Tests;

use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use App\Identidad\Infraestructura\Persistencia\CuentaSistema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Crea cuentas sobre alumno/docente, que es el esquema real de la clínica.
 */
trait CreaUsuarios
{
    protected function asignarProfesionalPrueba(object $docente, int $idHistoria): void
    {
        DB::table('historia_docente')->insert([
            'id_historia_clinica' => $idHistoria, 'id_docente' => $docente->idActor(),
            'tipo_participacion' => 'ENCARGADO', 'fecha_asignacion' => now()->toDateString(),
            'estado' => 1, 'creado_en' => now(),
        ]);
    }

    protected function crearUsuario(
        string $nombreUsuario,
        string $contrasena,
        ?string $codigoRol = null,
        bool $estado = true,
    ): CuentaSistema {
        $codigoRol ??= 'ALUMNO';
        $rol = DB::table('rol')->where('codigo_rol', $codigoRol)->first();
        $tipo = $rol->tipo_usuario;
        $documento = str_pad((string) random_int(1, 99999999), 8, '0', STR_PAD_LEFT);
        $tablaActor = $tipo === 'ALUMNO' ? 'alumno' : 'docente';
        $columnaActor = $tipo === 'ALUMNO' ? 'id_alumno' : 'id_docente';
        $columnaCodigo = $tipo === 'ALUMNO' ? 'codigo_alumno' : 'codigo_docente';

        $idActor = DB::table($tablaActor)->insertGetId([
            $columnaCodigo => ($tipo === 'ALUMNO' ? 'ALU-' : 'DOC-').$documento,
            'tipo_documento' => 'DNI',
            'numero_documento' => $documento,
            'nombres' => 'Persona',
            'apellidos' => 'De Prueba',
            ...($tipo === 'DOCENTE' ? ['numero_colegiatura' => $documento] : []),
            'estado' => 1,
            'creado_en' => now(),
        ]);

        $idUsuario = DB::table($tipo === 'ALUMNO' ? 'usuario_alumno' : 'usuario_docente')->insertGetId([
            $columnaActor => $idActor,
            'id_rol' => $rol->id_rol,
            'nombre_usuario' => $nombreUsuario,
            'contrasena_hash' => Hash::make($contrasena),
            'estado' => $estado ? 1 : 0,
            'intentos_fallidos' => 0,
            'creado_en' => now(),
        ]);

        return app(RepositorioUsuarios::class)
            ->buscarPorId(($tipo === 'ALUMNO' ? 'ALUMNO-' : 'DOCENTE-').$idUsuario);
    }
}
