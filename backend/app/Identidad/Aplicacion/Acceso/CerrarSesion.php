<?php

namespace App\Identidad\Aplicacion\Acceso;

use App\Identidad\Dominio\Contratos\GestorSesion;

class CerrarSesion
{
    public function __construct(private readonly GestorSesion $sesion) {}

    /**
     * @return array{mensaje: string}
     */
    public function ejecutar(): array
    {
        $this->sesion->cerrar();

        return ['mensaje' => 'Sesion finalizada.'];
    }
}
