<?php

namespace App\Identidad\Dominio;

/**
 * Contrato de una cuenta institucional. El adaptador Eloquent lo implementa
 * para que el dominio no dependa de Laravel.
 */
interface Cuenta
{
    public function id(): int;

    public function nombreUsuario(): string;

    public function nombreCompleto(): string;

    public function correo(): ?string;

    public function estaActiva(): bool;

    public function estaBloqueada(): bool;

    public function hashContrasena(): string;

    public function ultimoInicioSesionIso(): ?string;
}
