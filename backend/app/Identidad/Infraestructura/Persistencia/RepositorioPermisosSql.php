<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\Contratos\RepositorioPermisos;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Support\Facades\DB;

class RepositorioPermisosSql implements RepositorioPermisos
{
    /**
     * Accesos sembrados por rol. Restaurar vuelve a este conjunto.
     *
     * @var array<string, list<int>>
     */
    private const DEFECTO_POR_ROL = [
        'ADMINISTRADOR' => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
        'DOCENTE' => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18],
        'ALUMNO' => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    ];

    public function catalogo(): array
    {
        return DB::table('submodulo as s')
            ->join('modulo as m', 'm.id_modulo', '=', 's.id_modulo')
            ->where('s.estado', 1)
            ->where('m.estado', 1)
            ->orderBy('m.orden')
            ->orderBy('s.orden')
            ->get([
                's.id_submodulo',
                's.codigo_submodulo',
                's.nombre_submodulo',
                's.descripcion',
                'm.codigo_modulo',
                'm.nombre_modulo',
            ])
            ->map(fn ($fila) => [
                'id' => (int) $fila->id_submodulo,
                'codigo' => (string) $fila->codigo_submodulo,
                'nombre' => (string) $fila->nombre_submodulo,
                'accion' => 'Acceder',
                'descripcion' => $fila->descripcion,
                'modulo' => (string) $fila->nombre_modulo,
                'codigo_modulo' => (string) $fila->codigo_modulo,
                'seccion' => (string) $fila->nombre_submodulo,
            ])
            ->all();
    }

    public function idsDelRol(Cuenta $cuenta): array
    {
        return $this->idsEfectivos($cuenta);
    }

    public function idsEfectivos(Cuenta $cuenta): array
    {
        if ($cuenta->idRol() === 0) {
            return [];
        }

        return DB::table('rol_submodulo')
            ->where('id_rol', $cuenta->idRol())
            ->where('estado', 1)
            ->pluck('id_submodulo')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    public function sincronizar(Cuenta $cuenta, array $deseados, int $idOperador): void
    {
        $this->reemplazar($cuenta->idRol(), array_values(array_unique(array_map('intval', $deseados))));
    }

    public function restaurarRol(Cuenta $cuenta): void
    {
        $codigo = DB::table('rol')->where('id_rol', $cuenta->idRol())->value('codigo_rol');
        $defecto = self::DEFECTO_POR_ROL[(string) $codigo] ?? [];
        $this->reemplazar($cuenta->idRol(), $defecto);
    }

    /**
     * @param  list<int>  $ids
     */
    private function reemplazar(int $idRol, array $ids): void
    {
        DB::transaction(function () use ($idRol, $ids) {
            DB::table('rol_submodulo')->where('id_rol', $idRol)->delete();

            foreach ($ids as $idSubmodulo) {
                DB::table('rol_submodulo')->insert([
                    'id_rol' => $idRol,
                    'id_submodulo' => $idSubmodulo,
                    'estado' => 1,
                    'creado_en' => now(),
                ]);
            }
        });
    }
}
