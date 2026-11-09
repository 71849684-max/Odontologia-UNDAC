<?php

namespace App\Clinica\Http\Controladores;

use App\Clinica\Expediente\ServicioConsentimientos;
use App\Clinica\Expediente\ServicioExpediente;
use App\Clinica\Expediente\ServicioExportacionClinica;
use App\Clinica\Expediente\ServicioVersionesClinicas;
use App\Clinica\Historias\AccesoHistorias;
use App\Clinica\Historias\ServicioEquipoClinico;
use App\Clinica\Historias\ServicioHistorias;
use App\Clinica\Http\RespondeOperacion;
use App\Clinica\Notificaciones\ServicioNotificaciones;
use App\Clinica\Odontograma\ServicioOdontograma;
use App\Http\Controllers\Controller;
use App\Http\Validacion\ReglasBasicas;
use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use App\Identidad\Http\ContextoDesdePeticion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ControladorHistorias extends Controller
{
    use RespondeOperacion;

    public function __construct(
        private readonly ServicioHistorias $historias,
        private readonly ServicioExpediente $expediente,
        private readonly ServicioVersionesClinicas $versiones,
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

        $historia = $this->operacion(fn () => $this->equipo->asignar($idHistoria, $datos['personal'], $actor, ContextoDesdePeticion::de($solicitud)));

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
            'hora' => ReglasBasicas::hora(),
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
            'hora' => ReglasBasicas::hora(),
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
            'hora' => ReglasBasicas::hora(),
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
            'paciente_id' => ['nullable', 'integer', 'min:1', 'exists:paciente,id_paciente'],
            'pacienteId' => ['nullable', 'integer', 'min:1', 'exists:paciente,id_paciente'],
            'tipoDocumento' => ['nullable', Rule::in(['DNI', 'CE', 'PAS'])],
            'dni' => ['bail', 'required_without_all:paciente_id,pacienteId,numeroDocumento', 'nullable', 'string', ($solicitud->filled('paciente_id') || $solicitud->filled('pacienteId')) ? 'max:20' : ReglasBasicas::documento($solicitud->input('tipoDocumento') ?: 'DNI')],
            'nombres' => ['required_without_all:paciente_id,pacienteId', 'nullable', 'string', 'max:180'],
            'apellidoPaterno' => ['nullable', 'string', 'max:120'],
            'apellidoMaterno' => ['nullable', 'string', 'max:120'],
            'numeroDocumento' => ['bail', 'nullable', 'string', ($solicitud->filled('paciente_id') || $solicitud->filled('pacienteId')) ? 'max:20' : ReglasBasicas::documento($solicitud->input('tipoDocumento') ?: 'DNI')],
            'nacimiento' => ['nullable', 'date', 'before_or_equal:today'],
            'fechaNacimiento' => ['nullable', 'date', 'before_or_equal:today'],
            'sexo' => ['nullable', Rule::in(['F', 'M', 'O'])],
            'celular' => ReglasBasicas::telefono(),
            'telefono' => ReglasBasicas::telefono(),
            'email' => ['nullable', 'email', 'max:150'],
            'correo' => ['nullable', 'email', 'max:150'],
        ]);

        $historia = $this->operacion(fn () => $this->historias->abrir($datos, $actor));
        $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_clinica', $historia['id'], 'CREAR', null, ['codigo' => $historia['codigo']]);

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
        if ($antes !== $historia['codigoEstado'] || ! empty($datos['observacion'])) {
            $this->notificaciones->notificarEstado($idHistoria, $historia['codigoEstado'], $actor);
        }

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
        return response()->json($this->operacion(fn () => $this->expediente->obtener($idHistoria)));
    }

    public function decidirConsentimiento(Request $solicitud, int $idHistoria, ServicioConsentimientos $consentimientos): JsonResponse
    {
        $datos = $solicitud->validate(['decision' => ['required', Rule::in(['OTORGADO', 'NEGADO', 'REVOCADO'])], 'motivo' => ['required', 'string', 'max:1000']]);
        $resultado = $this->operacion(fn () => $consentimientos->decidir($idHistoria, $datos['decision'], $datos['motivo'], $solicitud->user()));
        $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_clinica', $idHistoria, 'CONSENTIMIENTO_'.$datos['decision'], null, ['historia' => $idHistoria, 'versionConsentimiento' => $resultado['version'], 'motivo' => $datos['motivo'], 'documento' => $resultado['documento']]);

        return response()->json(['version' => $resultado['version'], 'estado' => $resultado['estado']]);
    }

    public function versiones(int $idHistoria): JsonResponse
    {
        return response()->json(['data' => $this->versiones->listar($idHistoria)]);
    }

    public function version(int $idHistoria, int $idVersion): JsonResponse
    {
        return response()->json($this->versiones->obtener($idHistoria, $idVersion));
    }

    public function exportar(Request $solicitud, int $idHistoria): JsonResponse
    {
        $datos = $this->expediente->obtener($idHistoria);
        $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_clinica', $idHistoria, 'EXPORTAR_HISTORIA', null, ['historia' => $idHistoria]);

        return response()->json(['expediente' => $datos, 'versiones' => $this->versiones->listar($idHistoria), 'exportadoEn' => now()->toISOString()])
            ->header('Content-Disposition', 'attachment; filename="historia-'.$idHistoria.'.json"');
    }

    public function exportacionCompleta(Request $solicitud, int $idHistoria, ServicioExportacionClinica $exportacion): BinaryFileResponse
    {
        $ruta = $this->operacion(fn () => $exportacion->preparar($idHistoria));
        try {
            $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_clinica', $idHistoria, 'EXPORTAR_HISTORIA', null, ['historia' => $idHistoria, 'incluyeVersionesYAdjuntos' => true]);

            return response()->download($ruta, 'historia-'.$idHistoria.'-completa.zip')->deleteFileAfterSend(true);
        } catch (\Throwable $fallo) {
            if (is_file($ruta)) {
                unlink($ruta);
            }
            throw $fallo;
        }
    }

    public function registrarImpresion(Request $solicitud, int $idHistoria): JsonResponse
    {
        $datos = $solicitud->validate(['seccion' => ['required', 'string', 'max:80']]);
        $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_clinica', $idHistoria, 'IMPRIMIR_HISTORIA', null, ['historia' => $idHistoria, 'seccion' => $datos['seccion']]);

        return response()->json(['registrado' => true]);
    }

    public function guardarExpediente(Request $solicitud, int $idHistoria): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'formData' => ['required', 'array', 'max:40'],
            'formData.*' => ['array'],
            'formData.datos-paciente.dni' => ['nullable', 'string', 'max:20'],
            'formData.datos-paciente.nombres' => ['nullable', 'string', 'max:180'],
            'formData.datos-paciente.apellidos' => ['nullable', 'string', 'max:240'],
            'formData.datos-paciente.correo' => ['nullable', 'email', 'max:150'],
            'formData.datos-paciente.celular' => ReglasBasicas::telefono(),
            'formData.datos-paciente.fechaNacimiento' => ['nullable', 'date', 'before_or_equal:today'],
            'formData.datos-paciente.sexo' => ['nullable', Rule::in(['F', 'M', 'O'])],
            'formData.anamnesis.motivoConsulta' => ['nullable', 'string', 'max:10000'],
            'formData.anamnesis.enfermedadActual' => ['nullable', 'string', 'max:10000'],
            'formData.consentimiento.fecha' => ['nullable', 'date', 'before_or_equal:today'],
            'formData.consentimiento.intervencionAutorizada' => ['nullable', 'string', 'max:10000'],
            'formData.consentimiento.representanteTipo' => ['nullable', Rule::in(['paciente', 'representante'])],
            'formData.consentimiento.representacionSustento' => ['nullable', 'string', 'max:5000'],
            'formData.consentimiento.riesgosPersonalizados' => ['nullable', 'string', 'max:10000'],
            'formData.consentimiento.alternativas' => ['nullable', 'string', 'max:10000'],
            'formData.consentimiento.textosClausulas' => ['nullable', 'array', 'max:50'],
            'formData.consentimiento.textosClausulas.*' => ['nullable', 'string', 'max:5000'],
            'formData.examen-clinico.peso' => ReglasBasicas::numeroNoNegativo(),
            'formData.examen-clinico.talla' => ReglasBasicas::numeroNoNegativo(),
            'formData.examen-clinico.temperatura' => ReglasBasicas::numeroNoNegativo(),
            'formData.examen-clinico.frecuenciaRespiratoria' => ReglasBasicas::numeroNoNegativo(),
            'formData.examen-clinico.frecuenciaCardiaca' => ReglasBasicas::numeroNoNegativo(),
            'formData.examen-clinico.pulso' => ReglasBasicas::numeroNoNegativo(),
            'sectionStatus' => ['nullable', 'array', 'max:40'],
            'sectionStatus.*' => [Rule::in(['not-started', 'in-progress', 'complete', 'review', 'approved'])],
            'revision' => ['nullable', 'string', 'size:64'],
            'motivo' => ['nullable', 'string', 'max:1000'],
        ]);
        // Se validan formatos puntuales sin recortar el resto de los campos clínicos
        // del borrador: el servicio conserva el mapeo de cada sección.
        $datos['formData'] = $solicitud->input('formData');

        $operacion = $this->operacion(
            fn () => $this->expediente->guardarConVersion($idHistoria, $datos['formData'], $datos['sectionStatus'] ?? [], $actor, $datos['revision'] ?? null, $datos['motivo'] ?? null),
        );
        $previo = $operacion['previo'];
        $resultado = $operacion['resultado'];
        $estadosPrevios = $previo['sectionStatus'];
        $actuales = $resultado['sectionStatus'];
        $editadas = array_keys(array_filter(array_intersect_key($resultado['formData'], $datos['formData']), fn ($valor, $codigo) => $valor !== ($previo['formData'][$codigo] ?? null), ARRAY_FILTER_USE_BOTH));
        if ($editadas !== []) {
            $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_clinica', $idHistoria, 'EDITAR',
                array_intersect_key($previo['formData'] ?? [], array_flip($editadas)),
                array_intersect_key($resultado['formData'] ?? [], array_flip($editadas)),
            );
        }
        $completadas = array_filter(array_diff_assoc($actuales, $estadosPrevios), fn ($estado) => $estado === 'complete');
        if ($completadas !== []) {
            $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_seccion_estado', $idHistoria, 'MARCAR_COMPLETADO', array_intersect_key($estadosPrevios, $completadas), $completadas);
        }
        $reabiertas = array_filter(array_intersect_key($actuales, array_filter($estadosPrevios, fn ($estado) => in_array($estado, ['approved', 'review', 'complete'], true))), fn ($estado) => $estado === 'in-progress');
        foreach ($reabiertas as $codigo => $estado) {
            $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_seccion_estado', $idHistoria, 'REABRIR_SECCION', [$codigo => $estadosPrevios[$codigo]], [$codigo => $estado, 'motivo' => $datos['motivo'] ?? null]);
        }
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
        foreach ($aprobadas as $codigo => $estado) {
            $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_seccion_estado', $idHistoria, 'APROBAR_SECCION', [$codigo => $estadosPrevios[$codigo] ?? 'not-started'], [$codigo => $estado]);
        }
        $auditoriaEstados = $enviadas;
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
        foreach (array_keys($aprobadas) as $codigo) {
            $this->notificaciones->notificarEstado($idHistoria, 'approved', $actor, $codigo);
        }
        foreach (array_keys($reabiertas) as $codigo) {
            if ($actor->tipoCuenta() === 'DOCENTE') {
                $this->notificaciones->notificarEstado($idHistoria, 'in-progress', $actor, $codigo);
            }
        }

        return response()->json($resultado + [
            'revisionNotificada' => $notificaciones > 0 || ($enviadas !== [] && $this->notificaciones->docentesAsignados($idHistoria) !== []),
            'notificacionesCreadas' => $notificaciones,
            'seccionesEnviadas' => array_keys($enviadas),
        ]);
    }

    public function odontograma(int $idHistoria): JsonResponse
    {
        return response()->json($this->operacion(fn () => $this->odontograma->leerConRevision($idHistoria)));
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

        $guardado = $this->operacion(function () use ($idHistoria, $registro, $actor) {
            if (! $this->acceso->seccionEditable($actor, $idHistoria, 'odontograma')) {
                throw new OperacionNoPermitida('registro', 'El odontograma ya fue aprobado por el cirujano dentista supervisor y no admite cambios.');
            }

            return $this->odontograma->guardar($idHistoria, $registro, $actor);
        });
        $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_clinica', $idHistoria, 'EDITAR_ODONTOGRAMA', null, ['seccion' => 'odontograma']);

        return response()->json(['registro' => $guardado]);
    }
}
