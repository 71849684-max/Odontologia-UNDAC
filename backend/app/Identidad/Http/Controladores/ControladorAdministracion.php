<?php

namespace App\Identidad\Http\Controladores;

use App\Http\Controllers\Controller;
use App\Identidad\Aplicacion\Administracion\ObtenerResumen;
use Illuminate\Http\JsonResponse;

class ControladorAdministracion extends Controller
{
    public function __construct(private readonly ObtenerResumen $resumen) {}

    public function resumen(): JsonResponse
    {
        return response()->json($this->resumen->ejecutar());
    }
}
