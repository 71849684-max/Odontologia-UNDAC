<?php

namespace App\Identidad\Aplicacion\Usuarios;

use App\Identidad\Dominio\ContextoOperacion;
use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;

class CrearUsuario
{
    public function __construct(
        private readonly RepositorioUsuarios $usuarios,
        private readonly ConsultaAccesos $accesos,
        private readonly RegistradorAuditoria $auditoria,
    ) {}

    /**
     * @param  array<string, mixed>  $datos
     * @return array<string, mixed>
     */
    public function ejecutar(array $datos, int $idOperador, ContextoOperacion $contexto): array
    {
        $cuenta = $this->usuarios->crear($datos, $idOperador);
        $this->accesos->olvidarMemoria($cuenta);
        $serializado = $this->usuarios->serializar($cuenta);

        $this->auditoria->registrar($contexto, 'usuario', $cuenta->id(), 'CREAR', null, $serializado);

        return $serializado;
    }
}
