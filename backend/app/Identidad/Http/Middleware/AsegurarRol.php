<?php

namespace App\Identidad\Http\Middleware;

use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Cuenta;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Exige que el usuario autenticado tenga al menos uno de los roles indicados.
 * Uso en rutas: middleware('rol:ADMINISTRADOR').
 */
class AsegurarRol
{
    public function __construct(private readonly ConsultaAccesos $accesos) {}

    public function handle(Request $solicitud, Closure $siguiente, string ...$codigosRol): Response
    {
        $usuario = $solicitud->user();

        if (! $usuario instanceof Cuenta) {
            abort(401, 'Sesion no iniciada.');
        }

        if (! $this->accesos->tieneAlgunRol($usuario, $codigosRol)) {
            abort(403, 'No tienes permisos para acceder a este modulo.');
        }

        return $siguiente($solicitud);
    }
}
