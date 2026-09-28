<?php

namespace App\Identidad\Dominio\Contratos;

interface RepositorioRoles
{
    /**
     * @return list<array<string, mixed>>
     */
    public function listarActivos(): array;
}
