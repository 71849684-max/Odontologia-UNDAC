<?php

namespace App\Identidad\Dominio;

/**
 * Datos de la peticion que los procesos de auditoria necesitan, sin acoplar
 * el dominio a Illuminate\Http\Request.
 */
final readonly class ContextoOperacion
{
    public function __construct(
        public ?int $idUsuario,
        public ?string $tipoUsuario,
        public ?string $nombreUsuario,
        public ?string $direccionIp,
        public ?string $agenteUsuario,
    ) {}
}
