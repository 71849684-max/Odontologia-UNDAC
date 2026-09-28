<?php

namespace App\Identidad\Infraestructura\Acceso;

use App\Identidad\Dominio\Contratos\VerificadorContrasena;
use Illuminate\Support\Facades\Hash;

class VerificadorContrasenaHash implements VerificadorContrasena
{
    /**
     * Hash de descarte para que un usuario inexistente consuma un tiempo de
     * verificacion parecido al de uno real y no se pueda deducir su existencia.
     */
    private const HASH_DE_DESCARTE = '$2y$12$l384KBCK0WiDPZi2H/4QUeofXwZXwISStEJ7yKBWktHEYxZvNzOFC';

    public function coincide(string $plana, string $hash): bool
    {
        return Hash::check($plana, $hash);
    }

    public function simularVerificacion(string $plana): void
    {
        Hash::check($plana, self::HASH_DE_DESCARTE);
    }
}
