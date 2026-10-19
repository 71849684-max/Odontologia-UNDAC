<?php

namespace App\Clinica\Odontograma;

use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Support\Facades\DB;

class ServicioOdontograma
{
    private const TAMANO_MAXIMO = 2 * 1024 * 1024;

    /** Estados del frontend cuyo código de catálogo no se obtiene en mayúsculas directas. */
    private const CODIGOS_CATALOGO = [
        'ectopico' => 'ECTOPICA',
        'extruido' => 'EXTRUIDA',
        'intruido' => 'INTRUIDA',
        'supernumerario' => 'SUPERNUMERARIA',
        'posicion' => 'POSICION_ANORMAL',
    ];

    public function leer(int $idHistoria): ?array
    {
        $filas = DB::table('odontograma')
            ->where('id_historia_clinica', $idHistoria)
            ->orderBy('id_odontograma')
            ->get(['registro_json', 'especificaciones']);

        foreach ($filas as $fila) {
            foreach ([$fila->registro_json, $fila->especificaciones] as $contenido) {
                $registro = json_decode((string) $contenido, true);
                if (is_array($registro) && ($registro['version'] ?? null) === 1) {
                    return $this->normalizarRegistro($registro);
                }
            }
        }

        return null;
    }

    public function guardar(int $idHistoria, array $registro, Cuenta $actor): array
    {
        $registro = $this->normalizarRegistro($registro);

        if (($registro['version'] ?? null) !== 1 || ! is_array($registro['examinations'] ?? null) || $registro['examinations'] === []) {
            throw new OperacionNoPermitida('odontograma', 'El registro del odontograma no tiene el formato esperado.');
        }

        $json = json_encode($registro, JSON_UNESCAPED_UNICODE);
        if ($json === false || strlen($json) > self::TAMANO_MAXIMO) {
            throw new OperacionNoPermitida('odontograma', 'El odontograma supera el tamaño que se puede conservar en la historia.');
        }

        $this->verificarEvaluacionesCerradas($idHistoria, $registro);
        $denticionDefecto = $this->denticionPorDefecto();

        DB::transaction(function () use ($idHistoria, $registro, $json, $actor, $denticionDefecto) {
            $this->eliminar($idHistoria);
            $catalogo = $this->catalogo();
            $piezasCatalogo = DB::table('pieza_dental')->pluck('id_pieza_dental', 'codigo_fdi')->all();
            $primero = true;
            foreach ($registro['examinations'] as $examen) {
                if (! is_array($examen)) {
                    continue;
                }
                $cerrado = ($examen['status'] ?? '') === 'closed';
                $idOdontograma = DB::table('odontograma')->insertGetId([
                    'id_historia_clinica' => $idHistoria,
                    'id_docente_responsable' => $actor->tipoCuenta() === 'DOCENTE' ? $actor->idActor() : null,
                    'tipo_denticion' => $this->denticion($examen, $denticionDefecto),
                    'fecha_evaluacion' => $this->fecha($examen['date'] ?? null),
                    'motivo_evaluacion' => $this->texto($examen['reason'] ?? null, 80),
                    'numero_cop' => $this->texto($examen['cop'] ?? null, 8),
                    'especificaciones' => $this->texto($examen['specifications'] ?? null, 65000),
                    'registro_json' => $primero ? $json : null,
                    'observaciones' => $this->texto($examen['observations'] ?? null, 65000),
                    'estado' => $cerrado ? 'CERRADO' : 'BORRADOR',
                    'cerrado_en' => $cerrado ? $this->fechaHora($examen['closedAt'] ?? null) : null,
                    'creado_en' => now(),
                ]);
                $primero = false;
                $this->normalizarHallazgos($idOdontograma, $examen, $catalogo, $piezasCatalogo);
            }
        });

        return $registro;
    }

