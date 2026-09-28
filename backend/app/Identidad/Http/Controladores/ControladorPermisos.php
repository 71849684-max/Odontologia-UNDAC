<?php

namespace App\Identidad\Http\Controladores;

use App\Http\Controllers\Controller;
use App\Identidad\Aplicacion\Permisos\GuardarPermisosDeUsuario;
use App\Identidad\Aplicacion\Permisos\ObtenerCatalogoPermisos;
use App\Identidad\Aplicacion\Permisos\ObtenerPermisosDeUsuario;
use App\Identidad\Aplicacion\Permisos\RestaurarPermisosDeUsuario;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Http\ContextoDesdePeticion;
use App\Identidad\Http\Solicitudes\Admin\SolicitudGuardarPermisos;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControladorPermisos extends Controller
{
    public function __construct(
        private readonly ObtenerCatalogoPermisos $catalogo,
        private readonly ObtenerPermisosDeUsuario $deUsuario,
        private readonly GuardarPermisosDeUsuario $guardarPermisos,
        private readonly RestaurarPermisosDeUsuario $restaurarPermisos,
    ) {}

    public function catalogo(): JsonResponse
    {
        return response()->json($this->catalogo->ejecutar());
    }

    public function deUsuario(int $idUsuario): JsonResponse
    {
        return response()->json($this->deUsuario->ejecutar($idUsuario));
    }

    public function guardar(SolicitudGuardarPermisos $solicitud, int $idUsuario): JsonResponse
    {
        /** @var Cuenta $operador */
        $operador = $solicitud->user();

        return response()->json($this->guardarPermisos->ejecutar(
            $idUsuario,
            $solicitud->idsPermisos(),
            $operador->id(),
            ContextoDesdePeticion::de($solicitud),
        ));
    }

    public function restaurar(Request $solicitud, int $idUsuario): JsonResponse
    {
        return response()->json($this->restaurarPermisos->ejecutar(
            $idUsuario,
            ContextoDesdePeticion::de($solicitud),
        ));
    }
}
