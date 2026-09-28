<?php

namespace App\Identidad\Dominio\Contratos;

interface LimitadorIntentos
{
    public function demasiados(string $clave, int $maximo): bool;

    public function registrar(string $clave): void;

    public function segundosParaReintentar(string $clave): int;

    public function limpiar(string $clave): void;
}
