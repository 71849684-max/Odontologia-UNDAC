<?php

namespace App\Clinica\Http\Controladores;

use App\Clinica\Archivos\ServicioArchivoClinico;
use App\Clinica\Http\RespondeOperacion;
use App\Http\Controllers\Controller;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Http\ContextoDesdePeticion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\HeaderUtils;

class ControladorArchivos extends Controller
{
    use RespondeOperacion;

    public function __construct(
        private readonly ServicioArchivoClinico $archivos,
        private readonly RegistradorAuditoria $auditoria,
    ) {}

    public function subir(Request $solicitud, int $idHistoria): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'archivo' => ['required', 'file', 'max:'.intdiv($this->archivos->limiteBytes(), 1024)],
            'campo' => ['required', 'string', Rule::in(array_keys(ServicioArchivoClinico::CAMPOS))],
        ]);

        $adjunto = $this->operacion(fn () => $this->archivos->subir($idHistoria, $datos['archivo'], $datos['campo'], $actor));
        $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'archivo_clinico', $adjunto['archivoId'], 'SUBIR_ARCHIVO', null, [
            'historia' => $idHistoria,
            'campo' => $datos['campo'],
            'nombre' => $adjunto['nombre'],
            'tamano' => $adjunto['tamano'],
        ]);

        return response()->json($adjunto, 201);
    }

    public function mostrar(int $idHistoria, int $idArchivo): BinaryFileResponse
    {
        $archivo = $this->archivos->descarga($idHistoria, $idArchivo);
        $disposicion = HeaderUtils::makeDisposition(
            $archivo['imagen'] ? HeaderUtils::DISPOSITION_INLINE : HeaderUtils::DISPOSITION_ATTACHMENT,
            $archivo['nombre'],
            'archivo',
        );

        return response()->file($archivo['ruta'], [
            'Content-Type' => $archivo['mime'],
            'Content-Disposition' => $disposicion,
            'X-Content-Type-Options' => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
            'Cache-Control' => 'private, max-age=300',
        ]);
    }

    public function eliminar(Request $solicitud, int $idHistoria, int $idArchivo): Response
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $this->operacion(fn () => $this->archivos->eliminar($idHistoria, $idArchivo, $actor));
        $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'archivo_clinico', $idArchivo, 'ELIMINAR_ARCHIVO', [
            'historia' => $idHistoria,
        ]);

        return response()->noContent();
    }
}
