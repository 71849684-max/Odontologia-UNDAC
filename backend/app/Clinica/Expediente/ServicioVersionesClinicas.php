<?php

namespace App\Clinica\Expediente;

use App\Clinica\Historias\AccesoHistorias;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Support\Facades\DB;

/** Conserva evidencia histórica; el hash encadenado no constituye firma digital. */
class ServicioVersionesClinicas
{
    public function __construct(private readonly AccesoHistorias $acceso) {}

    public function conservarAprobacion(int $historia, string $seccion, array $contenido, Cuenta $actor, ?string $motivo = null): int
    {
        return DB::transaction(function () use ($historia, $seccion, $contenido, $actor, $motivo) {
            DB::table('historia_clinica')->where('id_historia_clinica', $historia)->lockForUpdate()->first();
            if (! $this->acceso->puedeAprobar($actor) || ! $this->acceso->puedeVer($actor, $historia)) {
                throw new OperacionNoPermitida('profesional', 'Solo un profesional con COP y acceso vigente puede conservar una aprobación.');
            }
            if ((! array_key_exists($seccion, $contenido['formData'] ?? []) && $seccion !== 'odontograma') || ($contenido['sectionStatus'][$seccion] ?? null) !== 'approved') {
                throw new OperacionNoPermitida('seccion', 'Seleccione una sección clínica aprobada para conservar su versión.');
            }
            $documento = ['seccionAprobada' => $seccion, 'formData' => [$seccion => $contenido['formData'][$seccion] ?? []], 'sectionStatus' => [$seccion => 'approved']];
            $anterior = DB::table('historia_documento_version')->where('id_historia_clinica', $historia)->orderByDesc('id_version')->value('hash_integridad') ?? str_repeat('0', 64);
            $fila = [
                'id_historia_clinica' => $historia, 'clase' => 'EXPEDIENTE', 'evento' => 'APROBAR_SECCION',
                'tipo_usuario' => $actor->tipoCuenta(), 'id_usuario' => $actor->id(),
                'nombre_usuario' => mb_substr($actor->nombreCompleto(), 0, 190),
                'contenido' => json_encode($documento, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
                'motivo' => $motivo, 'hash_anterior' => $anterior,
                'creado_en' => now()->format('Y-m-d H:i:s.u'),
            ];
            $fila['hash_integridad'] = self::huella($fila);

            return (int) DB::table('historia_documento_version')->insertGetId($fila);
        });
    }

    public static function huella(array $fila): string
    {
        return hash('sha256', json_encode(array_map(fn ($clave) => (string) ($fila[$clave] ?? ''), [
            'id_historia_clinica', 'clase', 'evento', 'tipo_usuario', 'id_usuario', 'nombre_usuario',
            'contenido', 'motivo', 'hash_anterior', 'creado_en',
        ]), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE));
    }

    public function listar(int $historia): array
    {
        // Reconoce también aprobaciones antiguas sin modificar filas ni sus hashes.
        // Lee únicamente metadatos y estados, evitando cargar expedientes completos.
        $filas = DB::table('historia_documento_version')->where('id_historia_clinica', $historia)->where('clase', 'EXPEDIENTE')
            ->orderBy('id_version')->select(['id_version', 'clase', 'evento', 'tipo_usuario', 'nombre_usuario', 'motivo', 'hash_integridad', 'creado_en'])
            ->selectRaw("JSON_EXTRACT(contenido, '$.sectionStatus') as estados, JSON_UNQUOTE(JSON_EXTRACT(contenido, '$.seccionAprobada')) as seccion")
            ->cursor();
        $anteriores = [];
        $aprobaciones = [];
        foreach ($filas as $fila) {
            $estados = json_decode($fila->estados ?? '{}', true, 64, JSON_THROW_ON_ERROR) ?? [];
            $secciones = $fila->evento === 'APROBAR_SECCION' && $fila->seccion
                ? [$fila->seccion]
                : ($fila->evento === 'GUARDAR' && $fila->tipo_usuario === 'DOCENTE'
                    ? array_keys(array_filter($estados, fn ($estado, $codigo) => $estado === 'approved' && ($anteriores[$codigo] ?? null) !== 'approved', ARRAY_FILTER_USE_BOTH)) : []);
            $anteriores = array_replace($anteriores, $estados);
            if ($secciones === []) {
                continue;
            }
            $datos = (array) $fila;
            unset($datos['estados'], $datos['tipo_usuario']);
            $datos['evento'] = 'APROBAR_SECCION';
            $datos['secciones'] = $secciones;
            $aprobaciones[] = $datos;
            if (count($aprobaciones) > 200) {
                array_shift($aprobaciones);
            }
        }

        return array_reverse($aprobaciones);
    }

    public function obtener(int $historia, int $version): array
    {
        $fila = DB::table('historia_documento_version')->where('id_historia_clinica', $historia)->where('id_version', $version)->first();
        abort_if($fila === null, 404);
        $datos = (array) $fila;
        $datos['integridadVerificada'] = hash_equals($fila->hash_integridad, self::huella($datos));
        $datos['contenido'] = json_decode($fila->contenido, true, 64, JSON_THROW_ON_ERROR);
        $archivos = [];
        $recorrer = function (mixed $valor) use (&$recorrer, &$archivos, $historia, $version): void {
            if (! is_array($valor)) {
                return;
            }
            if (isset($valor['archivoId'])) {
                $id = (int) $valor['archivoId'];
                $archivos[$id] = ['archivoId' => $id, 'nombre' => $valor['nombre'] ?? 'Archivo conservado', 'url' => "/api/historias/{$historia}/archivos/{$id}?version={$version}"];
            }
            foreach ($valor as $parte) {
                $recorrer($parte);
            }
        };
        $recorrer($datos['contenido']);
        $datos['archivosConservados'] = array_values($archivos);

        return $datos;
    }

    public function contieneArchivo(int $historia, int $version, int $archivo): bool
    {
        $datos = $this->obtener($historia, $version);
        if (! $datos['integridadVerificada']) {
            return false;
        }
        $buscar = function (mixed $valor) use (&$buscar, $archivo): bool {
            if (! is_array($valor)) {
                return false;
            }
            if (($valor['archivoId'] ?? null) === $archivo) {
                return true;
            }
            foreach ($valor as $parte) {
                if ($buscar($parte)) {
                    return true;
                }
            }

            return false;
        };

        return $buscar($datos['contenido']);
    }
}
