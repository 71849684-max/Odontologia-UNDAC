<?php

namespace App\Identidad\Dominio\Contratos;

interface VerificadorContrasena
{
    public function coincide(string $plana, string $hash): bool;

    /**
     * Consume tiempo comparable a una verificacion real cuando la cuenta
     * no existe, para no filtrar usuarios por timing.
     */
    public function simularVerificacion(string $plana): void;
}
