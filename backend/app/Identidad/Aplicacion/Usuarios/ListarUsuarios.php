<?php

namespace App\Identidad\Aplicacion\Usuarios;

use App\Identidad\Dominio\Contratos\RepositorioUsuarios;

class ListarUsuarios
{
    public function __construct(private readonly RepositorioUsuarios $usuarios) {}

    /**
     * @param  array{q?: string, rol?: string, estado?: mixed}  $filtros
     * @return array{data: list<array<string, mixed>>, indicadores: array<string, int>}
     */
    public function ejecutar(array $filtros): array
    {
        return [
            'data' => $this->usuarios->listar($filtros),
            'indicadores' => $this->usuarios->indicadores(),
        ];
    }
}
