<?php

namespace App\Clinica\Http;

use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

trait RespondeOperacion
{
    /**
     * @template T
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
