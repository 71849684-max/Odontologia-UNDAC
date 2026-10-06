<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\Contratos\RepositorioIndicadores;
use Illuminate\Support\Facades\DB;

class RepositorioIndicadoresSql implements RepositorioIndicadores
{
    public function resumenAdministracion(): array
    {
        $desde = now()->subDays(7);

        return [
            'usuarios' => DB::table('usuario_alumno')->count() + DB::table('usuario_docente')->count(),
            'usuarios_activos' => DB::table('usuario_alumno')->where('estado', 1)->count()
                + DB::table('usuario_docente')->where('estado', 1)->count(),
            'roles' => DB::table('rol')->where('estado', 1)->count(),
            'accesos_fallidos_recientes' => DB::table('login_historial_alumno')->where('exito', 0)->where('creado_en', '>=', $desde)->count()
                + DB::table('login_historial_docente')->where('exito', 0)->where('creado_en', '>=', $desde)->count(),
        ];
    }
}
