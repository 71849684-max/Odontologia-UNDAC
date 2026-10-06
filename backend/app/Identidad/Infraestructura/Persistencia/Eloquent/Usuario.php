<?php

namespace App\Identidad\Infraestructura\Persistencia\Eloquent;

use App\Identidad\Dominio\Cuenta;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Usuario extends Authenticatable implements Cuenta
{
    protected $table = 'usuario';

    protected $primaryKey = 'id_usuario';

    const CREATED_AT = 'creado_en';

    const UPDATED_AT = 'actualizado_en';

    protected $authPasswordName = 'contrasena_hash';

    /**
     * La tabla usuario no tiene columna remember_token. Con el nombre vacio,
     * Authenticatable omite por completo el manejo del token de "recordarme".
     */
    protected $rememberTokenName = '';

    protected $fillable = [
        'id_persona',
        'nombre_usuario',
        'contrasena_hash',
        'estado',
        'creado_por',
        'actualizado_por',
    ];

    protected $hidden = [
        'contrasena_hash',
    ];

    protected function casts(): array
    {
        return [
            'estado' => 'boolean',
            'intentos_fallidos' => 'integer',
            'bloqueado_hasta' => 'datetime',
            'ultimo_inicio_sesion' => 'datetime',
            'contrasena_cambiada_en' => 'datetime',
        ];
    }

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'id_persona', 'id_persona');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Rol::class, 'usuario_rol', 'id_usuario', 'id_rol')
            ->withPivot(['permitido', 'fecha_inicio', 'fecha_fin']);
    }

    public function id(): int
    {
        return (int) $this->getKey();
    }

    public function tipoCuenta(): string
    {
        return 'DOCENTE';
    }

    public function clave(): string
    {
        return 'DOCENTE-'.$this->id();
    }

    public function idActor(): int
    {
        return (int) $this->id_persona;
    }

    public function idRol(): int
    {
        return 0;
    }

    public function nombreUsuario(): string
    {
        return (string) $this->nombre_usuario;
    }

    public function correo(): ?string
    {
        $this->loadMissing('persona');

        return $this->persona?->correo;
    }

    public function estaActiva(): bool
    {
        return (bool) $this->estado;
    }

    public function estaBloqueada(): bool
    {
        return $this->estaBloqueado();
    }

    public function hashContrasena(): string
    {
        return (string) $this->contrasena_hash;
    }

    public function ultimoInicioSesionIso(): ?string
    {
        return $this->ultimo_inicio_sesion?->toIso8601String();
    }

    public function estaBloqueado(): bool
    {
        return $this->bloqueado_hasta !== null && $this->bloqueado_hasta->isFuture();
    }

    public function nombreCompleto(): string
    {
        $this->loadMissing('persona');

        return $this->persona?->nombreCompleto() ?: $this->nombre_usuario;
    }
}
