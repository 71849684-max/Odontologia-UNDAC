<?php

namespace App\Identidad\Aplicacion\Permisos;

use App\Identidad\Dominio\ContextoOperacion;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Contratos\RepositorioPermisos;

class GuardarPermisosDeRol
{
    public function __construct(
        private readonly RepositorioPermisos $permisos,
        private readonly RegistradorAuditoria $auditoria,
        private readonly ObtenerPermisosDeRol $consulta,
    ) {}

    /**
     * @param  list<int>  $idsPermisos
     * @return array<string, mixed>
     */
    public function ejecutar(string $codigoRol, array $idsPermisos, ContextoOperacion $contexto): array
    {
        $rol = $this->consulta->rolEditable($codigoRol);
        $antes = $this->permisos->idsDelRolCodigo($rol['codigo']);
        $despues = $this->permisos->sincronizarRol($rol['id'], $idsPermisos);

        $this->auditoria->registrar(
            $contexto,
            'rol_submodulo',
            $rol['id'],
            'EDITAR',
            ['efectivos' => $antes],
            ['efectivos' => $despues],
        );

        return $this->consulta->ejecutar($rol['codigo']);
    }
}
