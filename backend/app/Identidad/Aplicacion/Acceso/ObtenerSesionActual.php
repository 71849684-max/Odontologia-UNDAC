<?php

namespace App\Identidad\Aplicacion\Acceso;

use App\Identidad\Dominio\Cuenta;

class ObtenerSesionActual
{
    public function __construct(private readonly IniciarSesion $iniciarSesion) {}

    /**
     * @return array<string, mixed>
     */
    public function ejecutar(Cuenta $cuenta): array
    {
        return $this->iniciarSesion->datosSesion($cuenta);
    }
}
