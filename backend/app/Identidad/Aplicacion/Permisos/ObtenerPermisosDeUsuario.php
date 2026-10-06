<?php

namespace App\Identidad\Aplicacion\Permisos;

use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Contratos\RepositorioPermisos;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;

class ObtenerPermisosDeUsuario
{
    public function __construct(
        private readonly RepositorioUsuarios $usuarios,
        private readonly RepositorioPermisos $permisos,
        private readonly ConsultaAccesos $accesos,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function ejecutar(string $clave): array
    {
        $cuenta = $this->usuarios->buscarPorId($clave);
        $delRol = $this->permisos->idsDelRol($cuenta);
        $efectivos = $this->permisos->idsEfectivos($cuenta);

        return [
            'usuario' => [
                'id' => $cuenta->clave(),
                'nombre' => $cuenta->nombreCompleto(),
                'nombre_usuario' => $cuenta->nombreUsuario(),
                'roles' => $this->accesos->roles($cuenta),
                'estado' => $cuenta->estaActiva(),
            ],
            'catalogo' => $this->permisos->catalogo(),
            'del_rol' => $delRol,
            'efectivos' => $efectivos,
            'adicionales' => count(array_diff($efectivos, $delRol)),
        ];
    }
}
