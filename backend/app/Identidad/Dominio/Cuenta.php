<?php

namespace App\Identidad\Dominio;

/**
 * Contrato de una cuenta institucional. El adaptador Eloquent lo implementa
 * para que el dominio no dependa de Laravel.
 */
interface Cuenta
{
    public function id(): int;

    /** ALUMNO o DOCENTE. Identifica la tabla de la cuenta. */
    public function tipoCuenta(): string;

    /** Identificador opaco y único entre ambas tablas, por ejemplo DOCENTE-4. */
    public function clave(): string;

    public function idActor(): int;

    public function idRol(): int;

    public function nombreUsuario(): string;

    public function nombreCompleto(): string;

    public function correo(): ?string;

    public function estaActiva(): bool;

    public function estaBloqueada(): bool;

    public function hashContrasena(): string;

    public function ultimoInicioSesionIso(): ?string;
}
