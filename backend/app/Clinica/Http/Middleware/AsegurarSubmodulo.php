<?php

namespace App\Clinica\Http\Middleware;

use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Cuenta;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AsegurarSubmodulo
{
    public function __construct(private readonly ConsultaAccesos $accesos) {}

    public function handle(Request $solicitud, Closure $siguiente, string ...$codigos): Response
    {
        $usuario = $solicitud->user();

        if (! $usuario instanceof Cuenta) {
            abort(401, 'Sesion no iniciada.');
        }

        foreach ($codigos as $codigo) {
            if ($this->accesos->puede($usuario, $codigo)) {
                return $siguiente($solicitud);
            }
        }

        abort(403, 'No tienes permisos para acceder a este modulo.');
    }
}
