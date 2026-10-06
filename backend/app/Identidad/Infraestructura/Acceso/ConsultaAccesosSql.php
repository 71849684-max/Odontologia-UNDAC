<?php

namespace App\Identidad\Infraestructura\Acceso;

use App\Identidad\Dominio\CodigoRol;
use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Support\Facades\DB;

class ConsultaAccesosSql implements ConsultaAccesos
{
    /** @var array<string, list<string>> */
    private array $rolesMemorizados = [];

    public function roles(Cuenta $cuenta): array
    {
        $clave = $cuenta->clave();

        if (! array_key_exists($clave, $this->rolesMemorizados)) {
            $tabla = $cuenta->tipoCuenta() === 'ALUMNO' ? 'usuario_alumno' : 'usuario_docente';
            $columna = $cuenta->tipoCuenta() === 'ALUMNO' ? 'id_usuario_alumno' : 'id_usuario_docente';

            $codigo = DB::table($tabla.' as ua')
                ->join('rol as r', 'r.id_rol', '=', 'ua.id_rol')
                ->where('ua.'.$columna, $cuenta->id())
                ->where('ua.estado', 1)
                ->where('r.estado', 1)
                ->value('r.codigo_rol');

            $this->rolesMemorizados[$clave] = $codigo === null ? [] : [(string) $codigo];
        }

        return $this->rolesMemorizados[$clave];
    }

    public function esAdministrador(Cuenta $cuenta): bool
    {
        return $this->tieneAlgunRol($cuenta, [CodigoRol::ADMINISTRADOR]);
    }

    public function tieneAlgunRol(Cuenta $cuenta, array $codigos): bool
    {
        return array_intersect($codigos, $this->roles($cuenta)) !== [];
    }

    public function puede(Cuenta $cuenta, string $codigoPermiso): bool
    {
        $roles = $this->roles($cuenta);

        if ($roles === []) {
            return false;
        }

        return DB::table('rol_submodulo as rs')
            ->join('rol as r', 'r.id_rol', '=', 'rs.id_rol')
            ->join('submodulo as s', 's.id_submodulo', '=', 'rs.id_submodulo')
            ->whereIn('r.codigo_rol', $roles)
            ->where('r.estado', 1)
            ->where('rs.estado', 1)
            ->where('s.estado', 1)
            ->where('s.codigo_submodulo', $codigoPermiso)
            ->exists();
    }

    public function olvidarMemoria(Cuenta $cuenta): void
    {
        unset($this->rolesMemorizados[$cuenta->clave()]);
    }
}
