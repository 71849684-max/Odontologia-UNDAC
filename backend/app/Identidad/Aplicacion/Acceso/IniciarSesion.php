<?php

namespace App\Identidad\Aplicacion\Acceso;

use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Contratos\GestorSesion;
use App\Identidad\Dominio\Contratos\LimitadorIntentos;
use App\Identidad\Dominio\Contratos\RegistradorIntentosAcceso;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use App\Identidad\Dominio\Contratos\VerificadorContrasena;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\CredencialesInvalidas;
use App\Identidad\Dominio\Excepciones\CuentaBloqueada;
use App\Identidad\Dominio\Excepciones\DemasiadosIntentos;

class IniciarSesion
{
    public function __construct(
        private readonly RepositorioUsuarios $usuarios,
        private readonly ConsultaAccesos $accesos,
        private readonly VerificadorContrasena $contrasenas,
        private readonly LimitadorIntentos $limitador,
        private readonly RegistradorIntentosAcceso $intentos,
        private readonly GestorSesion $sesion,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function ejecutar(
        string $nombreUsuario,
        string $contrasena,
        string $claveLimitador,
        ?string $direccionIp,
        ?string $agenteUsuario,
    ): array {
        if ($this->limitador->demasiados($claveLimitador, (int) config('acceso.intentos_por_minuto'))) {
            $this->intentos->registrar($nombreUsuario, $direccionIp, $agenteUsuario, null, false, 'LIMITE_DE_INTENTOS');

            throw new DemasiadosIntentos($this->limitador->segundosParaReintentar($claveLimitador));
        }

        $this->limitador->registrar($claveLimitador);

        $cuenta = $this->usuarios->buscarPorNombre($nombreUsuario);

        if ($cuenta === null) {
            $this->contrasenas->simularVerificacion($contrasena);
            $this->intentos->registrar($nombreUsuario, $direccionIp, $agenteUsuario, null, false, 'USUARIO_INEXISTENTE');
            throw new CredencialesInvalidas;
        }

        if (! $cuenta->estaActiva()) {
            $this->intentos->registrar($nombreUsuario, $direccionIp, $agenteUsuario, $cuenta, false, 'USUARIO_INACTIVO');
            throw new CredencialesInvalidas;
        }

        if ($cuenta->estaBloqueada()) {
            $this->intentos->registrar($nombreUsuario, $direccionIp, $agenteUsuario, $cuenta, false, 'USUARIO_BLOQUEADO');
            throw new CuentaBloqueada;
        }

        if (! $this->contrasenas->coincide($contrasena, $cuenta->hashContrasena())) {
            $this->usuarios->acumularFallo($cuenta);
            $this->intentos->registrar($nombreUsuario, $direccionIp, $agenteUsuario, $cuenta, false, 'CONTRASENA_INCORRECTA');
            throw new CredencialesInvalidas;
        }

        $this->sesion->iniciar($cuenta);
        $this->limitador->limpiar($claveLimitador);
        $this->usuarios->registrarInicioExitoso($cuenta);
        $this->intentos->registrar($nombreUsuario, $direccionIp, $agenteUsuario, $cuenta, true, null);

        return $this->datosSesion($cuenta);
    }

    /**
     * @return array<string, mixed>
     */
    public function datosSesion(Cuenta $cuenta): array
    {
        return [
            'usuario' => [
                'id' => $cuenta->id(),
                'nombre_usuario' => $cuenta->nombreUsuario(),
                'nombre' => $cuenta->nombreCompleto(),
                'correo' => $cuenta->correo(),
                'ultimo_inicio_sesion' => $cuenta->ultimoInicioSesionIso(),
            ],
            'roles' => $this->accesos->roles($cuenta),
            'es_administrador' => $this->accesos->esAdministrador($cuenta),
        ];
    }
}
