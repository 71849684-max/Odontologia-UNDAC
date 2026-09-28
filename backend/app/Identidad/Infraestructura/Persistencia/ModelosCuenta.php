<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\Cuenta;
use App\Identidad\Infraestructura\Persistencia\Eloquent\Usuario;
use InvalidArgumentException;

final class ModelosCuenta
{
    public static function usuario(Cuenta $cuenta): Usuario
    {
        if ($cuenta instanceof Usuario) {
            return $cuenta;
        }

        throw new InvalidArgumentException('La cuenta no proviene del adaptador Eloquent.');
    }
}
