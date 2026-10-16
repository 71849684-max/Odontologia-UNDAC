<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CabecerasSeguridad
{
    public function handle(Request $solicitud, Closure $siguiente): Response
    {
        $respuesta = $siguiente($solicitud);
        $cabeceras = $respuesta->headers;

        $base = [
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'DENY',
            'Referrer-Policy' => 'same-origin',
            'Permissions-Policy' => 'camera=(), microphone=(), geolocation=(), payment=()',
            'Cross-Origin-Opener-Policy' => 'same-origin',
            'Content-Security-Policy' => "default-src 'none'; frame-ancestors 'none'",
        ];
        foreach ($base as $nombre => $valor) {
            if (! $cabeceras->has($nombre)) {
                $cabeceras->set($nombre, $valor);
            }
        }

        if ($solicitud->isSecure()) {
            $cabeceras->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Las respuestas JSON contienen datos clínicos: no deben quedar en cachés intermedias ni del navegador.
        if ($respuesta instanceof JsonResponse) {
            $cabeceras->set('Cache-Control', 'no-store, private');
        }

        return $respuesta;
    }
}
