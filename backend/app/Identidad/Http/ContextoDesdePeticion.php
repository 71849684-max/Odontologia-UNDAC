<?php

namespace App\Identidad\Http;

use App\Identidad\Dominio\ContextoOperacion;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Http\Request;

final class ContextoDesdePeticion
{
    public static function de(Request $solicitud): ContextoOperacion
    {
        $usuario = $solicitud->user();

        return new ContextoOperacion(
            idUsuario: $usuario instanceof Cuenta ? $usuario->id() : null,
            tipoUsuario: $usuario instanceof Cuenta ? $usuario->tipoCuenta() : null,
            nombreUsuario: $usuario instanceof Cuenta ? $usuario->nombreUsuario() : null,
            direccionIp: $solicitud->ip(),
            agenteUsuario: $solicitud->userAgent(),
        );
    }
}
