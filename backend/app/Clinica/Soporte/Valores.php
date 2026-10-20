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

    /**
     * Día/mes/año o ISO a la fecha de calendario Y-m-d que guarda MySQL.
     * 01/05/2026 es el 1 de mayo, no el 5 de enero.
     */
    public static function fecha(mixed $valor): ?string
    {
        $texto = trim((string) ($valor ?? ''));
        if ($texto === '') {
            return null;
        }

        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $texto, $coincidencias) === 1) {
            $anio = (int) $coincidencias[1];
            $mes = (int) $coincidencias[2];
            $dia = (int) $coincidencias[3];

            return checkdate($mes, $dia, $anio) ? sprintf('%04d-%02d-%02d', $anio, $mes, $dia) : null;
        }

        if (preg_match('/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/', $texto, $coincidencias) === 1) {
            $dia = (int) $coincidencias[1];
            $mes = (int) $coincidencias[2];
            $anio = (int) $coincidencias[3];

            return checkdate($mes, $dia, $anio) ? sprintf('%04d-%02d-%02d', $anio, $mes, $dia) : null;
        }

        return null;
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
        $edad = (int) floor($nacimiento->diffInYears(now()));

        return $edad >= 0 ? $edad : '';
    }

    /** Formato datetime-local del frontend (Y-m-d\TH:i) a partir de creado_en / fecha de la historia. */
    public static function fechaHoraLocal(mixed $valor): string
    {
        if ($valor === null || $valor === '') {
            return now()->format('Y-m-d\TH:i');
        }

        try {
            return Carbon::parse($valor)->format('Y-m-d\TH:i');
        } catch (\Throwable) {
            return now()->format('Y-m-d\TH:i');
        }
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
