<?php

namespace App\Identidad\Infraestructura\Acceso;

use App\Identidad\Dominio\Contratos\GestorSesion;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

class GestorSesionLaravel implements GestorSesion
{
    public function __construct(private readonly Request $solicitud) {}

    public function iniciar(Cuenta $cuenta): void
    {
        if (! $cuenta instanceof Authenticatable) {
            throw new InvalidArgumentException('La cuenta no puede iniciar sesion.');
        }

        Auth::guard('web')->login($cuenta);
        $this->solicitud->session()->regenerate();
    }

    public function cerrar(): void
    {
        Auth::guard('web')->logout();
        $this->solicitud->session()->invalidate();
        $this->solicitud->session()->regenerateToken();
    }
}
