<?php

namespace App\Identidad\Aplicacion\Permisos;

use App\Identidad\Dominio\Contratos\RepositorioPermisos;

class ObtenerCatalogoPermisos
{
    public function __construct(private readonly RepositorioPermisos $permisos) {}

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public function ejecutar(): array
    {
        return ['data' => $this->permisos->catalogo()];
    }
}
