<?php

namespace App\Identidad\Dominio\Excepciones;

use RuntimeException;

class DemasiadosIntentos extends RuntimeException
{
    public function __construct(public readonly int $segundosParaReintentar)
    {
        parent::__construct('Demasiados intentos de inicio de sesion.');
    }
}
