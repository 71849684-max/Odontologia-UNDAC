<?php

namespace App\Identidad\Aplicacion\Usuarios;

use App\Identidad\Dominio\ContextoOperacion;
use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;

class ActualizarUsuario
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
    public function ejecutar(int $idUsuario, array $datos, int $idOperador, ContextoOperacion $contexto): array
    {
        $cuenta = $this->usuarios->buscarPorId($idUsuario);

        if ($cuenta->id() === $idOperador
            && array_key_exists('estado', $datos)
            && ! $datos['estado']
        ) {
            throw new OperacionNoPermitida('estado', 'No puedes desactivar tu propia cuenta.');
        }

        $antes = $this->usuarios->serializar($cuenta);
        $cuenta = $this->usuarios->actualizar($cuenta, $datos, $idOperador);
        $this->accesos->olvidarMemoria($cuenta);
        $despues = $this->usuarios->serializar($cuenta);

        $this->auditoria->registrar($contexto, 'usuario', $cuenta->id(), 'EDITAR', $antes, $despues);

        return $despues;
    }
}
