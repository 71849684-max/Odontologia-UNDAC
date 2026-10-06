<?php

namespace App\Identidad\Dominio;

use InvalidArgumentException;

final class ClaveCuenta
{
    public static function de(string $tipo, int $id): string
    {
        return strtoupper($tipo).'-'.$id;
    }

    /**
     * @return array{0: string, 1: int}
     */
    public static function partes(string $clave): array
    {
        if (! preg_match('/^(ALUMNO|DOCENTE)-(\d+)$/', $clave, $coincidencia)) {
            throw new InvalidArgumentException('Clave de cuenta no válida.');
        }

        return [$coincidencia[1], (int) $coincidencia[2]];
    }
}
