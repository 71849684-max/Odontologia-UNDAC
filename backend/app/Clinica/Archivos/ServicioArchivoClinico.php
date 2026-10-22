<?php

namespace App\Clinica\Archivos;

use App\Clinica\Historias\AccesoHistorias;
use App\Clinica\Historias\ServicioHistorias;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ServicioArchivoClinico
{
    private const DISCO = 'local';

    private const IMAGENES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    private const DOCUMENTOS = self::IMAGENES + [
        'application/pdf' => 'pdf',
        'application/msword' => 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
        'application/vnd.ms-excel' => 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
        'application/vnd.ms-powerpoint' => 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
        'text/plain' => 'txt',
        'text/csv' => 'csv',
    ];

    /**
     * Campo del frontend => [sección, tipo, máximo de archivos activos].
     * Los campos con máximo 1 reemplazan el archivo anterior.
     */
    public const CAMPOS = [
        'fotosExtraorales' => ['examen-extraoral', 'imagen', 5],
        'fotosIntraorales' => ['examen-intraoral', 'imagen', 6],
        'fotosModelos' => ['modelos', 'imagen', 4],
        'radiografias' => ['examenes-auxiliares', 'imagen', 4],
        'resultadosLaboratorio' => ['examenes-auxiliares', 'documento', 10],
        'firmaPaciente' => ['consentimiento', 'imagen', 1],
        'huellaDactilar' => ['consentimiento', 'imagen', 1],
        'firmaAcompanante' => ['consentimiento', 'imagen', 1],
        'firmaDocente' => ['consentimiento', 'imagen', 1],
        'firmaDocenteReporte' => ['reporte-operatorio', 'imagen', 1],
        'firmaAlumnoReporte' => ['reporte-operatorio', 'imagen', 1],
    ];

    public function __construct(
        private readonly ServicioHistorias $historias,
        private readonly AccesoHistorias $acceso,
    ) {}

    public function subir(int $idHistoria, UploadedFile $archivo, string $campo, Cuenta $actor): array
    {
        $this->historia($idHistoria);
        [$seccion, $tipo, $maximo] = self::CAMPOS[$campo] ?? throw new OperacionNoPermitida('campo', 'El campo de archivo no existe.');
        $this->exigirEditable($actor, $idHistoria, $seccion);

        if (! $archivo->isValid()) {
            throw new OperacionNoPermitida('archivo', 'El archivo no se recibió completo.');
        }
        $limite = $this->limiteBytes();
        if ($archivo->getSize() > $limite) {
            throw new OperacionNoPermitida('archivo', 'El archivo supera el tamaño máximo de '.intdiv($limite, 1024).' KB.');
        }
        $mime = (string) $archivo->getMimeType();
        $permitidos = $tipo === 'imagen' ? self::IMAGENES : self::DOCUMENTOS;
        if (! isset($permitidos[$mime])) {
            throw new OperacionNoPermitida('archivo', $tipo === 'imagen'
                ? 'Solo se admiten imágenes JPG, PNG o WEBP.'
                : 'Formato no admitido. Use PDF, Word, Excel, PowerPoint, texto o imagen.');
        }
        if ($tipo === 'imagen' && @getimagesize($archivo->getRealPath()) === false) {
            throw new OperacionNoPermitida('archivo', 'La imagen está dañada o no es válida.');
        }

        $activos = $this->activos($idHistoria, $campo);
        if ($maximo > 1 && $activos->count() >= $maximo) {
            throw new OperacionNoPermitida('archivo', "Este bloque admite hasta {$maximo} archivos.");
        }

        $extension = $permitidos[$mime];
        $nombreGuardado = Str::random(40).'.'.$extension;
        $carpeta = "clinica/{$idHistoria}";
        $ruta = $archivo->storeAs($carpeta, $nombreGuardado, self::DISCO);
        if ($ruta === false) {
            throw new OperacionNoPermitida('archivo', 'No fue posible guardar el archivo.');
        }

        $id = DB::transaction(function () use ($idHistoria, $archivo, $campo, $seccion, $maximo, $activos, $nombreGuardado, $ruta, $extension, $mime, $actor) {
            if ($maximo === 1 && $activos->isNotEmpty()) {
                DB::table('archivo_clinico')->whereIn('id_archivo', $activos->pluck('id_archivo'))->update(['estado' => 0]);
            }

            return (int) DB::table('archivo_clinico')->insertGetId([
                'id_historia_clinica' => $idHistoria,
                'categoria' => self::CAMPOS[$campo][1] === 'imagen' ? 'IMAGEN' : 'DOCUMENTO',
                'seccion' => $seccion,
                'clave_campo' => $campo,
                'nombre_original' => mb_substr($this->nombreSeguro($archivo->getClientOriginalName(), $extension), 0, 255),
                'nombre_guardado' => $nombreGuardado,
                'ruta' => $ruta,
                'extension' => $extension,
                'mime_type' => $mime,
                'tamano_bytes' => $archivo->getSize(),
                'hash_sha256' => hash_file('sha256', $archivo->getRealPath()),
                'tipo_usuario' => $actor->tipoCuenta(),
                'id_usuario' => $actor->id(),
                'estado' => 1,
                'creado_en' => now(),
            ]);
        });

        return $this->serializar(DB::table('archivo_clinico')->where('id_archivo', $id)->first());
    }

    /**
     * @return array{ruta: string, mime: string, nombre: string, imagen: bool}
     */
    public function descarga(int $idHistoria, int $idArchivo): array
    {
        $fila = DB::table('archivo_clinico')
            ->where('id_archivo', $idArchivo)
            ->where('id_historia_clinica', $idHistoria)
            ->where('estado', 1)
            ->first();
        if ($fila === null || ! Storage::disk(self::DISCO)->exists($fila->ruta)) {
            throw (new ModelNotFoundException)->setModel('archivo_clinico', [$idArchivo]);
        }

        return [
            'ruta' => Storage::disk(self::DISCO)->path($fila->ruta),
            'mime' => (string) $fila->mime_type,
            'nombre' => (string) $fila->nombre_original,
            'imagen' => isset(self::IMAGENES[$fila->mime_type]),
        ];
    }

    public function eliminar(int $idHistoria, int $idArchivo, Cuenta $actor): void
    {
        $consulta = DB::table('archivo_clinico')
            ->where('id_archivo', $idArchivo)
            ->where('id_historia_clinica', $idHistoria)
            ->where('estado', 1);
        $seccion = $consulta->clone()->value('seccion');
        if ($seccion === null) {
            throw (new ModelNotFoundException)->setModel('archivo_clinico', [$idArchivo]);
        }
        $this->exigirEditable($actor, $idHistoria, (string) $seccion);
        $consulta->update(['estado' => 0]);
    }

    private function exigirEditable(Cuenta $actor, int $idHistoria, string $seccion): void
    {
        if (! $this->acceso->seccionEditable($actor, $idHistoria, $seccion)) {
            throw new OperacionNoPermitida('archivo', 'La sección ya fue aprobada por el cirujano dentista supervisor y no admite cambios.');
        }
    }

    /**
     * Archivos activos agrupados como los espera el frontend: sección => campo => lista u objeto.
     *
     * @return array<string, array<string, mixed>>
     */
    public function porSeccion(int $idHistoria): array
    {
        $resultado = [];
        $filas = DB::table('archivo_clinico')
            ->where('id_historia_clinica', $idHistoria)
            ->where('estado', 1)
            ->whereIn('clave_campo', array_keys(self::CAMPOS))
            ->orderBy('id_archivo')
            ->get();
        foreach ($filas as $fila) {
            [$seccion, , $maximo] = self::CAMPOS[$fila->clave_campo];
            $adjunto = $this->serializar($fila);
            if ($maximo === 1) {
                $resultado[$seccion][$fila->clave_campo] = $adjunto;
            } else {
                $resultado[$seccion][$fila->clave_campo][] = $adjunto;
            }
        }

        return $resultado;
    }

    public function vigente(int $idHistoria, string $campo): ?int
    {
        $id = $this->activos($idHistoria, $campo)->last()?->id_archivo;

        return $id === null ? null : (int) $id;
    }

    public function limiteBytes(): int
    {
        $configurado = (int) DB::table('configuracion_sistema')
            ->where('clave', 'TAMANO_MAXIMO_ARCHIVO_KB')
            ->where('estado', 1)
            ->value('valor');
        $configurado = $configurado > 0 ? $configurado * 1024 : 10 * 1024 * 1024;

        return min($configurado, UploadedFile::getMaxFilesize());
    }

    private function activos(int $idHistoria, string $campo)
    {
        return DB::table('archivo_clinico')
            ->where('id_historia_clinica', $idHistoria)
            ->where('clave_campo', $campo)
            ->where('estado', 1)
            ->orderBy('id_archivo')
            ->get(['id_archivo']);
    }

    private function serializar(object $fila): array
    {
        $url = "/api/historias/{$fila->id_historia_clinica}/archivos/{$fila->id_archivo}";
        $adjunto = [
            'id' => 'srv-'.$fila->id_archivo,
            'archivoId' => (int) $fila->id_archivo,
            'nombre' => $fila->nombre_original,
            'tamano' => (int) $fila->tamano_bytes,
            'tipo' => $fila->mime_type,
            'url' => $url,
        ];
        if (isset(self::IMAGENES[$fila->mime_type])) {
            $adjunto['vistaPrevia'] = $url;
        }

        return $adjunto;
    }

    private function nombreSeguro(string $original, string $extension): string
    {
        $base = pathinfo($original, PATHINFO_FILENAME);
        $base = preg_replace('/[^\pL\pN ._-]+/u', '', $base) ?? '';
        $base = trim($base, " .\t\n\r\0\x0B") ?: 'archivo';

        return $base.'.'.$extension;
    }

    private function historia(int $idHistoria): void
    {
        $this->historias->fila($idHistoria);
    }
}
