<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\SolicitudInicioSesion;
use App\Models\Usuario;
use App\Servicios\ServicioAccesos;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class ControladorAutenticacion extends Controller
{
    /**
     * Hash de descarte para que un usuario inexistente consuma un tiempo de
     * verificacion parecido al de uno real y no se pueda deducir su existencia.
     */
    private const HASH_DE_DESCARTE = '$2y$12$l384KBCK0WiDPZi2H/4QUeofXwZXwISStEJ7yKBWktHEYxZvNzOFC';

    public function __construct(private readonly ServicioAccesos $accesos) {}

    public function iniciarSesion(SolicitudInicioSesion $solicitud): JsonResponse
    {
        $clave = $solicitud->claveLimitador();

        if (RateLimiter::tooManyAttempts($clave, (int) config('acceso.intentos_por_minuto'))) {
            $this->registrarIntento($solicitud, null, false, 'LIMITE_DE_INTENTOS');

            throw ValidationException::withMessages([
                'nombre_usuario' => 'Demasiados intentos. Vuelve a intentarlo en '
                    .RateLimiter::availableIn($clave).' segundos.',
            ])->status(429);
        }

        RateLimiter::hit($clave, 60);

        $usuario = Usuario::where('nombre_usuario', $solicitud->nombreUsuario())->first();

        if ($usuario === null) {
            Hash::check($solicitud->contrasena(), self::HASH_DE_DESCARTE);
            $this->registrarIntento($solicitud, null, false, 'USUARIO_INEXISTENTE');
            $this->fallarPorCredenciales();
        }

        if (! $usuario->estado) {
            $this->registrarIntento($solicitud, $usuario, false, 'USUARIO_INACTIVO');
            $this->fallarPorCredenciales();
        }

        if ($usuario->estaBloqueado()) {
            $this->registrarIntento($solicitud, $usuario, false, 'USUARIO_BLOQUEADO');

            throw ValidationException::withMessages([
                'nombre_usuario' => 'La cuenta esta bloqueada temporalmente por intentos fallidos. '
                    .'Vuelve a intentarlo mas tarde.',
            ])->status(423);
        }

        if (! Hash::check($solicitud->contrasena(), (string) $usuario->contrasena_hash)) {
            $this->acumularFallo($usuario);
            $this->registrarIntento($solicitud, $usuario, false, 'CONTRASENA_INCORRECTA');
            $this->fallarPorCredenciales();
        }

        Auth::guard('web')->login($usuario);

        // Evita la fijacion de sesion: el identificador cambia tras autenticar.
        $solicitud->session()->regenerate();

        RateLimiter::clear($clave);

        $usuario->forceFill([
            'intentos_fallidos' => 0,
            'bloqueado_hasta' => null,
            'ultimo_inicio_sesion' => now(),
        ])->save();

        $this->registrarIntento($solicitud, $usuario, true, null);

        return response()->json($this->datosSesion($usuario));
    }

    public function yo(Request $solicitud): JsonResponse
    {
        /** @var Usuario $usuario */
        $usuario = $solicitud->user();

        return response()->json($this->datosSesion($usuario));
    }

    public function cerrarSesion(Request $solicitud): JsonResponse
    {
        Auth::guard('web')->logout();

        $solicitud->session()->invalidate();
        $solicitud->session()->regenerateToken();

        return response()->json(['mensaje' => 'Sesion finalizada.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function datosSesion(Usuario $usuario): array
    {
        $usuario->loadMissing('persona');

        return [
            'usuario' => [
                'id' => (int) $usuario->getKey(),
                'nombre_usuario' => $usuario->nombre_usuario,
                'nombre' => $usuario->nombreCompleto(),
                'correo' => $usuario->persona?->correo,
                'ultimo_inicio_sesion' => $usuario->ultimo_inicio_sesion?->toIso8601String(),
            ],
            'roles' => $this->accesos->roles($usuario),
            'es_administrador' => $this->accesos->esAdministrador($usuario),
        ];
    }

    /**
     * Mensaje unico para usuario inexistente, inactivo o contrasena incorrecta,
     * de modo que no se pueda enumerar usuarios validos.
     */
    private function fallarPorCredenciales(): never
    {
        throw ValidationException::withMessages([
            'nombre_usuario' => 'Las credenciales no son validas.',
        ]);
    }

    private function acumularFallo(Usuario $usuario): void
    {
        $fallos = (int) $usuario->intentos_fallidos + 1;

        if ($fallos >= (int) config('acceso.fallos_antes_de_bloqueo')) {
            // Se reinicia el contador para que, al vencer el bloqueo, la cuenta
            // vuelva a disponer del cupo completo de intentos.
            $usuario->forceFill([
                'intentos_fallidos' => 0,
                'bloqueado_hasta' => now()->addMinutes((int) config('acceso.minutos_de_bloqueo')),
            ])->save();

            return;
        }

        $usuario->forceFill(['intentos_fallidos' => $fallos])->save();
    }

    private function registrarIntento(
        SolicitudInicioSesion $solicitud,
        ?Usuario $usuario,
        bool $exito,
        ?string $motivoFallo,
    ): void {
        DB::table('login_historial')->insert([
            'id_usuario' => $usuario?->getKey(),
            'nombre_usuario' => mb_substr($solicitud->nombreUsuario(), 0, 80),
            'direccion_ip' => mb_substr((string) $solicitud->ip(), 0, 45),
            'agente_usuario' => mb_substr((string) $solicitud->userAgent(), 0, 500) ?: null,
            'exito' => $exito ? 1 : 0,
            'motivo_fallo' => $motivoFallo,
            'creado_en' => now(),
        ]);
    }
}
