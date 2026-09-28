<?php

namespace App\Identidad\Dominio\Contratos;

interface RepositorioAuditoria
{
    /**
     * @param  array{q?: string, accion?: string, limite?: int}  $filtros
     * @return array<string, mixed>
     */
    public function listar(array $filtros): array;
}
