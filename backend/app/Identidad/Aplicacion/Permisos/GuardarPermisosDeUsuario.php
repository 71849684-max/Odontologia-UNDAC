<?php

namespace App\Identidad\Aplicacion\Permisos;

use App\Identidad\Dominio\ContextoOperacion;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Contratos\RepositorioPermisos;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;

class GuardarPermisosDeUsuario
{
    public function __construct(
        private readonly RepositorioUsuarios $usuarios,
        private readonly RepositorioPermisos $permisos,
        private readonly RegistradorAuditoria $auditoria,
        private readonly ObtenerPermisosDeUsuario $consulta,
    ) {}

    /**
     * @param  list<int>  $idsPermisos
     * @return array<string, mixed>
     */
    public function ejecutar(int $idUsuario, array $idsPermisos, int $idOperador, ContextoOperacion $contexto): array
    {
        $cuenta = $this->usuarios->buscarPorId($idUsuario);
        $antes = $this->permisos->idsEfectivos($cuenta);
        $this->permisos->sincronizar($cuenta, $idsPermisos, $idOperador);
        $despues = $this->permisos->idsEfectivos($cuenta);

        $this->auditoria->registrar(
            $contexto,
            'usuario_permiso',
            $cuenta->id(),
            'EDITAR',
            ['efectivos' => $antes],
            ['efectivos' => $despues],
        );

        return $this->consulta->ejecutar($idUsuario);
    }
}
