<?php

namespace App\Identidad\Http\Controladores;

use App\Http\Controllers\Controller;
use App\Identidad\Aplicacion\Cuenta\ActualizarMiPerfil;
use App\Identidad\Aplicacion\Cuenta\CambiarMiContrasena;
use App\Identidad\Aplicacion\Usuarios\RestablecerContrasena;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use App\Identidad\Http\ContextoDesdePeticion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class ControladorCuenta extends Controller
{
    public function __construct(
        private readonly RepositorioUsuarios $usuarios,
        private readonly ActualizarMiPerfil $actualizarPerfil,
        private readonly CambiarMiContrasena $cambiarContrasena,
        private readonly RestablecerContrasena $restablecerContrasena,
    ) {}

    public static function politicaContrasena(): Password
    {
        return Password::min(8)->letters()->numbers()->max(255);
    }

    public function perfil(Request $solicitud): JsonResponse
    {
        /** @var Cuenta $cuenta */
        $cuenta = $solicitud->user();

        return response()->json($this->usuarios->serializar($cuenta));
    }

    public function actualizarPerfil(Request $solicitud): JsonResponse
    {
        $datos = $solicitud->validate([
            'nombres' => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:120'],
            'correo' => ['nullable', 'email', 'max:150'],
            'telefono' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+()\s-]*$/'],
        ], [
            'telefono.regex' => 'El teléfono solo admite números, espacios y los signos + - ( ).',
        ]);

        /** @var Cuenta $cuenta */
        $cuenta = $solicitud->user();

        return response()->json($this->actualizarPerfil->ejecutar($cuenta, $datos, ContextoDesdePeticion::de($solicitud)));
    }

    public function cambiarContrasena(Request $solicitud): Response
    {
        $datos = $solicitud->validate([
            'contrasena_actual' => ['required', 'string', 'max:255'],
            'contrasena' => ['required', 'string', 'confirmed', self::politicaContrasena()],
        ]);

        /** @var Cuenta $cuenta */
        $cuenta = $solicitud->user();

        try {
            $this->cambiarContrasena->ejecutar($cuenta, $datos['contrasena_actual'], $datos['contrasena'], ContextoDesdePeticion::de($solicitud));
        } catch (OperacionNoPermitida $excepcion) {
            throw ValidationException::withMessages([$excepcion->campo => $excepcion->getMessage()]);
        }

        $solicitud->session()->regenerate();

        return response()->noContent();
    }

    public function restablecerContrasena(Request $solicitud, string $idUsuario): JsonResponse
    {
        $datos = $solicitud->validate([
            'contrasena' => ['required', 'string', self::politicaContrasena()],
        ]);

        /** @var Cuenta $operador */
        $operador = $solicitud->user();

        try {
            $payload = $this->restablecerContrasena->ejecutar($idUsuario, $datos['contrasena'], $operador->clave(), ContextoDesdePeticion::de($solicitud));
        } catch (OperacionNoPermitida $excepcion) {
            throw ValidationException::withMessages([$excepcion->campo => $excepcion->getMessage()]);
        }

        return response()->json($payload);
    }
}
