<?php

namespace App\Identidad\Http\Middleware;

use App\Identidad\Dominio\Contratos\GestorSesion;
use App\Identidad\Dominio\Cuenta;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Corta la sesion en caliente si la cuenta fue desactivada o bloqueada despues
 * de haber iniciado sesion, sin esperar a que expire la cookie.
 */
class AsegurarUsuarioActivo
{
    public function __construct(private readonly GestorSesion $sesion) {}

    public function handle(Request $solicitud, Closure $siguiente): Response
    {
        $usuario = $solicitud->user();

        if ($usuario instanceof Cuenta && (! $usuario->estaActiva() || $usuario->estaBloqueada())) {
            $this->sesion->cerrar();

            abort(401, 'La cuenta ya no esta habilitada.');
        }

        return $siguiente($solicitud);
    }
}
