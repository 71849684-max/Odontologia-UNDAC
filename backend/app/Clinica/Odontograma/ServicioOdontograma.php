<?php

namespace App\Clinica\Odontograma;

use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Support\Facades\DB;

class ServicioOdontograma
{
    public function leer(int $idHistoria): ?array
    {
        $filas = DB::table('odontograma')
            ->where('id_historia_clinica', $idHistoria)
            ->orderBy('id_odontograma')
            ->get(['especificaciones']);

        foreach ($filas as $fila) {
            $registro = json_decode((string) $fila->especificaciones, true);
            if (is_array($registro) && ($registro['version'] ?? null) === 1) {
                return $registro;
            }
        }

        return null;
    }

    public function guardar(int $idHistoria, array $registro, Cuenta $actor): array
    {
        if (($registro['version'] ?? null) !== 1 || ! is_array($registro['examinations'] ?? null)) {
            throw new OperacionNoPermitida('odontograma', 'El registro del odontograma no tiene el formato esperado.');
        }

        $json = json_encode($registro, JSON_UNESCAPED_UNICODE);
        if ($json === false || strlen($json) > 65000) {
            throw new OperacionNoPermitida('odontograma', 'El odontograma supera el tamaño que se puede conservar en la historia.');
        }

        DB::transaction(function () use ($idHistoria, $registro, $json, $actor) {
            $this->eliminar($idHistoria);
            $primero = true;
            foreach ($registro['examinations'] as $examen) {
                if (! is_array($examen)) {
                    continue;
                }
                $idOdontograma = DB::table('odontograma')->insertGetId([
                    'id_historia_clinica' => $idHistoria,
                    'id_docente_responsable' => $actor->tipoCuenta() === 'DOCENTE' ? $actor->idActor() : null,
                    'tipo_denticion' => 'PERMANENTE',
                    'fecha_evaluacion' => $this->fecha($examen['date'] ?? null),
                    'motivo_evaluacion' => isset($examen['reason']) ? mb_substr((string) $examen['reason'], 0, 80) : null,
                    'numero_cop' => isset($examen['cop']) ? mb_substr((string) $examen['cop'], 0, 8) : null,
                    'especificaciones' => $primero ? $json : null,
                    'observaciones' => isset($examen['observations']) ? (string) $examen['observations'] : null,
                    'estado' => ($examen['status'] ?? '') === 'closed' ? 'CERRADO' : 'BORRADOR',
                    'cerrado_en' => ($examen['status'] ?? '') === 'closed' ? ($examen['closedAt'] ?? now()) : null,
                    'creado_en' => now(),
                ]);
                $primero = false;
                $this->normalizarHallazgos($idOdontograma, $examen);
            }
        });

        return $registro;
    }

    private function eliminar(int $idHistoria): void
    {
        $odontogramas = DB::table('odontograma')->where('id_historia_clinica', $idHistoria)->pluck('id_odontograma');
        if ($odontogramas->isEmpty()) {
            return;
        }
        $piezas = DB::table('odontograma_pieza')->whereIn('id_odontograma', $odontogramas)->pluck('id_odontograma_pieza');
        $hallazgos = DB::table('odontograma_hallazgo')->whereIn('id_odontograma', $odontogramas)->pluck('id_odontograma_hallazgo');
        if ($hallazgos->isNotEmpty()) {
            DB::table('odontograma_hallazgo_pieza')->whereIn('id_odontograma_hallazgo', $hallazgos)->delete();
            DB::table('odontograma_hallazgo')->whereIn('id_odontograma_hallazgo', $hallazgos)->delete();
        }
        if ($piezas->isNotEmpty()) {
            DB::table('odontograma_superficie')->whereIn('id_odontograma_pieza', $piezas)->delete();
            DB::table('odontograma_pieza')->whereIn('id_odontograma_pieza', $piezas)->delete();
        }
        DB::table('odontograma')->whereIn('id_odontograma', $odontogramas)->delete();
    }

