<?php

namespace App\Clinica\Http;

use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

trait RespondeOperacion
{
    /**
     * @template T
     *
     * @param  callable(): T  $accion
     * @return T
     */
    protected function operacion(callable $accion): mixed
    {
        try {
            return $accion();
        } catch (OperacionNoPermitida $excepcion) {
            throw ValidationException::withMessages([
                $excepcion->campo => $excepcion->getMessage(),
            ]);
        } catch (QueryException $excepcion) {
            if (str_contains($excepcion->getMessage(), '45000') || str_contains($excepcion->getMessage(), '1644')) {
                throw ValidationException::withMessages([
                    'datos' => $this->mensajeDeBase($excepcion),
                ]);
            }

            // 1406: texto demasiado largo; 1264: número fuera de rango; 1292/1366: valor con formato inválido.
            $codigoMysql = (int) ($excepcion->errorInfo[1] ?? 0);
            if (in_array($codigoMysql, [1406, 1264, 1292, 1366], true)) {
                throw ValidationException::withMessages([
                    'datos' => 'Un dato supera la longitud permitida o tiene un formato inválido. Revise los campos editados.',
                ]);
            }

            throw $excepcion;
        }
    }

    private function mensajeDeBase(QueryException $excepcion): string
    {
        if (preg_match("/MESSAGE_TEXT = '([^']+)'/", $excepcion->getMessage(), $coincidencia)) {
            return $coincidencia[1];
        }

        return 'La operación no cumple una regla de la base de datos.';
    }
}
