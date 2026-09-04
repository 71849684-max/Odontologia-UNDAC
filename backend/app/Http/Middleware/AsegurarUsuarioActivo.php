<?php

namespace App\Http\Middleware;

use App\Models\Usuario;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Corta la sesion en caliente si la cuenta fue desactivada o bloqueada despues
 * de haber iniciado sesion, sin esperar a que expire la cookie.
 */
class AsegurarUsuarioActivo
{
    public function handle(Request $solicitud, Closure $siguiente): Response
    {
        $usuario = $solicitud->user();

        if ($usuario instanceof Usuario && (! $usuario->estado || $usuario->estaBloqueado())) {
            Auth::guard('web')->logout();
            $solicitud->session()->invalidate();
            $solicitud->session()->regenerateToken();

            abort(401, 'La cuenta ya no esta habilitada.');
        }

        return $siguiente($solicitud);
    }
}
