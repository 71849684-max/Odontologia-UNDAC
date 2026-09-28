<?php

namespace App\Identidad\Infraestructura\Acceso;

use App\Identidad\Dominio\Contratos\RegistradorIntentosAcceso;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Support\Facades\DB;

class RegistradorIntentosAccesoSql implements RegistradorIntentosAcceso
{
    public function registrar(
        string $nombreUsuario,
        ?string $direccionIp,
        ?string $agenteUsuario,
        ?Cuenta $cuenta,
        bool $exito,
        ?string $motivoFallo,
    ): void {
        DB::table('login_historial')->insert([
            'id_usuario' => $cuenta?->id(),
            'nombre_usuario' => mb_substr($nombreUsuario, 0, 80),
            'direccion_ip' => $direccionIp !== null ? mb_substr($direccionIp, 0, 45) : null,
            'agente_usuario' => $agenteUsuario !== null ? (mb_substr($agenteUsuario, 0, 500) ?: null) : null,
            'exito' => $exito ? 1 : 0,
            'motivo_fallo' => $motivoFallo,
            'creado_en' => now(),
        ]);
    }
}
