<?php

namespace App\Identidad\Aplicacion\Auditoria;

use App\Identidad\Dominio\Contratos\RepositorioAuditoria;

class ListarAuditoria
{
    public function __construct(private readonly RepositorioAuditoria $auditoria) {}

    /**
     * @param  array{q?: string, accion?: string, limite?: int}  $filtros
     * @return array<string, mixed>
     */
    public function ejecutar(array $filtros): array
    {
        return $this->auditoria->listar($filtros);
    }
}
