<?php

namespace App\Identidad\Aplicacion\Administracion;

use App\Identidad\Dominio\Contratos\RepositorioIndicadores;

class ObtenerResumen
{
    public function __construct(private readonly RepositorioIndicadores $indicadores) {}

    /**
     * @return array<string, int>
     */
    public function ejecutar(): array
    {
        return $this->indicadores->resumenAdministracion();
    }
}
