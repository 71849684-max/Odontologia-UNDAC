<?php

namespace App\Clinica\Http\Controladores;

use App\Clinica\Expediente\ServicioExpediente;
use App\Clinica\Historias\AccesoHistorias;
use App\Clinica\Historias\ServicioEquipoClinico;
use App\Clinica\Historias\ServicioHistorias;
use App\Clinica\Http\RespondeOperacion;
use App\Clinica\Notificaciones\ServicioNotificaciones;
use App\Clinica\Odontograma\ServicioOdontograma;
use App\Http\Controllers\Controller;
use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use App\Identidad\Http\ContextoDesdePeticion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControladorHistorias extends Controller
{
    use RespondeOperacion;

    public function __construct(
        private readonly ServicioHistorias $historias,
        private readonly ServicioExpediente $expediente,
        private readonly ServicioOdontograma $odontograma,
        private readonly ServicioEquipoClinico $equipo,
        private readonly RegistradorAuditoria $auditoria,
        private readonly AccesoHistorias $acceso,
        private readonly ServicioNotificaciones $notificaciones,
        private readonly ConsultaAccesos $accesos,
    ) {}

    public function listar(Request $solicitud): JsonResponse
    {
        $filtros = $solicitud->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'estado' => ['nullable', 'string', 'max:40'],
        ]);

        return response()->json(['data' => $this->historias->listar($filtros['q'] ?? null, $filtros['estado'] ?? null, $solicitud->user())]);
    }

    public function personal(Request $solicitud): JsonResponse
    {
        $filtros = $solicitud->validate(['q' => ['nullable', 'string', 'max:120']]);

        return response()->json(['data' => $this->equipo->personal($filtros['q'] ?? null)]);
    }

    public function asignar(Request $solicitud, int $idHistoria): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate(['personal' => ['required', 'string', 'max:40']]);

        $historia = $this->operacion(fn () => $this->equipo->asignar($idHistoria, $datos['personal'], $actor));
        $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_clinica', $idHistoria, 'ASIGNAR_PERSONAL', null, [
            'personal' => $datos['personal'],
        ]);

        return response()->json($historia);
    }

    public function seguimientos(Request $solicitud): JsonResponse
    {
        $filtros = $solicitud->validate(['q' => ['nullable', 'string', 'max:120']]);

        return response()->json(['data' => $this->equipo->seguimientos($filtros['q'] ?? null, $solicitud->user())]);
    }

    public function crearSeguimiento(Request $solicitud, int $idHistoria): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'fecha' => ['required', 'date'],
            'hora' => ['nullable', 'string', 'max:8'],
            'detalle' => ['nullable', 'string', 'max:255'],
            'estado' => ['nullable', 'string', 'max:30'],
        ]);

        return response()->json($this->operacion(fn () => $this->equipo->crearControl($idHistoria, $datos, $actor)), 201);
    }

    public function actualizarSeguimiento(Request $solicitud, int $idSeguimiento): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'fecha' => ['nullable', 'date'],
            'hora' => ['nullable', 'string', 'max:8'],
            'detalle' => ['nullable', 'string', 'max:255'],
            'estado' => ['nullable', 'string', 'max:30'],
        ]);

        return response()->json($this->operacion(fn () => $this->equipo->actualizarControl($idSeguimiento, $datos, $actor)));
    }

    public function actualizarProgramacion(Request $solicitud, int $idProgramacion): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'fecha' => ['nullable', 'date'],
            'hora' => ['nullable', 'string', 'max:8'],
            'detalle' => ['nullable', 'string', 'max:2000'],
            'estado' => ['nullable', 'string', 'max:30'],
        ]);

        return response()->json($this->operacion(fn () => $this->equipo->actualizarProgramacion($idProgramacion, $datos, $actor)));
    }

    public function mostrar(int $idHistoria): JsonResponse
    {
        return response()->json($this->historias->mostrar($idHistoria));
    }

    public function crear(Request $solicitud): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'paciente_id' => ['nullable', 'integer'],
            'pacienteId' => ['nullable', 'integer'],
            'dni' => ['nullable', 'string', 'max:20'],
            'nombres' => ['nullable', 'string', 'max:180'],
            'apellidoPaterno' => ['nullable', 'string', 'max:120'],
            'apellidoMaterno' => ['nullable', 'string', 'max:120'],
            'numeroDocumento' => ['nullable', 'string', 'max:20'],
            'nacimiento' => ['nullable', 'date'],
            'fechaNacimiento' => ['nullable', 'date'],
            'sexo' => ['nullable', 'string', 'max:20'],
            'celular' => ['nullable', 'string', 'max:30'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'correo' => ['nullable', 'email', 'max:150'],
        ]);

        $historia = $this->operacion(fn () => $this->historias->abrir($datos, $actor));

        return response()->json($historia, 201);
    }

    public function cambiarEstado(Request $solicitud, int $idHistoria): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'codigo' => ['required', 'string', 'max:40'],
            'observacion' => ['nullable', 'string', 'max:500'],
        ]);

        $antes = $this->historias->mostrar($idHistoria)['codigoEstado'];
        $historia = $this->operacion(
            fn () => $this->historias->cambiarEstado($idHistoria, $datos['codigo'], $actor, $datos['observacion'] ?? null),
        );
        $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_clinica', $idHistoria, 'CAMBIAR_ESTADO',
            ['estado' => $antes],
            ['estado' => $datos['codigo'], 'observacion' => $datos['observacion'] ?? null],
        );

        return response()->json($historia);
    }

    public function inactivar(Request $solicitud, int $idHistoria): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();

        if (! $this->accesos->esAdministrador($actor)) {
            abort(403, 'Solo un administrador puede inactivar una historia clínica.');
        }

        $this->operacion(fn () => $this->historias->inactivar($idHistoria, $actor));
        $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_clinica', $idHistoria, 'INACTIVAR', ['estado' => 'activa'], ['estado' => 'inactiva']);

        return response()->json(['estado' => 'inactiva']);
    }

    public function expediente(int $idHistoria): JsonResponse
    {
        return response()->json($this->expediente->obtener($idHistoria));
    }

    public function guardarExpediente(Request $solicitud, int $idHistoria): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'formData' => ['required', 'array', 'max:40'],
            'sectionStatus' => ['nullable', 'array', 'max:40'],
        ]);

        $estadosPrevios = $this->expediente->estadosSeccion($idHistoria);
        $resultado = $this->operacion(
            fn () => $this->expediente->guardar($idHistoria, $datos['formData'], $datos['sectionStatus'] ?? [], $actor),
        );

        $actuales = $this->expediente->estadosSeccion($idHistoria);
        $enviadas = [];
        foreach ($datos['sectionStatus'] ?? [] as $codigo => $estado) {
            if ($estado !== 'review' || ! is_string($codigo)) {
                continue;
            }
            if (($estadosPrevios[$codigo] ?? null) === 'review') {
                continue;
            }
            $enviadas[$codigo] = 'review';
        }
        $aprobadas = array_filter(
            array_diff_assoc(array_intersect_key($actuales, $datos['sectionStatus'] ?? []), $estadosPrevios),
            fn ($estado) => $estado === 'approved',
        );
        $auditoriaEstados = $enviadas + $aprobadas;
        if ($auditoriaEstados !== []) {
            $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_seccion_estado', $idHistoria, 'REVISAR_SECCION',
                array_intersect_key($estadosPrevios, $auditoriaEstados),
                $auditoriaEstados,
            );
        }

        $notificaciones = 0;
        foreach (array_keys($enviadas) as $codigo) {
            $notificaciones += $this->notificaciones->notificarRevisionSeccion($idHistoria, $codigo, $actor);
        }

        return response()->json($resultado + [
            'revisionNotificada' => $notificaciones > 0,
            'notificacionesCreadas' => $notificaciones,
            'seccionesEnviadas' => array_keys($enviadas),
        ]);
    }

    public function odontograma(int $idHistoria): JsonResponse
    {
        return response()->json(['registro' => $this->odontograma->leer($idHistoria)]);
    }

    public function guardarOdontograma(Request $solicitud, int $idHistoria): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $solicitud->validate([
            'registro' => ['required', 'array'],
        ]);
        // El registro se conserva tal cual lo envía el navegador: los middlewares globales
        // recortan textos y convierten '' en null, y el frontend exige cadenas al releerlo.
        $original = json_decode($solicitud->getContent(), true, 64);
        $registro = is_array($original['registro'] ?? null) ? $original['registro'] : [];

        return response()->json([
            'registro' => $this->operacion(function () use ($idHistoria, $registro, $actor) {
                if (! $this->acceso->seccionEditable($actor, $idHistoria, 'odontograma')) {
                    throw new OperacionNoPermitida('registro', 'El odontograma ya fue aprobado por el cirujano dentista supervisor y no admite cambios.');
                }

                return $this->odontograma->guardar($idHistoria, $registro, $actor);
            }),
        ]);
    }
}
