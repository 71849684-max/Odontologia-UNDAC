<?php

namespace App\Identidad\Http\Controladores;

use App\Http\Controllers\Controller;
use App\Identidad\Aplicacion\Configuracion\GuardarConfiguracion;
use App\Identidad\Aplicacion\Configuracion\ListarConfiguracion;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use App\Identidad\Http\ContextoDesdePeticion;
use App\Identidad\Http\Solicitudes\Admin\SolicitudGuardarConfiguracion;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ControladorConfiguracion extends Controller
{
    public function __construct(
        private readonly ListarConfiguracion $listar,
        private readonly GuardarConfiguracion $guardar,
    ) {}

    public function listar(): JsonResponse
    {
        return response()->json($this->listar->ejecutar());
    }

    public function guardar(SolicitudGuardarConfiguracion $solicitud): JsonResponse
    {
        /** @var Cuenta $operador */
        $operador = $solicitud->user();

        try {
            $payload = $this->guardar->ejecutar(
                $solicitud->valores(),
                $operador->id(),
                ContextoDesdePeticion::de($solicitud),
            );
        } catch (OperacionNoPermitida $excepcion) {
            throw ValidationException::withMessages([$excepcion->campo => $excepcion->getMessage()]);
        }

        return response()->json($payload);
    }
}
