<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Contratos\RepositorioPermisos;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Support\Facades\DB;

class RepositorioPermisosSql implements RepositorioPermisos
{
    public function __construct(private readonly ConsultaAccesos $accesos) {}

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

    public function idsDelRol(Cuenta $cuenta): array
    {
        $roles = $this->accesos->roles($cuenta);

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

    public function idsEfectivos(Cuenta $cuenta): array
    {
        return DB::table('vista_permisos_efectivos')
            ->where('id_usuario', $cuenta->id())
            ->where('permitido', 1)
            ->pluck('id_permiso')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    public function sincronizar(Cuenta $cuenta, array $deseados, int $idOperador): void
    {
        $deseados = array_values(array_unique(array_map('intval', $deseados)));
        $delRol = $this->idsDelRol($cuenta);
        $todos = DB::table('permiso')->where('estado', 1)->pluck('id_permiso')->map(fn ($id) => (int) $id)->all();

        DB::transaction(function () use ($cuenta, $deseados, $delRol, $todos, $idOperador) {
            foreach ($todos as $idPermiso) {
                $quiere = in_array($idPermiso, $deseados, true);
                $tienePorRol = in_array($idPermiso, $delRol, true);

                if ($quiere === $tienePorRol) {
                    DB::table('usuario_permiso')
                        ->where('id_usuario', $cuenta->id())
                        ->where('id_permiso', $idPermiso)
                        ->delete();

                    continue;
                }

                DB::table('usuario_permiso')->updateOrInsert(
                    [
                        'id_usuario' => $cuenta->id(),
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

    public function restaurarRol(Cuenta $cuenta): void
    {
        DB::table('usuario_permiso')
            ->where('id_usuario', $cuenta->id())
            ->delete();
    }
}
