<?php

namespace App\Servicios;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;

/**
 * Resuelve los accesos de un usuario sobre el esquema de roles y permisos.
 *
 * Hoy solo se exige el rol para entrar al modulo de administracion. El metodo
 * puede() ya resuelve permisos efectivos y queda disponible para cuando se
 * pueblen usuario_modulo, usuario_submodulo y usuario_permiso.
 */
class ServicioAccesos
{
    /** @var array<int, list<string>> */
    private array $rolesMemorizados = [];

    /**
     * Codigos de rol vigentes del usuario.
     *
     * @return list<string>
     */
    public function roles(Usuario $usuario): array
    {
        $idUsuario = (int) $usuario->getKey();

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

    public function esAdministrador(Usuario $usuario): bool
    {
        return $this->tieneAlgunRol($usuario, [Rol::ADMINISTRADOR]);
    }

    /**
     * @param  list<string>  $codigos
     */
    public function tieneAlgunRol(Usuario $usuario, array $codigos): bool
    {
        return array_intersect($codigos, $this->roles($usuario)) !== [];
    }

    /**
     * Permisos efectivos: la vista ya prioriza usuario_permiso sobre rol_permiso.
     */
    public function puede(Usuario $usuario, string $codigoPermiso): bool
    {
        return DB::table('vista_permisos_efectivos')
            ->where('id_usuario', (int) $usuario->getKey())
            ->where('codigo_permiso', $codigoPermiso)
            ->where('permitido', 1)
            ->exists();
    }

    public function olvidarMemoria(Usuario $usuario): void
    {
        unset($this->rolesMemorizados[(int) $usuario->getKey()]);
    }
}
