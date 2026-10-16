<?php

namespace App\Clinica\Http\Controladores;

use App\Clinica\Notificaciones\ServicioNotificaciones;
use App\Http\Controllers\Controller;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControladorNotificaciones extends Controller
{
    public function __construct(private readonly ServicioNotificaciones $notificaciones) {}

    public function listar(Request $solicitud): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $limite = (int) $solicitud->query('limite', 50);

        return response()->json(['data' => $this->notificaciones->listar($actor, $limite)]);
    }

    public function marcarLeida(Request $solicitud, int $idNotificacion): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();

        return response()->json($this->notificaciones->marcarLeida($actor, $idNotificacion));
    }

    public function marcarTodas(Request $solicitud): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $n = $this->notificaciones->marcarTodas($actor);

        return response()->json(['marcadas' => $n]);
    }
}
