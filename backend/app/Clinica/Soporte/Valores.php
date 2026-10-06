<?php

namespace App\Clinica\Soporte;

use Illuminate\Support\Carbon;

final class Valores
{
    public static function texto(mixed $valor): ?string
    {
        $texto = trim((string) ($valor ?? ''));

        return $texto === '' ? null : $texto;
    }

    public static function siNo(mixed $valor): ?int
    {
        $texto = mb_strtolower(trim((string) ($valor ?? '')));

        if ($texto === '') {
            return null;
        }

        if (in_array($texto, ['sí', 'si', '1', 'true', 'yes'], true)) {
            return 1;
        }

        if (in_array($texto, ['no', '0', 'false'], true)) {
            return 0;
        }

        return null;
    }

    public static function desdeSiNo(mixed $valor): string
    {
        if ($valor === null || $valor === '') {
            return '';
        }

        return (int) $valor === 1 ? 'Sí' : 'No';
    }

    public static function decimal(mixed $valor): ?string
    {
        $texto = str_replace(',', '.', trim((string) ($valor ?? '')));

        return $texto === '' || ! is_numeric($texto) ? null : $texto;
    }

    public static function edad(?string $fecha): string|int
    {
        if ($fecha === null || $fecha === '') {
            return '';
        }

        $nacimiento = Carbon::parse($fecha);
        $edad = $nacimiento->diffInYears(now());

        return $edad >= 0 ? $edad : '';
    }

    /**
     * @param  array<string, mixed>  $datos
     * @return array{0: string, 1: string}
     */
    public static function nombresYApellidos(array $datos): array
    {
        $paterno = self::texto($datos['apellidoPaterno'] ?? null);
        $materno = self::texto($datos['apellidoMaterno'] ?? null);

        if ($paterno !== null) {
            $apellidos = trim($paterno.' '.($materno ?? ''));

            return [self::texto($datos['nombres'] ?? null) ?? '', $apellidos];
        }

        $completo = self::texto($datos['nombres'] ?? null) ?? '';
        $partes = preg_split('/\s+/', $completo) ?: [];

        if (count($partes) <= 1) {
            return [$completo, '-'];
        }

        if (count($partes) === 2) {
            return [$partes[0], $partes[1]];
        }

        return [
            implode(' ', array_slice($partes, 0, -2)),
            implode(' ', array_slice($partes, -2)),
        ];
    }
}
