<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Rol extends Model
{
    public const ADMINISTRADOR = 'ADMINISTRADOR';

    protected $table = 'rol';

    protected $primaryKey = 'id_rol';

    const CREATED_AT = 'creado_en';

    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'codigo_rol',
        'nombre_rol',
        'descripcion_rol',
        'es_supervisor_general',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'es_supervisor_general' => 'boolean',
            'estado' => 'boolean',
        ];
    }

    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(Usuario::class, 'usuario_rol', 'id_rol', 'id_usuario');
    }
}
