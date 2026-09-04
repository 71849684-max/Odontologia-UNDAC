<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ControladorAuditoria extends Controller
{
    public function listar(Request $solicitud): JsonResponse
    {
        $busqueda = trim((string) $solicitud->query('q', ''));
        $accion = trim((string) $solicitud->query('accion', ''));
        $limite = min(200, max(1, (int) $solicitud->query('limite', 100)));

        $consulta = DB::table('auditoria')->orderByDesc('creado_en')->orderByDesc('id_auditoria');

        if ($busqueda !== '') {
            $consulta->where(function ($q) use ($busqueda) {
                $q->where('nombre_usuario', 'like', "%{$busqueda}%")
                    ->orWhere('tabla_afectada', 'like', "%{$busqueda}%")
                    ->orWhere('id_registro', 'like', "%{$busqueda}%")
                    ->orWhere('direccion_ip', 'like', "%{$busqueda}%");
            });
        }

        if ($accion !== '') {
            $consulta->where('accion', $accion);
        }

        $eventos = $consulta->limit($limite)->get()->map(fn ($fila) => [
            'id' => (int) $fila->id_auditoria,
            'fecha' => $fila->creado_en,
            'usuario' => $fila->nombre_usuario,
            'accion' => $fila->accion,
            'modulo' => $fila->tabla_afectada,
            'registro' => $fila->id_registro,
            'ip' => $fila->direccion_ip,
            'origen' => 'auditoria',
        ]);

        $accesos = DB::table('login_historial')
            ->orderByDesc('creado_en')
            ->orderByDesc('id_login')
            ->limit(50)
            ->get()
            ->map(fn ($fila) => [
                'id' => 'login-'.$fila->id_login,
                'fecha' => $fila->creado_en,
                'usuario' => $fila->nombre_usuario,
                'accion' => $fila->exito ? 'INICIAR SESIÓN' : 'ACCESO FALLIDO',
                'modulo' => 'Seguridad',
                'registro' => $fila->motivo_fallo ?: 'SES-'.$fila->id_login,
                'ip' => $fila->direccion_ip,
                'origen' => 'login',
            ]);

        $acciones = DB::table('auditoria')
            ->select('accion')
            ->distinct()
            ->orderBy('accion')
            ->pluck('accion');

        $indicadores = [
            'eventos' => DB::table('auditoria')->count(),
            'accesos_exitosos' => DB::table('login_historial')->where('exito', 1)->where('creado_en', '>=', now()->subDays(7))->count(),
            'accesos_fallidos' => DB::table('login_historial')->where('exito', 0)->where('creado_en', '>=', now()->subDays(7))->count(),
            'modificaciones' => DB::table('auditoria')->whereIn('accion', ['EDITAR', 'CREAR', 'DESACTIVAR', 'ACTIVAR', 'RESTAURAR'])->count(),
        ];

        return response()->json([
            'data' => $eventos,
            'accesos_recientes' => $accesos,
            'acciones' => $acciones,
            'indicadores' => $indicadores,
        ]);
    }
}
