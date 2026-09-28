<?php

namespace App\Identidad\Infraestructura\Acceso;

use App\Identidad\Dominio\Contratos\GestorSesion;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Infraestructura\Persistencia\ModelosCuenta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GestorSesionLaravel implements GestorSesion
{
    public function __construct(private readonly Request $solicitud) {}

    public function iniciar(Cuenta $cuenta): void
    {
        Auth::guard('web')->login(ModelosCuenta::usuario($cuenta));
        $this->solicitud->session()->regenerate();
    }

    public function cerrar(): void
    {
        Auth::guard('web')->logout();
        $this->solicitud->session()->invalidate();
        $this->solicitud->session()->regenerateToken();
    }
}
