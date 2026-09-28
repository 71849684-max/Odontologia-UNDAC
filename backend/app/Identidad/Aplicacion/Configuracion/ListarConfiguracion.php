<?php

namespace App\Identidad\Aplicacion\Configuracion;

use App\Identidad\Dominio\Contratos\RepositorioConfiguracion;

class ListarConfiguracion
{
    public function __construct(private readonly RepositorioConfiguracion $configuracion) {}

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public function ejecutar(): array
    {
        return ['data' => $this->configuracion->listar()];
    }
}
