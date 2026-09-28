<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\Contratos\RepositorioIndicadores;
use Illuminate\Support\Facades\DB;

class RepositorioIndicadoresSql implements RepositorioIndicadores
{
    public function resumenAdministracion(): array
    {
        return [
            'usuarios' => DB::table('usuario')->count(),
            'usuarios_activos' => DB::table('usuario')->where('estado', 1)->count(),
            'roles' => DB::table('rol')->where('estado', 1)->count(),
            'accesos_fallidos_recientes' => DB::table('login_historial')
                ->where('exito', 0)
                ->where('creado_en', '>=', now()->subDays(7))
                ->count(),
        ];
    }
}
