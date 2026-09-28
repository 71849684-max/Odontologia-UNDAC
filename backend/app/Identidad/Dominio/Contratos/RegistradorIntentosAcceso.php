<?php

namespace App\Identidad\Dominio\Contratos;

use App\Identidad\Dominio\Cuenta;

interface RegistradorIntentosAcceso
{
    public function registrar(
        string $nombreUsuario,
        ?string $direccionIp,
        ?string $agenteUsuario,
        ?Cuenta $cuenta,
        bool $exito,
        ?string $motivoFallo,
    ): void;
}
