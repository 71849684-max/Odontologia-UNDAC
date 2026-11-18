<?php

namespace App\Http\Validacion;

use Closure;

/** Reglas de formato; los campos opcionales siguen permitiendo guardar borradores. */
final class ReglasBasicas
{
    public static function documento(mixed $tipo = 'DNI'): Closure
    {
        return function (string $campo, mixed $valor, Closure $fallo) use ($tipo): void {
            if (! is_string($valor)) {
                $fallo('Ingrese un número de documento válido.');
            } elseif ($tipo === 'DNI' && ! preg_match('/^[0-9]{8}$/D', $valor)) {
                $fallo('El DNI debe tener 8 dígitos.');
            } elseif ($tipo !== 'DNI' && ! preg_match('/^[A-Za-z0-9-]{4,20}$/D', $valor)) {
                $fallo('El documento debe tener entre 4 y 20 letras, números o guiones.');
            }
        };
    }

    public static function telefono(): array
    {
        return ['bail', 'nullable', 'string', 'max:30', function (string $campo, mixed $valor, Closure $fallo): void {
            $digitos = preg_replace('/\D/', '', (string) $valor);
            if (! preg_match('/^[0-9+()\s-]+$/D', (string) $valor) || strlen($digitos) < 7 || strlen($digitos) > 15) {
                $fallo('Ingrese un teléfono de 7 a 15 dígitos; puede incluir +, espacios, guiones y paréntesis.');
            }
        }];
    }

    public static function hora(): array
    {
        return ['nullable', 'string', 'regex:/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/D'];
    }

    public static function numeroNoNegativo(): array
    {
        return ['nullable', function (string $campo, mixed $valor, Closure $fallo): void {
            if (! is_string($valor) && ! is_int($valor) && ! is_float($valor)) {
                $fallo('Ingrese un número válido, igual o mayor que cero.');

                return;
            }
            $numero = str_replace(',', '.', (string) $valor);
            if (! is_numeric($numero) || ! is_finite((float) $numero) || (float) $numero < 0) {
                $fallo('Ingrese un número válido, igual o mayor que cero.');
            }
        }];
    }
}
