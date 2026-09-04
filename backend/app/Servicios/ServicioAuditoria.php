<?php

namespace App\Servicios;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Registra cambios administrativos en la tabla auditoria del esquema clinico.
 */
class ServicioAuditoria
{
    /**
     * @param  array<string, mixed>|null  $antes
     * @param  array<string, mixed>|null  $despues
     */
    public function registrar(
        Request $solicitud,
        string $tabla,
        string|int $idRegistro,
        string $accion,
        ?array $antes = null,
        ?array $despues = null,
    ): void {
        /** @var Usuario|null $usuario */
        $usuario = $solicitud->user();

        DB::table('auditoria')->insert([
            'tabla_afectada' => mb_substr($tabla, 0, 100),
            'id_registro' => mb_substr((string) $idRegistro, 0, 100),
            'accion' => mb_substr($accion, 0, 30),
            'id_usuario' => $usuario?->getKey(),
            'nombre_usuario' => $usuario?->nombre_usuario,
            'direccion_ip' => mb_substr((string) $solicitud->ip(), 0, 45) ?: null,
            'agente_usuario' => mb_substr((string) $solicitud->userAgent(), 0, 500) ?: null,
            'datos_antes' => $antes === null ? null : json_encode($antes, JSON_UNESCAPED_UNICODE),
            'datos_despues' => $despues === null ? null : json_encode($despues, JSON_UNESCAPED_UNICODE),
            'creado_en' => now(),
        ]);
    }
}
