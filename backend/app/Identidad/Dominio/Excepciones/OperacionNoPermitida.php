<?php

namespace App\Identidad\Dominio\Excepciones;

use RuntimeException;

class OperacionNoPermitida extends RuntimeException
{
    public function __construct(
        public readonly string $campo,
        string $mensaje,
    ) {
        parent::__construct($mensaje);
    }
}