    /** Una evaluación cerrada no puede cambiar ni desaparecer del registro. */
    private function verificarEvaluacionesCerradas(int $idHistoria, array $registro): void
    {
        $anterior = $this->leer($idHistoria);
        if ($anterior === null) {
            return;
        }
        $entrantes = [];
        foreach ($registro['examinations'] as $examen) {
            if (is_array($examen) && isset($examen['id'])) {
                $entrantes[(string) $examen['id']] = $examen;
            }
        }
        foreach ((array) ($anterior['examinations'] ?? []) as $examen) {
            if (! is_array($examen) || ($examen['status'] ?? '') !== 'closed') {
                continue;
            }
            $nuevo = $entrantes[(string) ($examen['id'] ?? '')] ?? null;
            if ($nuevo === null || json_encode($nuevo) !== json_encode($examen)) {
                throw new OperacionNoPermitida('odontograma', 'Una evaluación cerrada no se puede modificar ni eliminar. Cree una nueva evaluación.');
            }
        }
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

    /**
     * @param  array<string, int>  $catalogo  código de catálogo => id
     * @param  array<string, int>  $piezasCatalogo  código FDI => id
     */
    private function normalizarHallazgos(int $idOdontograma, array $examen, array $catalogo, array $piezasCatalogo): void
    {
        $piezas = [];
        $marcas = [];
        foreach ((array) ($examen['teeth'] ?? []) as $codigo => $diente) {
            if (! is_array($diente)) {
                continue;
            }
            foreach ((array) ($diente['findings'] ?? []) as $marca) {
                $marcas[] = ['dientes' => [(string) $codigo], 'superficie' => null, 'marca' => $marca];
            }
            foreach ((array) ($diente['surfaces'] ?? []) as $superficie => $detalle) {
                foreach ((array) ($detalle['findings'] ?? []) as $marca) {
                    $marcas[] = ['dientes' => [(string) $codigo], 'superficie' => (string) $superficie, 'marca' => $marca];
                }
            }
        }
        foreach ((array) ($examen['ranges'] ?? []) as $marca) {
            if (is_array($marca)) {
                $marcas[] = ['dientes' => array_map('strval', (array) ($marca['teeth'] ?? [])), 'superficie' => $marca['surface'] ?? null, 'marca' => $marca];
            }
        }

        $pieza = function (string $codigo) use (&$piezas, $piezasCatalogo, $idOdontograma): ?int {
            if (! isset($piezasCatalogo[$codigo])) {
                return null;
            }

            return $piezas[$codigo] ??= (int) DB::table('odontograma_pieza')->insertGetId([
                'id_odontograma' => $idOdontograma,
                'id_pieza_dental' => $piezasCatalogo[$codigo],
                'perdida' => 0,
            ]);
        };

        foreach ($marcas as $item) {
            $marca = $item['marca'];
            if (! is_array($marca) || $item['dientes'] === []) {
                continue;
            }
            $idHallazgo = $catalogo[$this->codigoCatalogo((string) ($marca['state'] ?? ''))] ?? null;
            $idPrincipal = $pieza($item['dientes'][0]);
            if (! $idHallazgo || ! $idPrincipal) {
                continue;
            }
            if (($marca['state'] ?? '') === 'ausente') {
                DB::table('odontograma_pieza')->where('id_odontograma_pieza', $idPrincipal)->update(['perdida' => 1]);
            }
            $idSuperficie = null;
            if (! empty($item['superficie'])) {
                $superficie = mb_substr((string) $item['superficie'], 0, 30);
                $idSuperficie = DB::table('odontograma_superficie')->where('id_odontograma_pieza', $idPrincipal)->where('superficie', $superficie)->value('id_odontograma_superficie')
                    ?? DB::table('odontograma_superficie')->insertGetId(['id_odontograma_pieza' => $idPrincipal, 'superficie' => $superficie]);
            }
            $puntos = is_array($marca['points'] ?? null) && $marca['points'] !== [] ? json_encode($marca['points']) : null;
            $idMarca = DB::table('odontograma_hallazgo')->insertGetId([
                'id_odontograma' => $idOdontograma,
                'id_hallazgo_dental' => $idHallazgo,
                'id_odontograma_superficie' => $idSuperficie,
                'clasificacion' => $this->texto($marca['code'] ?? null, 20),
                'condicion' => ($marca['condition'] ?? '') === 'bad' ? 'MALO' : 'BUENO',
                'representacion' => ($marca['representation'] ?? '') === 'traced' ? 'TRAZADO' : 'ESQUEMATICA',
                'trazo' => $puntos,
                'descripcion' => $this->texto($marca['note'] ?? null, 65000),
                'activo' => 1,
                'creado_en' => now(),
            ]);
            foreach (array_values($item['dientes']) as $orden => $codigo) {
                $idPieza = $pieza($codigo);
                if ($idPieza) {
                    DB::table('odontograma_hallazgo_pieza')->insert([
                        'id_odontograma_hallazgo' => $idMarca,
                        'id_odontograma_pieza' => $idPieza,
                        'orden' => $orden,
                    ]);
                }
            }
        }
    }

    /**
     * El autoguardado de la historia pasa por un middleware que convierte '' en null.
     * El odontograma necesita esas cadenas vacías para volver a abrirse.
     *
     * @param  array<string, mixed>  $registro
     * @return array<string, mixed>
     */
    private function normalizarRegistro(array $registro): array
    {
        if (! is_array($registro['examinations'] ?? null)) {
            return $registro;
        }

        foreach ($registro['examinations'] as $indice => $examen) {
            if (! is_array($examen)) {
                continue;
            }
            foreach (['date', 'professional', 'cop', 'specifications', 'observations'] as $campo) {
                if (! is_string($examen[$campo] ?? null)) {
                    $examen[$campo] = '';
                }
            }
            $examen['ranges'] = array_map(fn ($marca) => $this->normalizarMarca($marca), (array) ($examen['ranges'] ?? []));
            foreach ((array) ($examen['teeth'] ?? []) as $codigo => $diente) {
                if (! is_array($diente)) {
                    continue;
                }
                if (! is_string($diente['generalNote'] ?? null)) {
                    $diente['generalNote'] = '';
                }
                $diente['findings'] = array_map(fn ($marca) => $this->normalizarMarca($marca), (array) ($diente['findings'] ?? []));
                foreach ((array) ($diente['surfaces'] ?? []) as $cara => $superficie) {
                    if (! is_array($superficie)) {
                        continue;
                    }
                    if (! is_string($superficie['note'] ?? null)) {
                        $superficie['note'] = '';
                    }
                    $superficie['findings'] = array_map(fn ($marca) => $this->normalizarMarca($marca), (array) ($superficie['findings'] ?? []));
                    $diente['surfaces'][$cara] = $superficie;
                }
                $examen['teeth'][$codigo] = $diente;
            }
            $registro['examinations'][$indice] = $examen;
        }

        return $registro;
    }

    private function normalizarMarca(mixed $marca): mixed
    {
        if (! is_array($marca)) {
            return $marca;
        }
        foreach (['note', 'code'] as $campo) {
            if (! is_string($marca[$campo] ?? null)) {
                $marca[$campo] = '';
            }
        }

        return $marca;
    }

    public function codigoCatalogo(string $estado): string
    {
        return self::CODIGOS_CATALOGO[$estado] ?? strtoupper(str_replace('-', '_', $estado));
    }

    /** @return array<string, int> */
    private function catalogo(): array
    {
        return DB::table('catalogo_hallazgo_dental')->where('estado', 1)->pluck('id_hallazgo_dental', 'codigo')->map(fn ($id) => (int) $id)->all();
    }

    private function denticion(array $examen, string $defecto): string
    {
        $temporal = false;
        $permanente = false;
        foreach ((array) ($examen['teeth'] ?? []) as $codigo => $diente) {
            if (! is_array($diente)) {
                continue;
            }
            $conHallazgos = ! empty($diente['findings']) || array_filter((array) ($diente['surfaces'] ?? []), fn ($s) => ! empty($s['findings'] ?? [])) !== [];
            if ($conHallazgos) {
                (int) substr((string) $codigo, 0, 1) >= 5 ? $temporal = true : $permanente = true;
            }
        }
        foreach ((array) ($examen['ranges'] ?? []) as $marca) {
            foreach ((array) ($marca['teeth'] ?? []) as $codigo) {
                (int) substr((string) $codigo, 0, 1) >= 5 ? $temporal = true : $permanente = true;
            }
        }

        return match (true) {
            $temporal && $permanente => 'MIXTA',
            $temporal => 'TEMPORAL',
            $permanente => 'PERMANENTE',
            default => $defecto,
        };
    }

    private function denticionPorDefecto(): string
    {
        $valor = strtoupper((string) DB::table('configuracion_sistema')->where('clave', 'TIPO_DENTICION_POR_DEFECTO')->where('estado', 1)->value('valor'));

        return in_array($valor, ['PERMANENTE', 'TEMPORAL', 'MIXTA'], true) ? $valor : 'PERMANENTE';
    }

    private function texto(mixed $valor, int $longitud): ?string
    {
        $texto = is_scalar($valor) ? trim((string) $valor) : '';

        return $texto === '' ? null : mb_substr($texto, 0, $longitud);
    }

    private function fecha(mixed $valor): string
    {
        $texto = (string) ($valor ?? '');

        return preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $texto, $p) && checkdate((int) $p[2], (int) $p[3], (int) $p[1]) ? $texto : now()->toDateString();
    }

    private function fechaHora(mixed $valor): string
    {
        $marca = is_string($valor) ? strtotime($valor) : false;

        return $marca === false ? now()->toDateTimeString() : date('Y-m-d H:i:s', $marca);
    }
}
