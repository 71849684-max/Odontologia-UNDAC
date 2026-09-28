<?php

namespace App\Identidad\Infraestructura\Acceso;

use App\Identidad\Dominio\CodigoRol;
use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Support\Facades\DB;

class ConsultaAccesosSql implements ConsultaAccesos
{
    /** @var array<int, list<string>> */
    private array $rolesMemorizados = [];

    public function roles(Cuenta $cuenta): array
    {
        $idUsuario = $cuenta->id();

        if (! array_key_exists($idUsuario, $this->rolesMemorizados)) {
            $this->rolesMemorizados[$idUsuario] = DB::table('usuario_rol as ur')
                ->join('rol as r', 'r.id_rol', '=', 'ur.id_rol')
                ->where('ur.id_usuario', $idUsuario)
                ->where('ur.permitido', 1)
                ->where('r.estado', 1)
                ->where(fn ($consulta) => $consulta
                    ->whereNull('ur.fecha_inicio')
                    ->orWhereDate('ur.fecha_inicio', '<=', now()))
                ->where(fn ($consulta) => $consulta
                    ->whereNull('ur.fecha_fin')
                    ->orWhereDate('ur.fecha_fin', '>=', now()))
                ->pluck('r.codigo_rol')
                ->map(fn ($codigo) => (string) $codigo)
                ->all();
        }

        return $this->rolesMemorizados[$idUsuario];
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
        return DB::table('vista_permisos_efectivos')
            ->where('id_usuario', $cuenta->id())
            ->where('codigo_permiso', $codigoPermiso)
            ->where('permitido', 1)
            ->exists();
    }

    public function olvidarMemoria(Cuenta $cuenta): void
    {
        unset($this->rolesMemorizados[$cuenta->id()]);
    }
}
