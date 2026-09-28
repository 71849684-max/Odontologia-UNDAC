<?php

namespace App\Identidad\Aplicacion\Usuarios;

use App\Identidad\Dominio\ContextoOperacion;
use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;

class CambiarEstadoUsuario
{
    public function __construct(
        private readonly RepositorioUsuarios $usuarios,
        private readonly ConsultaAccesos $accesos,
        private readonly RegistradorAuditoria $auditoria,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function ejecutar(int $idUsuario, bool $estado, int $idOperador, ContextoOperacion $contexto): array
    {
        $cuenta = $this->usuarios->buscarPorId($idUsuario);

        if ($cuenta->id() === $idOperador && ! $estado) {
            throw new OperacionNoPermitida('estado', 'No puedes desactivar tu propia cuenta.');
        }

        $antes = $this->usuarios->serializar($cuenta);
        $cuenta = $this->usuarios->cambiarEstado($cuenta, $estado, $idOperador);
        $this->accesos->olvidarMemoria($cuenta);
        $despues = $this->usuarios->serializar($cuenta);

        $this->auditoria->registrar(
            $contexto,
            'usuario',
            $cuenta->id(),
            $estado ? 'ACTIVAR' : 'DESACTIVAR',
            $antes,
            $despues,
        );

        return $despues;
    }
}
