<?php

namespace App\Identidad\Aplicacion\Usuarios;

use App\Identidad\Dominio\Contratos\RepositorioRoles;

class ListarRoles
{
    public function __construct(private readonly RepositorioRoles $roles) {}

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public function ejecutar(): array
    {
        return ['data' => $this->roles->listarActivos()];
    }
}
