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

        $accesos = $this->accesosRecientes();

        $acciones = DB::table('auditoria')
            ->select('accion')
            ->distinct()
            ->orderBy('accion')
            ->pluck('accion');

        $indicadores = [
            'eventos' => DB::table('auditoria')->count(),
            'accesos_exitosos' => $this->contarAccesos(true),
            'accesos_fallidos' => $this->contarAccesos(false),
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
            'tabla_afectada' => mb_substr($tabla, 0, 120),
            'id_registro' => mb_substr((string) $idRegistro, 0, 80),
            'accion' => mb_substr($accion, 0, 30),
            'tipo_usuario' => $contexto->tipoUsuario,
            'id_usuario' => $contexto->idUsuario,
            'nombre_usuario' => $contexto->nombreUsuario,
            'direccion_ip' => $contexto->direccionIp !== null ? mb_substr($contexto->direccionIp, 0, 45) : null,
            'agente_usuario' => $contexto->agenteUsuario !== null ? mb_substr($contexto->agenteUsuario, 0, 500) : null,
            'valores_anteriores' => $antes === null ? null : json_encode($antes, JSON_UNESCAPED_UNICODE),
            'valores_nuevos' => $despues === null ? null : json_encode($despues, JSON_UNESCAPED_UNICODE),
            'creado_en' => now(),
        ]);
    }

    private function accesosRecientes()
    {
        $alumno = DB::table('login_historial_alumno')
            ->selectRaw("CONCAT('alumno-', id_login_alumno) as id, nombre_usuario, exito, motivo_fallo, direccion_ip, creado_en");
        $docente = DB::table('login_historial_docente')
            ->selectRaw("CONCAT('docente-', id_login_docente) as id, nombre_usuario, exito, motivo_fallo, direccion_ip, creado_en");

        return $alumno->unionAll($docente)
            ->orderByDesc('creado_en')
            ->limit(50)
            ->get()
            ->map(fn ($fila) => [
                'id' => $fila->id,
                'fecha' => $fila->creado_en,
                'usuario' => $fila->nombre_usuario,
                'accion' => $fila->exito ? 'INICIAR SESIÓN' : 'ACCESO FALLIDO',
                'modulo' => 'Seguridad',
                'registro' => $fila->motivo_fallo ?: (string) $fila->id,
                'ip' => $fila->direccion_ip,
                'origen' => 'login',
            ]);
    }

    private function contarAccesos(bool $exito): int
    {
        $desde = now()->subDays(7);

        return DB::table('login_historial_alumno')->where('exito', $exito ? 1 : 0)->where('creado_en', '>=', $desde)->count()
            + DB::table('login_historial_docente')->where('exito', $exito ? 1 : 0)->where('creado_en', '>=', $desde)->count();
    }
}
