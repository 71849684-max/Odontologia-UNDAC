<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Usuario extends Authenticatable
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

    public function estaBloqueado(): bool
    {
        return $this->bloqueado_hasta !== null && $this->bloqueado_hasta->isFuture();
    }

    public function nombreCompleto(): string
    {
        return $this->persona?->nombreCompleto() ?: $this->nombre_usuario;
    }
}
