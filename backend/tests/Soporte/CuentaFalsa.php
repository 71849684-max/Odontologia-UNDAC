<?php

namespace Tests\Soporte;

use App\Identidad\Dominio\Cuenta;

final class CuentaFalsa implements Cuenta
{
    public function __construct(
        private readonly string $tipo,
        private readonly int $idUsuario = 1,
        private readonly int $idActor = 1,
        private readonly int $idRol = 1,
    ) {}

    public function id(): int
    {
        return $this->idUsuario;
    }

    public function tipoCuenta(): string
    {
        return $this->tipo;
    }

    public function clave(): string
    {
        return $this->tipo.'-'.$this->idUsuario;
    }

    public function idActor(): int
    {
        return $this->idActor;
    }

    public function idRol(): int
    {
        return $this->idRol;
    }

    public function nombreUsuario(): string
    {
        return 'cuenta.falsa';
    }

    public function nombreCompleto(): string
    {
        return 'Cuenta Falsa';
    }

    public function correo(): ?string
    {
        return null;
    }

    public function estaActiva(): bool
    {
        return true;
    }

    public function estaBloqueada(): bool
    {
        return false;
    }

    public function hashContrasena(): string
    {
        return '';
    }

    public function ultimoInicioSesionIso(): ?string
    {
        return null;
    }
}
