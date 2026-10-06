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
    public function ejecutar(string $clave, array $datos, string $claveOperador, ContextoOperacion $contexto): array
    {
        $cuenta = $this->usuarios->buscarPorId($clave);

        if ($cuenta->clave() === $claveOperador
            && array_key_exists('estado', $datos)
            && ! $datos['estado']
        ) {
            throw new OperacionNoPermitida('estado', 'No puedes desactivar tu propia cuenta.');
        }

        $antes = $this->usuarios->serializar($cuenta);
        $cuenta = $this->usuarios->actualizar($cuenta, $datos, (int) $contexto->idUsuario);
        $this->accesos->olvidarMemoria($cuenta);
        $despues = $this->usuarios->serializar($cuenta);

        $this->auditoria->registrar($contexto, $cuenta->tipoCuenta() === 'ALUMNO' ? 'usuario_alumno' : 'usuario_docente', $cuenta->clave(), 'EDITAR', $antes, $despues);

        return $despues;
    }
}
