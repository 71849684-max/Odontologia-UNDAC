<?php

namespace App\Identidad\Aplicacion\Usuarios;

use App\Identidad\Dominio\ContextoOperacion;
use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;

/**
 * Restablecimiento administrativo: el administrador define una contraseña temporal
 * y la comunica al usuario por un canal institucional.
 */
class RestablecerContrasena
{
    public function __construct(
        private readonly RepositorioUsuarios $usuarios,
        private readonly ConsultaAccesos $accesos,
        private readonly RegistradorAuditoria $auditoria,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function ejecutar(string $clave, string $nueva, string $claveOperador, ContextoOperacion $contexto): array
    {
        if ($clave === $claveOperador) {
            throw new OperacionNoPermitida('contrasena', 'Cambia tu propia contraseña desde Mi perfil.');
        }

        $cuenta = $this->usuarios->cambiarContrasena($this->usuarios->buscarPorId($clave), $nueva);
        $this->accesos->olvidarMemoria($cuenta);

        $this->auditoria->registrar(
            $contexto,
            $cuenta->tipoCuenta() === 'ALUMNO' ? 'usuario_alumno' : 'usuario_docente',
            $cuenta->clave(),
            'RESTABLECER_CONTRASENA',
        );

        return $this->usuarios->serializar($cuenta);
    }
}
