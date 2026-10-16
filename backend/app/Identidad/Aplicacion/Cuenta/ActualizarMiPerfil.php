<?php

namespace App\Identidad\Aplicacion\Cuenta;

use App\Identidad\Dominio\ContextoOperacion;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use App\Identidad\Dominio\Cuenta;

class ActualizarMiPerfil
{
    public function __construct(
        private readonly RepositorioUsuarios $usuarios,
        private readonly RegistradorAuditoria $auditoria,
    ) {}

    /**
     * @param  array{nombres: string, apellidos: string, correo?: ?string, telefono?: ?string}  $datos
     * @return array<string, mixed>
     */
    public function ejecutar(Cuenta $cuenta, array $datos, ContextoOperacion $contexto): array
    {
        $antes = $this->usuarios->serializar($cuenta);
        $actualizada = $this->usuarios->actualizarPerfil($cuenta, $datos);
        $despues = $this->usuarios->serializar($actualizada);

        $this->auditoria->registrar(
            $contexto,
            $actualizada->tipoCuenta() === 'ALUMNO' ? 'usuario_alumno' : 'usuario_docente',
            $actualizada->clave(),
            'ACTUALIZAR_PERFIL',
            $antes,
            $despues,
        );

        return $despues;
    }
}
