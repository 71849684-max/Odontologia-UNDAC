<?php

namespace App\Clinica\Expediente;

use App\Clinica\Archivos\ServicioArchivoClinico;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use ZipArchive;

class ServicioExportacionClinica
{
    public function __construct(
        private readonly ServicioExpediente $expedientes,
        private readonly ServicioArchivoClinico $archivos,
    ) {}

    /** Copia de conservación: expediente, versiones y adjuntos, incluidos los reemplazados. */
    public function preparar(int $historia): string
    {
        if (! class_exists(ZipArchive::class)) {
            throw new OperacionNoPermitida('exportacion', 'El servidor requiere la extensión ZIP para exportar el expediente completo.');
        }
        $carpeta = storage_path('app/private/exportaciones');
        File::ensureDirectoryExists($carpeta, 0700);
        $ruta = $carpeta.'/'.Str::random(40).'.zip';
        $temporal = tempnam($carpeta, 'versiones-');
        $salida = fopen($temporal, 'wb');
        $zip = new ZipArchive;
        if ($zip->open($ruta, ZipArchive::CREATE) !== true) {
            fclose($salida);
            unlink($temporal);
            throw new OperacionNoPermitida('exportacion', 'No se pudo preparar la copia del expediente.');
        }
        try {
            DB::transaction(function () use ($historia, $zip, $salida, $temporal) {
                DB::table('historia_clinica')->where('id_historia_clinica', $historia)->lockForUpdate()->first();
                $zip->addFromString('expediente.json', json_encode($this->expedientes->obtener($historia), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
                $anteriores = str_repeat('0', 64);
                foreach (DB::table('historia_documento_version')->where('id_historia_clinica', $historia)->orderBy('id_version')->cursor() as $version) {
                    if (! hash_equals($version->hash_anterior, $anteriores) || ! hash_equals($version->hash_integridad, ServicioVersionesClinicas::huella((array) $version))) {
                        throw new OperacionNoPermitida('exportacion', 'La cadena de versiones no supera la verificación de integridad.');
                    }
                    $linea = json_encode($version, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE)."\n";
                    if (fwrite($salida, $linea) !== strlen($linea)) {
                        throw new OperacionNoPermitida('exportacion', 'No hay espacio suficiente para conservar todas las versiones de la copia.');
                    }
                    $anteriores = $version->hash_integridad;
                }
                fflush($salida);
                if (! $zip->addFile($temporal, 'versiones.jsonl')) {
                    throw new OperacionNoPermitida('exportacion', 'No se pudo incluir el historial completo.');
                }
                $metadatos = [];
                foreach (DB::table('archivo_clinico')->where('id_historia_clinica', $historia)->orderBy('id_archivo')->get() as $fila) {
                    $archivo = $this->archivos->descarga($historia, (int) $fila->id_archivo, true);
                    $nombre = 'adjuntos/'.$fila->id_archivo.'.'.preg_replace('/[^a-z0-9]/i', '', $fila->extension);
                    if (! $zip->addFile($archivo['ruta'], $nombre)) {
                        throw new OperacionNoPermitida('exportacion', 'No se pudo incluir uno de los archivos conservados.');
                    }
                    $metadatos[] = ['archivo' => $nombre, 'nombreOriginal' => $fila->nombre_original, 'campo' => $fila->clave_campo, 'sha256' => $fila->hash_sha256, 'vigente' => (bool) $fila->estado];
                }
                $zip->addFromString('adjuntos.json', json_encode($metadatos, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
                $consentimientos = DB::table('consentimiento_informado')->where('id_historia_clinica', $historia)->orderBy('version_documento')->get();
                $ids = $consentimientos->pluck('id_consentimiento')->all();
                $clausulas = DB::table('consentimiento_clausula')->whereIn('id_consentimiento', $ids)->get()->groupBy('id_consentimiento');
                $firmas = DB::table('firma_consentimiento')->whereIn('id_consentimiento', $ids)->get()->groupBy('id_consentimiento');
                $documentos = $consentimientos->map(fn ($fila) => (array) $fila + [
                    'clausulas' => ($clausulas[$fila->id_consentimiento] ?? collect())->all(),
                    'firmas' => ($firmas[$fila->id_consentimiento] ?? collect())->all(),
                ])->all();
                $zip->addFromString('consentimientos.json', json_encode($documentos, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
                $decisiones = DB::table('auditoria')->where('id_registro', $historia)->where('tabla_afectada', 'historia_clinica')
                    ->whereIn('accion', ['CONSENTIMIENTO_OTORGADO', 'CONSENTIMIENTO_NEGADO', 'CONSENTIMIENTO_REVOCADO'])->orderBy('id_auditoria')
                    ->get(['accion', 'nombre_usuario', 'creado_en', 'valores_nuevos'])->map(fn ($fila) => [
                        'accion' => $fila->accion, 'profesional' => $fila->nombre_usuario, 'fecha' => $fila->creado_en,
                        'datos' => json_decode($fila->valores_nuevos ?? '{}', true, 64, JSON_THROW_ON_ERROR),
                    ])->all();
                $zip->addFromString('decisiones-consentimiento.json', json_encode($decisiones, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
                $zip->addFromString('integridad.json', json_encode(['ultimaHuella' => $anteriores, 'exportadoEn' => now()->toISOString(), 'firmaDigital' => false], JSON_THROW_ON_ERROR));
            });
            if (! $zip->close()) {
                throw new OperacionNoPermitida('exportacion', 'No se pudo finalizar la copia del expediente.');
            }
        } catch (\Throwable $fallo) {
            try {
                $zip->close();
            } catch (\Throwable) { /* Puede estar cerrado. */
            }
            if (is_file($ruta)) {
                unlink($ruta);
            }
            throw $fallo;
        } finally {
            fclose($salida);
            if (is_file($temporal)) {
                unlink($temporal);
            }
        }

        return $ruta;
    }
}
