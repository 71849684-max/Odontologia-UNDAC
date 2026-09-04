<?php

namespace App\Servicios;

use App\Models\Usuario;
use Illuminate\Support\Facades\DB;

/**
 * Catalogo y sobrescrituras de permisos por usuario sobre el esquema clinico.
 */
class ServicioPermisos
{
    /**
     * @return list<array<string, mixed>>
     */
    public function catalogo(): array
    {
        return DB::table('permiso as p')
            ->join('modulo as m', 'm.id_modulo', '=', 'p.id_modulo')
            ->leftJoin('submodulo as s', 's.id_submodulo', '=', 'p.id_submodulo')
            ->where('p.estado', 1)
            ->where('m.estado', 1)
            ->orderBy('m.orden')
            ->orderBy('s.orden')
            ->orderBy('p.accion')
            ->get([
                'p.id_permiso',
                'p.codigo_permiso',
                'p.nombre_permiso',
                'p.accion',
                'p.descripcion_permiso',
                'm.codigo_modulo',
                'm.nombre_modulo',
                's.codigo_submodulo',
                's.nombre_submodulo',
            ])
            ->map(fn ($fila) => [
                'id' => (int) $fila->id_permiso,
                'codigo' => (string) $fila->codigo_permiso,
                'nombre' => (string) $fila->nombre_permiso,
                'accion' => (string) $fila->accion,
                'descripcion' => $fila->descripcion_permiso,
                'modulo' => (string) $fila->nombre_modulo,
                'codigo_modulo' => (string) $fila->codigo_modulo,
                'seccion' => $fila->nombre_submodulo
                    ? (string) $fila->nombre_submodulo
                    : (string) $fila->nombre_modulo,
            ])
            ->all();
    }

    /**
     * Permisos que el rol vigente del usuario concede por defecto.
     *
     * @return list<int>
     */
    public function idsDelRol(Usuario $usuario): array
    {
        $roles = app(ServicioAccesos::class)->roles($usuario);

        if ($roles === []) {
            return [];
        }

        return DB::table('rol_permiso as rp')
            ->join('rol as r', 'r.id_rol', '=', 'rp.id_rol')
            ->whereIn('r.codigo_rol', $roles)
            ->where('rp.permitido', 1)
            ->where('r.estado', 1)
            ->distinct()
            ->pluck('rp.id_permiso')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    /**
     * Permisos efectivos (vista): usuario_permiso gana sobre rol_permiso.
     *
     * @return list<int>
     */
    public function idsEfectivos(Usuario $usuario): array
    {
        return DB::table('vista_permisos_efectivos')
            ->where('id_usuario', (int) $usuario->getKey())
            ->where('permitido', 1)
            ->pluck('id_permiso')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    /**
     * Ajusta usuario_permiso para que el conjunto efectivo coincida con $deseados.
     *
     * @param  list<int>  $deseados
     */
    public function sincronizar(Usuario $usuario, array $deseados, int $idOperador): void
    {
        $deseados = array_values(array_unique(array_map('intval', $deseados)));
        $delRol = $this->idsDelRol($usuario);
        $todos = DB::table('permiso')->where('estado', 1)->pluck('id_permiso')->map(fn ($id) => (int) $id)->all();

        DB::transaction(function () use ($usuario, $deseados, $delRol, $todos, $idOperador) {
            foreach ($todos as $idPermiso) {
                $quiere = in_array($idPermiso, $deseados, true);
                $tienePorRol = in_array($idPermiso, $delRol, true);

                if ($quiere === $tienePorRol) {
                    DB::table('usuario_permiso')
                        ->where('id_usuario', $usuario->getKey())
                        ->where('id_permiso', $idPermiso)
                        ->delete();

                    continue;
                }

                DB::table('usuario_permiso')->updateOrInsert(
                    [
                        'id_usuario' => $usuario->getKey(),
                        'id_permiso' => $idPermiso,
                    ],
                    [
                        'permitido' => $quiere ? 1 : 0,
                        'alcance_datos' => 'GLOBAL',
                        'fecha_inicio' => null,
                        'fecha_fin' => null,
                        'motivo' => $quiere ? 'Concedido individualmente' : 'Denegado individualmente',
                        'actualizado_en' => now(),
                        'actualizado_por' => $idOperador,
                    ],
                );
            }
        });
    }

    public function restaurarRol(Usuario $usuario): void
    {
        DB::table('usuario_permiso')
            ->where('id_usuario', $usuario->getKey())
            ->delete();
    }
}
