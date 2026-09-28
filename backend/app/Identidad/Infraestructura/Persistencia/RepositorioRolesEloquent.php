<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\Contratos\RepositorioRoles;
use App\Identidad\Infraestructura\Persistencia\Eloquent\Rol;

class RepositorioRolesEloquent implements RepositorioRoles
{
    public function listarActivos(): array
    {
        return Rol::query()
            ->where('estado', 1)
            ->orderBy('nombre_rol')
            ->get(['id_rol', 'codigo_rol', 'nombre_rol', 'descripcion_rol'])
            ->map(fn (Rol $rol) => [
                'id' => (int) $rol->getKey(),
                'codigo' => $rol->codigo_rol,
                'nombre' => $rol->nombre_rol,
                'descripcion' => $rol->descripcion_rol,
            ])
            ->all();
    }
}
