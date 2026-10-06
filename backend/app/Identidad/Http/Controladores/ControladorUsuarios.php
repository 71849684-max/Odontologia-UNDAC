<?php

namespace App\Identidad\Http\Controladores;

use App\Http\Controllers\Controller;
use App\Identidad\Aplicacion\Usuarios\ActualizarUsuario;
use App\Identidad\Aplicacion\Usuarios\CambiarEstadoUsuario;
use App\Identidad\Aplicacion\Usuarios\CrearUsuario;
use App\Identidad\Aplicacion\Usuarios\ListarRoles;
use App\Identidad\Aplicacion\Usuarios\ListarUsuarios;
use App\Identidad\Aplicacion\Usuarios\MostrarUsuario;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use App\Identidad\Http\ContextoDesdePeticion;
use App\Identidad\Http\Solicitudes\Admin\SolicitudGuardarUsuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ControladorUsuarios extends Controller
{
    public function __construct(
        private readonly ListarRoles $listarRoles,
        private readonly ListarUsuarios $listarUsuarios,
        private readonly MostrarUsuario $mostrarUsuario,
        private readonly CrearUsuario $crearUsuario,
        private readonly ActualizarUsuario $actualizarUsuario,
        private readonly CambiarEstadoUsuario $cambiarEstadoUsuario,
    ) {}

    public function roles(): JsonResponse
    {
        return response()->json($this->listarRoles->ejecutar());
    }

    public function listar(Request $solicitud): JsonResponse
    {
        return response()->json($this->listarUsuarios->ejecutar([
            'q' => (string) $solicitud->query('q', ''),
            'rol' => (string) $solicitud->query('rol', ''),
            'estado' => $solicitud->query('estado'),
        ]));
    }

    public function mostrar(string $idUsuario): JsonResponse
    {
        return response()->json($this->mostrarUsuario->ejecutar($idUsuario));
    }

    public function crear(SolicitudGuardarUsuario $solicitud): JsonResponse
    {
        /** @var Cuenta $operador */
        $operador = $solicitud->user();

        try {
            $payload = $this->crearUsuario->ejecutar(
                $solicitud->validated(),
                $operador->id(),
                ContextoDesdePeticion::de($solicitud),
            );
        } catch (OperacionNoPermitida $excepcion) {
            throw ValidationException::withMessages([$excepcion->campo => $excepcion->getMessage()]);
        }

        return response()->json($payload, 201);
    }

    public function actualizar(SolicitudGuardarUsuario $solicitud, string $idUsuario): JsonResponse
    {
        /** @var Cuenta $operador */
        $operador = $solicitud->user();

        try {
            $payload = $this->actualizarUsuario->ejecutar(
                $idUsuario,
                $solicitud->validated(),
                $operador->clave(),
                ContextoDesdePeticion::de($solicitud),
            );
        } catch (OperacionNoPermitida $excepcion) {
            throw ValidationException::withMessages([$excepcion->campo => $excepcion->getMessage()]);
        }

        return response()->json($payload);
    }

    public function cambiarEstado(Request $solicitud, string $idUsuario): JsonResponse
    {
        $solicitud->validate([
            'estado' => ['required', 'boolean'],
        ]);

        /** @var Cuenta $operador */
        $operador = $solicitud->user();

        try {
            $payload = $this->cambiarEstadoUsuario->ejecutar(
                $idUsuario,
                $solicitud->boolean('estado'),
                $operador->clave(),
                ContextoDesdePeticion::de($solicitud),
            );
        } catch (OperacionNoPermitida $excepcion) {
            throw ValidationException::withMessages([$excepcion->campo => $excepcion->getMessage()]);
        }

        return response()->json($payload);
    }
}
