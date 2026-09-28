<?php

namespace App\Identidad\Aplicacion\Configuracion;

use App\Identidad\Dominio\ContextoOperacion;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Contratos\RepositorioConfiguracion;

class GuardarConfiguracion
{
    public function __construct(
        private readonly RepositorioConfiguracion $configuracion,
        private readonly RegistradorAuditoria $auditoria,
        private readonly ListarConfiguracion $listar,
    ) {}

    /**
     * @param  array<string, string|null>  $valores
     * @return array{data: list<array<string, mixed>>}
     */
    public function ejecutar(array $valores, int $idOperador, ContextoOperacion $contexto): array
    {
        $cambios = $this->configuracion->guardar($valores, $idOperador);

        $this->auditoria->registrar(
            $contexto,
            'configuracion_sistema',
            implode(',', array_keys($valores)),
            'EDITAR',
            $cambios['antes'],
            $cambios['despues'],
        );

        return $this->listar->ejecutar();
    }
}
