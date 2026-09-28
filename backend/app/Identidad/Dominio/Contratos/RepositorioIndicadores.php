<?php

namespace App\Identidad\Dominio\Contratos;

interface RepositorioIndicadores
{
    /**
     * @return array<string, int>
     */
    public function resumenAdministracion(): array;
}
