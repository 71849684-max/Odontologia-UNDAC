<?php

namespace App\Identidad\Aplicacion\Cuenta;

use App\Identidad\Dominio\ContextoOperacion;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use App\Identidad\Dominio\Contratos\VerificadorContrasena;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;

class CambiarMiContrasena
{
    public function __construct(
        private readonly RepositorioUsuarios $usuarios,
        private readonly VerificadorContrasena $verificador,
        private readonly RegistradorAuditoria $auditoria,
    ) {}

    public function ejecutar(Cuenta $cuenta, string $actual, string $nueva, ContextoOperacion $contexto): void
    {
        $vigente = $this->usuarios->buscarPorId($cuenta->clave());

        if (! $this->verificador->coincide($actual, $vigente->hashContrasena())) {
            throw new OperacionNoPermitida('contrasena_actual', 'La contraseña actual no es correcta.');
        }

        if ($this->verificador->coincide($nueva, $vigente->hashContrasena())) {
            throw new OperacionNoPermitida('contrasena', 'La nueva contraseña debe ser distinta de la actual.');
        }

        $this->usuarios->cambiarContrasena($vigente, $nueva);

        $this->auditoria->registrar(
            $contexto,
            $vigente->tipoCuenta() === 'ALUMNO' ? 'usuario_alumno' : 'usuario_docente',
            $vigente->clave(),
            'CAMBIAR_CONTRASENA',
        );
    }
}
