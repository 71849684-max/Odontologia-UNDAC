<?php

namespace App\Identidad\Infraestructura\Acceso;

use App\Identidad\Dominio\Contratos\LimitadorIntentos;
use Illuminate\Support\Facades\RateLimiter;

class LimitadorIntentosLaravel implements LimitadorIntentos
{
    public function demasiados(string $clave, int $maximo): bool
    {
        return RateLimiter::tooManyAttempts($clave, $maximo);
    }

    public function registrar(string $clave): void
    {
        RateLimiter::hit($clave, 60);
    }

    public function segundosParaReintentar(string $clave): int
    {
        return RateLimiter::availableIn($clave);
    }

    public function limpiar(string $clave): void
    {
        RateLimiter::clear($clave);
    }
}
