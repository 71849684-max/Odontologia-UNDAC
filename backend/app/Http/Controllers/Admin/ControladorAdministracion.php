<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ControladorAdministracion extends Controller
{
    /**
     * Primer endpoint del modulo de administracion. Solo se alcanza con el rol
     * ADMINISTRADOR; sirve tambien para que el SPA confirme el acceso.
     */
    public function resumen(): JsonResponse
    {
        return response()->json([
            'usuarios' => DB::table('usuario')->count(),
            'usuarios_activos' => DB::table('usuario')->where('estado', 1)->count(),
            'roles' => DB::table('rol')->where('estado', 1)->count(),
            'accesos_fallidos_recientes' => DB::table('login_historial')
                ->where('exito', 0)
                ->where('creado_en', '>=', now()->subDays(7))
                ->count(),
        ]);
    }
}
