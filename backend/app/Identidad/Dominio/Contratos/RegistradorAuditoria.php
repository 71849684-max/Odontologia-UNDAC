<?php

namespace App\Identidad\Dominio\Contratos;

use App\Identidad\Dominio\ContextoOperacion;

interface RegistradorAuditoria
{
    /**
     * @param  array<string, mixed>|null  $antes
     * @param  array<string, mixed>|null  $despues
     */
    public function registrar(
        ContextoOperacion $contexto,
        string $tabla,
        string|int $idRegistro,
        string $accion,
        ?array $antes = null,
        ?array $despues = null,
    ): void;
}
