<?php

namespace App\Identidad\Http\Controladores;

use App\Http\Controllers\Controller;
use App\Identidad\Aplicacion\Acceso\CerrarSesion;
use App\Identidad\Aplicacion\Acceso\IniciarSesion;
use App\Identidad\Aplicacion\Acceso\ObtenerSesionActual;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\CredencialesInvalidas;
use App\Identidad\Dominio\Excepciones\CuentaBloqueada;
use App\Identidad\Dominio\Excepciones\DemasiadosIntentos;
use App\Identidad\Http\Solicitudes\SolicitudInicioSesion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ControladorAutenticacion extends Controller
{
    public function __construct(
        private readonly IniciarSesion $iniciarSesion,
        private readonly ObtenerSesionActual $obtenerSesion,
        private readonly CerrarSesion $cerrarSesion,
    ) {}

    public function iniciarSesion(SolicitudInicioSesion $solicitud): JsonResponse
    {
        try {
            $payload = $this->iniciarSesion->ejecutar(
                $solicitud->nombreUsuario(),
                $solicitud->contrasena(),
                $solicitud->claveLimitador(),
                $solicitud->ip(),
                $solicitud->userAgent(),
            );
        } catch (DemasiadosIntentos $excepcion) {
            throw ValidationException::withMessages([
                'nombre_usuario' => 'Demasiados intentos. Vuelve a intentarlo en '
                    .$excepcion->segundosParaReintentar.' segundos.',
            ])->status(429);
        } catch (CuentaBloqueada) {
            throw ValidationException::withMessages([
                'nombre_usuario' => 'La cuenta esta bloqueada temporalmente por intentos fallidos. '
                    .'Vuelve a intentarlo mas tarde.',
            ])->status(423);
        } catch (CredencialesInvalidas) {
            throw ValidationException::withMessages([
                'nombre_usuario' => 'Las credenciales no son validas.',
            ]);
        }

        return response()->json($payload);
    }

    public function yo(Request $solicitud): JsonResponse
    {
        /** @var Cuenta $cuenta */
        $cuenta = $solicitud->user();

        return response()->json($this->obtenerSesion->ejecutar($cuenta));
    }

    public function cerrarSesion(): JsonResponse
    {
        return response()->json($this->cerrarSesion->ejecutar());
    }
}
