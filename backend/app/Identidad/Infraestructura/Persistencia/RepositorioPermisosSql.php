<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\Contratos\RepositorioPermisos;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Support\Facades\DB;

/**
 * Los permisos del rol viven en rol_submodulo y son compartidos. Los ajustes
 * de una persona se guardan como excepciones en usuario_*_submodulo:
 * permitido=1 concede un submódulo extra y permitido=0 retira uno del rol.
 */
class RepositorioPermisosSql implements RepositorioPermisos
{
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
        if ($cuenta->idRol() === 0) {
            return [];
        }

        return DB::table('rol_submodulo')
            ->where('id_rol', $cuenta->idRol())
            ->where('estado', 1)
            ->pluck('id_submodulo')
            ->map(fn ($id) => (int) $id)
            ->sort()
            ->values()
            ->all();
    }

    public function idsEfectivos(Cuenta $cuenta): array
    {
        if ($cuenta->idRol() === 0) {
            return [];
        }

        $ids = array_fill_keys($this->idsDelRol($cuenta), true);

        foreach ($this->excepciones($cuenta) as $idSubmodulo => $permitido) {
            if ($permitido) {
                $ids[$idSubmodulo] = true;
            } else {
                unset($ids[$idSubmodulo]);
            }
        }

        $resultado = array_map('intval', array_keys($ids));
        sort($resultado);

        return $resultado;
    }

    public function codigosEfectivos(Cuenta $cuenta): array
    {
        $ids = $this->idsEfectivos($cuenta);

        if ($ids === []) {
            return [];
        }

        return DB::table('submodulo')
            ->whereIn('id_submodulo', $ids)
            ->where('estado', 1)
            ->orderBy('codigo_submodulo')
            ->pluck('codigo_submodulo')
            ->map(fn ($codigo) => (string) $codigo)
            ->values()
            ->all();
    }

    public function rolPorCodigo(string $codigoRol): ?array
    {
        $fila = DB::table('rol')
            ->where('codigo_rol', $codigoRol)
            ->where('estado', 1)
            ->first(['id_rol', 'codigo_rol', 'nombre_rol', 'descripcion']);

        if ($fila === null) {
            return null;
        }

        return [
            'id' => (int) $fila->id_rol,
            'codigo' => (string) $fila->codigo_rol,
            'nombre' => (string) $fila->nombre_rol,
            'descripcion' => $fila->descripcion,
        ];
    }

    public function idsDelRolCodigo(string $codigoRol): array
    {
        return DB::table('rol_submodulo as rs')
            ->join('rol as r', 'r.id_rol', '=', 'rs.id_rol')
            ->where('r.codigo_rol', $codigoRol)
            ->where('r.estado', 1)
            ->where('rs.estado', 1)
            ->pluck('rs.id_submodulo')
            ->map(fn ($id) => (int) $id)
            ->sort()
            ->values()
            ->all();
    }

    public function sincronizar(Cuenta $cuenta, array $deseados, int $idOperador): void
    {
        $validos = DB::table('submodulo')->where('estado', 1)->pluck('id_submodulo')->map(fn ($id) => (int) $id)->all();
        $deseados = array_values(array_intersect(array_unique(array_map('intval', $deseados)), $validos));
        $delRol = $this->idsDelRol($cuenta);

        $filas = [];
        foreach (array_diff($deseados, $delRol) as $id) {
            $filas[$id] = 1;
        }
        foreach (array_diff($delRol, $deseados) as $id) {
            $filas[$id] = 0;
        }

        [$tabla, $columna] = $this->tabla($cuenta);

        DB::transaction(function () use ($cuenta, $filas, $tabla, $columna) {
            DB::table($tabla)->where($columna, $cuenta->id())->delete();

            foreach ($filas as $idSubmodulo => $permitido) {
                DB::table($tabla)->insert([
                    $columna => $cuenta->id(),
                    'id_submodulo' => $idSubmodulo,
                    'permitido' => $permitido,
                    'creado_en' => now(),
                ]);
            }
        });
    }

    public function sincronizarRol(int $idRol, array $deseados): array
    {
        $validos = DB::table('submodulo')->where('estado', 1)->pluck('id_submodulo')->map(fn ($id) => (int) $id)->all();
        $deseados = array_values(array_intersect(array_unique(array_map('intval', $deseados)), $validos));
        sort($deseados);

        DB::transaction(function () use ($idRol, $deseados) {
            DB::table('rol_submodulo')->where('id_rol', $idRol)->delete();

            foreach ($deseados as $idSubmodulo) {
                DB::table('rol_submodulo')->insert([
                    'id_rol' => $idRol,
                    'id_submodulo' => $idSubmodulo,
                    'estado' => 1,
                    'creado_en' => now(),
                ]);
            }
        });

        return $deseados;
    }

    public function restaurarRol(Cuenta $cuenta): void
    {
        [$tabla, $columna] = $this->tabla($cuenta);
        DB::table($tabla)->where($columna, $cuenta->id())->delete();
    }

    /**
     * @return array<int, bool>
     */
    private function excepciones(Cuenta $cuenta): array
    {
        [$tabla, $columna] = $this->tabla($cuenta);

        return DB::table($tabla)
            ->where($columna, $cuenta->id())
            ->pluck('permitido', 'id_submodulo')
            ->mapWithKeys(fn ($permitido, $id) => [(int) $id => (bool) $permitido])
            ->all();
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function tabla(Cuenta $cuenta): array
    {
        return $cuenta->tipoCuenta() === 'ALUMNO'
            ? ['usuario_alumno_submodulo', 'id_usuario_alumno']
            : ['usuario_docente_submodulo', 'id_usuario_docente'];
    }
}
