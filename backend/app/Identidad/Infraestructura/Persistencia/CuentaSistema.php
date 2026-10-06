<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\ClaveCuenta;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Carbon;

/**
 * Cuenta autenticable de alumno o docente. No está atada a una sola tabla:
 * el identificador de sesión es la clave opaca (ALUMNO-1 / DOCENTE-4).
 */
class CuentaSistema implements Authenticatable, Cuenta
{
    public function __construct(
        public readonly string $tipo,
        public readonly int $idUsuario,
        public readonly int $idActor,
        public readonly int $idRolCuenta,
        public readonly string $codigoRol,
        public readonly ?string $nombreRol,
        public string $nombreUsuarioCuenta,
        public string $nombres,
        public string $apellidos,
        public string $tipoDocumento,
        public string $numeroDocumento,
        public ?string $correoCuenta,
        public ?string $telefono,
        public bool $estado,
        public ?Carbon $bloqueado_hasta,
        public string $contrasenaHash,
        public ?Carbon $ultimo_inicio_sesion,
        public ?Carbon $creado_en,
        public int $intentos_fallidos,
    ) {}

    public static function desdeFila(object $fila): self
    {
        return new self(
            tipo: (string) $fila->tipo,
            idUsuario: (int) $fila->id_usuario,
            idActor: (int) $fila->id_actor,
            idRolCuenta: (int) $fila->id_rol,
            codigoRol: (string) $fila->codigo_rol,
            nombreRol: $fila->nombre_rol !== null ? (string) $fila->nombre_rol : null,
            nombreUsuarioCuenta: (string) $fila->nombre_usuario,
            nombres: (string) $fila->nombres,
            apellidos: (string) $fila->apellidos,
            tipoDocumento: (string) $fila->tipo_documento,
            numeroDocumento: (string) $fila->numero_documento,
            correoCuenta: $fila->correo !== null ? (string) $fila->correo : null,
            telefono: $fila->telefono !== null ? (string) $fila->telefono : null,
            estado: (bool) $fila->estado,
            bloqueado_hasta: $fila->bloqueado_hasta ? Carbon::parse($fila->bloqueado_hasta) : null,
            contrasenaHash: (string) $fila->contrasena_hash,
            ultimo_inicio_sesion: $fila->ultimo_inicio_sesion ? Carbon::parse($fila->ultimo_inicio_sesion) : null,
            creado_en: $fila->creado_en ? Carbon::parse($fila->creado_en) : null,
            intentos_fallidos: (int) $fila->intentos_fallidos,
        );
    }

    public function id(): int
    {
        return $this->idUsuario;
    }

    public function tipoCuenta(): string
    {
        return $this->tipo;
    }

    public function clave(): string
    {
        return ClaveCuenta::de($this->tipo, $this->idUsuario);
    }

    public function idActor(): int
    {
        return $this->idActor;
    }

    public function idRol(): int
    {
        return $this->idRolCuenta;
    }

    public function getKey(): string
    {
        return $this->clave();
    }

    public function nombreUsuario(): string
    {
        return $this->nombreUsuarioCuenta;
    }

    public function nombreCompleto(): string
    {
        $nombre = trim($this->nombres.' '.$this->apellidos);

        return $nombre !== '' ? $nombre : $this->nombreUsuarioCuenta;
    }

    public function correo(): ?string
    {
        return $this->correoCuenta;
    }

    public function estaActiva(): bool
    {
        return $this->estado;
    }

    public function estaBloqueada(): bool
    {
        return $this->bloqueado_hasta !== null && $this->bloqueado_hasta->isFuture();
    }

    public function estaBloqueado(): bool
    {
        return $this->estaBloqueada();
    }

    public function hashContrasena(): string
    {
        return $this->contrasenaHash;
    }

    public function ultimoInicioSesionIso(): ?string
    {
        return $this->ultimo_inicio_sesion?->toIso8601String();
    }

    public function tablaCuenta(): string
    {
        return $this->tipo === 'ALUMNO' ? 'usuario_alumno' : 'usuario_docente';
    }

    public function columnaId(): string
    {
        return $this->tipo === 'ALUMNO' ? 'id_usuario_alumno' : 'id_usuario_docente';
    }

    public function tablaActor(): string
    {
        return $this->tipo === 'ALUMNO' ? 'alumno' : 'docente';
    }

    public function columnaActor(): string
    {
        return $this->tipo === 'ALUMNO' ? 'id_alumno' : 'id_docente';
    }

    public function tablaLogin(): string
    {
        return $this->tipo === 'ALUMNO' ? 'login_historial_alumno' : 'login_historial_docente';
    }

    public function columnaLogin(): string
    {
        return $this->tipo === 'ALUMNO' ? 'id_usuario_alumno' : 'id_usuario_docente';
    }

    public function getAuthIdentifierName(): string
    {
        return 'clave';
    }

    public function getAuthIdentifier(): string
    {
        return $this->clave();
    }

    public function getAuthPasswordName(): string
    {
        return 'contrasena_hash';
    }

    public function getAuthPassword(): string
    {
        return $this->contrasenaHash;
    }

    public function getRememberToken(): string
    {
        return '';
    }

    public function setRememberToken($value): void {}

    public function getRememberTokenName(): string
    {
        return '';
    }

    public function forceFill(array $atributos): self
    {
        if (array_key_exists('estado', $atributos)) {
            $this->estado = (bool) $atributos['estado'];
        }
        if (array_key_exists('bloqueado_hasta', $atributos)) {
            $valor = $atributos['bloqueado_hasta'];
            $this->bloqueado_hasta = $valor instanceof Carbon || $valor === null ? $valor : Carbon::parse($valor);
        }
        if (array_key_exists('intentos_fallidos', $atributos)) {
            $this->intentos_fallidos = (int) $atributos['intentos_fallidos'];
        }

        return $this;
    }

    public function save(): self
    {
        \Illuminate\Support\Facades\DB::table($this->tablaCuenta())->where($this->columnaId(), $this->id())->update([
            'estado' => $this->estado ? 1 : 0,
            'bloqueado_hasta' => $this->bloqueado_hasta,
            'intentos_fallidos' => $this->intentos_fallidos,
        ]);

        return $this;
    }

    public function fresh(): self
    {
        return app(\App\Identidad\Dominio\Contratos\RepositorioUsuarios::class)->buscarPorId($this->clave());
    }

    public function refresh(): self
    {
        $nueva = $this->fresh();
        $this->estado = $nueva->estado;
        $this->bloqueado_hasta = $nueva->bloqueado_hasta;
        $this->intentos_fallidos = $nueva->intentos_fallidos;
        $this->ultimo_inicio_sesion = $nueva->ultimo_inicio_sesion;
        $this->contrasenaHash = $nueva->contrasenaHash;

        return $this;
    }
}
