<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\ContextoOperacion;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Contratos\RepositorioAuditoria;
use Illuminate\Support\Facades\DB;

class RepositorioAuditoriaSql implements RegistradorAuditoria, RepositorioAuditoria
{
    public function listar(array $filtros): array
    {
        $busqueda = trim((string) ($filtros['q'] ?? ''));
        $accion = trim((string) ($filtros['accion'] ?? ''));
        $limite = min(200, max(1, (int) ($filtros['limite'] ?? 100)));

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

        return [
            'data' => $eventos,
            'accesos_recientes' => $accesos,
            'acciones' => $acciones,
            'indicadores' => $indicadores,
        ];
    }

    public function registrar(
        ContextoOperacion $contexto,
        string $tabla,
        string|int $idRegistro,
        string $accion,
        ?array $antes = null,
        ?array $despues = null,
    ): void {
        DB::table('auditoria')->insert([
            'tabla_afectada' => mb_substr($tabla, 0, 100),
            'id_registro' => mb_substr((string) $idRegistro, 0, 100),
            'accion' => mb_substr($accion, 0, 30),
            'id_usuario' => $contexto->idUsuario,
            'nombre_usuario' => $contexto->nombreUsuario,
            'direccion_ip' => $contexto->direccionIp !== null ? mb_substr($contexto->direccionIp, 0, 45) : null,
            'agente_usuario' => $contexto->agenteUsuario !== null ? mb_substr($contexto->agenteUsuario, 0, 500) : null,
            'datos_antes' => $antes === null ? null : json_encode($antes, JSON_UNESCAPED_UNICODE),
            'datos_despues' => $despues === null ? null : json_encode($despues, JSON_UNESCAPED_UNICODE),
            'creado_en' => now(),
        ]);
    }
}
