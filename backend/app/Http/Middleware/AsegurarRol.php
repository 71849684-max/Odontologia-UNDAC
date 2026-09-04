<?php

namespace App\Http\Middleware;

use App\Models\Usuario;
use App\Servicios\ServicioAccesos;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Exige que el usuario autenticado tenga al menos uno de los roles indicados.
 * Uso en rutas: middleware('rol:ADMINISTRADOR').
 */
class AsegurarRol
{
    public function __construct(private readonly ServicioAccesos $accesos) {}

    public function handle(Request $solicitud, Closure $siguiente, string ...$codigosRol): Response
    {
        $usuario = $solicitud->user();

        if (! $usuario instanceof Usuario) {
            abort(401, 'Sesion no iniciada.');
        }

        if (! $this->accesos->tieneAlgunRol($usuario, $codigosRol)) {
            abort(403, 'No tienes permisos para acceder a este modulo.');
        }

        return $siguiente($solicitud);
    }
}
