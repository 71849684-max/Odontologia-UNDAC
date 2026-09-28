<?php

namespace App\Identidad\Http\Controladores;

use App\Http\Controllers\Controller;
use App\Identidad\Aplicacion\Auditoria\ListarAuditoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControladorAuditoria extends Controller
{
    public function __construct(private readonly ListarAuditoria $listar) {}

    public function listar(Request $solicitud): JsonResponse
    {
        return response()->json($this->listar->ejecutar([
            'q' => (string) $solicitud->query('q', ''),
            'accion' => (string) $solicitud->query('accion', ''),
            'limite' => (int) $solicitud->query('limite', 100),
        ]));
    }
}
