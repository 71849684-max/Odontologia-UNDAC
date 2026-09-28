<?php

namespace App\Identidad\Dominio\Contratos;

use App\Identidad\Dominio\Cuenta;

interface ConsultaAccesos
{
    /**
     * @return list<string>
     */
    public function roles(Cuenta $cuenta): array;

    public function esAdministrador(Cuenta $cuenta): bool;

    /**
     * @param  list<string>  $codigos
     */
    public function tieneAlgunRol(Cuenta $cuenta, array $codigos): bool;

    public function puede(Cuenta $cuenta, string $codigoPermiso): bool;

    public function olvidarMemoria(Cuenta $cuenta): void;
}
