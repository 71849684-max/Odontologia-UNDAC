<?php

namespace App\Identidad\Dominio\Contratos;

use App\Identidad\Dominio\Cuenta;

interface GestorSesion
{
    public function iniciar(Cuenta $cuenta): void;

    public function cerrar(): void;
}