    private function normalizarHallazgos(int $idOdontograma, array $examen): void
    {
        $piezas = [];
        $marcas = [];
        foreach ((array) ($examen['teeth'] ?? []) as $codigo => $diente) {
            if (! is_array($diente)) {
                continue;
            }
            foreach ((array) ($diente['findings'] ?? []) as $marca) {
                $marcas[] = ['codigo' => (string) $codigo, 'superficie' => null, 'marca' => $marca];
            }
            foreach ((array) ($diente['surfaces'] ?? []) as $superficie => $detalle) {
                foreach ((array) ($detalle['findings'] ?? []) as $marca) {
                    $marcas[] = ['codigo' => (string) $codigo, 'superficie' => (string) $superficie, 'marca' => $marca];
                }
            }
        }
        foreach ((array) ($examen['ranges'] ?? []) as $marca) {
            $dientes = (array) ($marca['teeth'] ?? []);
            $marcas[] = ['codigo' => (string) ($dientes[0] ?? ''), 'superficie' => $marca['surface'] ?? null, 'marca' => $marca, 'extra' => $dientes];
        }

        foreach ($marcas as $item) {
            $idPiezaCatalogo = DB::table('pieza_dental')->where('codigo_fdi', $item['codigo'])->value('id_pieza_dental');
            $codigoHallazgo = (string) ($item['marca']['code'] ?? '');
            $idHallazgo = DB::table('catalogo_hallazgo_dental')
                ->where('estado', 1)
                ->where(function ($q) use ($codigoHallazgo) {
                    $q->where('simbolo', $codigoHallazgo)->orWhere('codigo', $codigoHallazgo);
                })
                ->value('id_hallazgo_dental');
            if (! $idPiezaCatalogo || ! $idHallazgo || ! is_array($item['marca'])) {
                continue;
            }
            if (! isset($piezas[$item['codigo']])) {
                $piezas[$item['codigo']] = DB::table('odontograma_pieza')->insertGetId([
                    'id_odontograma' => $idOdontograma,
                    'id_pieza_dental' => $idPiezaCatalogo,
                    'perdida' => 0,
                ]);
            }
            $idSuperficie = null;
            if (! empty($item['superficie'])) {
                $idSuperficie = DB::table('odontograma_superficie')->where('id_odontograma_pieza', $piezas[$item['codigo']])->where('superficie', $item['superficie'])->value('id_odontograma_superficie');
                if (! $idSuperficie) {
                    $idSuperficie = DB::table('odontograma_superficie')->insertGetId([
                        'id_odontograma_pieza' => $piezas[$item['codigo']],
                        'superficie' => mb_substr((string) $item['superficie'], 0, 30),
                    ]);
                }
            }
            $idMarca = DB::table('odontograma_hallazgo')->insertGetId([
                'id_odontograma' => $idOdontograma,
                'id_hallazgo_dental' => $idHallazgo,
                'id_odontograma_superficie' => $idSuperficie,
                'condicion' => ($item['marca']['condition'] ?? '') === 'bad' ? 'MALO' : 'BUENO',
                'representacion' => ($item['marca']['representation'] ?? '') === 'traced' ? 'TRAZADO' : 'ESQUEMATICA',
                'trazo' => isset($item['marca']['points']) ? json_encode($item['marca']['points']) : null,
                'descripcion' => $item['marca']['note'] ?? null,
                'activo' => 1,
                'creado_en' => now(),
            ]);
            $dientes = $item['extra'] ?? [$item['codigo']];
            $orden = 0;
            foreach ($dientes as $codigo) {
                $idCatalogo = DB::table('pieza_dental')->where('codigo_fdi', $codigo)->value('id_pieza_dental');
                if (! $idCatalogo) {
                    continue;
                }
                if (! isset($piezas[$codigo])) {
                    $piezas[$codigo] = DB::table('odontograma_pieza')->insertGetId([
                        'id_odontograma' => $idOdontograma,
                        'id_pieza_dental' => $idCatalogo,
                        'perdida' => 0,
                    ]);
                }
                DB::table('odontograma_hallazgo_pieza')->insert([
                    'id_odontograma_hallazgo' => $idMarca,
                    'id_odontograma_pieza' => $piezas[$codigo],
                    'orden' => $orden,
                ]);
                $orden++;
            }
        }
    }

    private function fecha(mixed $valor): string
    {
        $texto = (string) ($valor ?? '');

        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $texto) ? $texto : now()->toDateString();
    }
}
