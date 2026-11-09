<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\ContextoOperacion;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Contratos\RepositorioAuditoria;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class RepositorioAuditoriaSql implements RegistradorAuditoria, RepositorioAuditoria
{
    private const ACCIONES_ACCESO = ['INICIAR SESIÓN', 'ACCESO FALLIDO'];

    /** Tablas de historias clínicas y archivos asociados. */
    private const TABLAS_HISTORIAS = [
        'historia_clinica',
        'historia_seccion_estado',
        'archivo_clinico',
    ];

    public function listar(array $filtros): array
    {
        $busqueda = trim((string) ($filtros['q'] ?? ''));
        $accion = trim((string) ($filtros['accion'] ?? ''));
        $origen = trim((string) ($filtros['origen'] ?? ''));
        $limite = min(200, max(1, (int) ($filtros['limite'] ?? 100)));

        if (! in_array($origen, ['sesiones', 'acciones', ''], true)) {
            $origen = '';
        }

        $acciones = $origen === 'sesiones' ? [] : $this->listarAcciones($busqueda, $accion, $limite);
        $accesos = $origen === 'acciones' ? [] : $this->listarAccesos($busqueda, $accion, $limite);

        return [
            'data' => $acciones,
            'accesos_recientes' => $accesos,
            'acciones' => DB::table('auditoria')
                ->whereIn('tabla_afectada', self::TABLAS_HISTORIAS)
                ->select('accion')
                ->distinct()
                ->orderBy('accion')
                ->pluck('accion'),
            'acciones_acceso' => self::ACCIONES_ACCESO,
            'indicadores' => [
                'eventos' => DB::table('auditoria')->whereIn('tabla_afectada', self::TABLAS_HISTORIAS)->count(),
                'accesos_exitosos' => $this->contarAccesos(true),
                'accesos_fallidos' => $this->contarAccesos(false),
                'modificaciones' => DB::table('auditoria')
                    ->whereIn('tabla_afectada', self::TABLAS_HISTORIAS)
                    ->whereIn('accion', ['EDITAR', 'CREAR', 'DESACTIVAR', 'ACTIVAR', 'RESTAURAR', 'INACTIVAR', 'CAMBIAR_ESTADO', 'ASIGNAR_PERSONAL', 'REVISAR_SECCION', 'MARCAR_COMPLETADO', 'REABRIR_SECCION', 'EDITAR_ODONTOGRAMA', 'SUBIR_ARCHIVO', 'ELIMINAR_ARCHIVO'])
                    ->count(),
            ],
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

    /**
     * @return list<array<string, mixed>>
     */
    private function listarAcciones(string $busqueda, string $accion, int $limite): array
    {
        if ($accion !== '' && in_array($accion, self::ACCIONES_ACCESO, true)) {
            return [];
        }

        $consulta = DB::table('auditoria')
            ->leftJoin('historia_clinica as historia', function ($union) {
                $union->on('historia.id_historia_clinica', '=', DB::raw("CASE WHEN auditoria.tabla_afectada = 'archivo_clinico' THEN COALESCE(JSON_UNQUOTE(JSON_EXTRACT(auditoria.valores_nuevos, '$.historia')), JSON_UNQUOTE(JSON_EXTRACT(auditoria.valores_anteriores, '$.historia'))) ELSE auditoria.id_registro END"));
            })
            ->select('auditoria.*', 'historia.numero_historia as historia_codigo', 'historia.id_historia_clinica as historia_id')
            ->whereIn('tabla_afectada', self::TABLAS_HISTORIAS)
            ->orderByDesc('auditoria.creado_en')
            ->orderByDesc('id_auditoria');

        $this->aplicarBusqueda($consulta, $busqueda, ['nombre_usuario', 'tabla_afectada', 'id_registro', 'direccion_ip', 'historia.numero_historia']);

        if ($accion !== '') {
            $consulta->where('accion', $accion);
        }

        return $consulta->limit($limite)->get()->map(fn ($fila) => [
            'id' => (int) $fila->id_auditoria,
            'fecha' => $fila->creado_en,
            'usuario' => $fila->nombre_usuario,
            'accion' => $fila->accion,
            'historia' => $fila->historia_codigo,
            'historiaId' => $fila->historia_id,
            'modulo' => $fila->tabla_afectada,
            'registro' => $fila->id_registro,
            'ip' => $fila->direccion_ip,
            'tipo_usuario' => $fila->tipo_usuario,
            'agente' => $fila->agente_usuario,
            'valores_anteriores' => $this->decodificar($fila->valores_anteriores),
            'valores_nuevos' => $this->decodificar($fila->valores_nuevos),
            'origen' => 'auditoria',
        ])->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function listarAccesos(string $busqueda, string $accion, int $limite): array
    {
        if ($accion !== '' && ! in_array($accion, self::ACCIONES_ACCESO, true)) {
            return [];
        }

        $alumno = $this->consultaAcceso('login_historial_alumno', 'id_login_alumno', 'alumno', 'ALUMNO', $busqueda, $accion);
        $docente = $this->consultaAcceso('login_historial_docente', 'id_login_docente', 'docente', 'DOCENTE', $busqueda, $accion);

        return DB::query()
            ->fromSub($alumno->unionAll($docente), 'accesos')
            ->orderByDesc('creado_en')
            ->limit($limite)
            ->get()
            ->map(fn ($fila) => [
                'id' => $fila->id,
                'fecha' => $fila->creado_en,
                'usuario' => $fila->nombre_usuario,
                'accion' => ((int) $fila->exito) === 1 ? 'INICIAR SESIÓN' : 'ACCESO FALLIDO',
                'modulo' => 'Seguridad',
                'registro' => $fila->motivo_fallo ?: (string) $fila->id,
                'ip' => $fila->direccion_ip,
                'tipo_usuario' => $fila->tipo_cuenta,
                'agente' => $fila->agente_usuario,
                'motivo' => $fila->motivo_fallo,
                'origen' => 'login',
            ])->all();
    }

    private function consultaAcceso(
        string $tabla,
        string $columnaId,
        string $prefijo,
        string $tipoCuenta,
        string $busqueda,
        string $accion,
    ): Builder {
        $consulta = DB::table($tabla)->selectRaw(
            "CONCAT(?, '-', {$columnaId}) as id, nombre_usuario, exito, motivo_fallo, direccion_ip, agente_usuario, creado_en, ? as tipo_cuenta",
            [$prefijo, $tipoCuenta],
        );

        $this->aplicarBusqueda($consulta, $busqueda, ['nombre_usuario', 'direccion_ip', 'motivo_fallo']);

        if ($accion === 'INICIAR SESIÓN') {
            $consulta->where('exito', 1);
        } elseif ($accion === 'ACCESO FALLIDO') {
            $consulta->where('exito', 0);
        }

        return $consulta;
    }

    /**
     * @param  list<string>  $columnas
     */
    private function aplicarBusqueda(Builder $consulta, string $busqueda, array $columnas): void
    {
        if ($busqueda === '') {
            return;
        }

        $patron = '%'.addcslashes($busqueda, '%_\\').'%';
        $consulta->where(function (Builder $q) use ($patron, $columnas) {
            foreach ($columnas as $indice => $columna) {
                if ($indice === 0) {
                    $q->where($columna, 'like', $patron);

                    continue;
                }
                $q->orWhere($columna, 'like', $patron);
            }
        });
    }

    private function decodificar(mixed $json): mixed
    {
        if ($json === null || $json === '') {
            return null;
        }
        if (is_array($json)) {
            return $json;
        }

        $valor = json_decode((string) $json, true);

        return json_last_error() === JSON_ERROR_NONE ? $valor : $json;
    }

    private function contarAccesos(bool $exito): int
    {
        $desde = now()->subDays(7);

        return DB::table('login_historial_alumno')->where('exito', $exito ? 1 : 0)->where('creado_en', '>=', $desde)->count()
            + DB::table('login_historial_docente')->where('exito', $exito ? 1 : 0)->where('creado_en', '>=', $desde)->count();
    }
}
