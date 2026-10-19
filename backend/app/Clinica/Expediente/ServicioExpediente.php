<?php

namespace App\Clinica\Expediente;

use App\Clinica\Archivos\ServicioArchivoClinico;
use App\Clinica\Historias\AccesoHistorias;
use App\Clinica\Historias\ServicioHistorias;
use App\Clinica\Odontograma\ServicioOdontograma;
use App\Clinica\Pacientes\ServicioPacientes;
use App\Clinica\Soporte\Valores;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Support\Facades\DB;

class ServicioExpediente
{
    private const ESTADOS_SECCION = ['not-started', 'in-progress', 'complete', 'review', 'approved'];

    /** Clave del frontend => [tipo_examen, nombre_examen] en examen_auxiliar. */
    private const AUXILIARES = [
        'hemoglobina' => ['LAB_VALOR', 'Hemoglobina'],
        'hematocrito' => ['LAB_VALOR', 'Hematocrito'],
        'tiempoCoagulacion' => ['LAB_VALOR', 'Tiempo de coagulación'],
        'tiempoSangria' => ['LAB_VALOR', 'Tiempo de sangría'],
        'grupoSanguineo' => ['LAB_VALOR', 'Grupo sanguíneo'],
        'factorRh' => ['LAB_VALOR', 'Factor Rh'],
        'glucosa' => ['LAB_VALOR', 'Glucosa'],
        'otros' => ['LAB_VALOR', 'Otros'],
        'diagnosticoLaboratorio' => ['LABORATORIO', 'Laboratorio clínico'],
        'rxPanoramico' => ['RADIOGRAFIA', 'RX panorámico'],
        'rxOclusales' => ['RADIOGRAFIA', 'RX oclusales'],
        'rxPeriapicales' => ['RADIOGRAFIA', 'RX periapicales'],
    ];

    public function __construct(
        private readonly ServicioHistorias $historias,
        private readonly ServicioPacientes $pacientes,
        private readonly ServicioOdontograma $odontograma,
        private readonly ServicioArchivoClinico $archivos,
        private readonly AccesoHistorias $acceso,
    ) {}

    public function obtener(int $id): array
    {
        $historia = $this->historias->mostrar($id);
        $paciente = DB::table('paciente')->where('id_paciente', $historia['pacienteId'])->first();
        $contacto = DB::table('paciente_contacto')->where('id_paciente', $historia['pacienteId'])->where('es_principal', 1)->first();

        $form = [
            'datos-paciente' => $this->datosPaciente($paciente, $contacto, $historia),
            'anamnesis' => $this->leerAnamnesis($id),
            'cuestionario-salud' => $this->leerSalud($id),
            'antecedentes' => $this->leerAntecedentes($id),
            'examen-clinico' => $this->filaACamello('examen_clinico_general', $id, [
                'tipo_psicologico' => 'tipoPsicologico', 'marcha' => 'marcha', 'fatiga' => 'fatiga', 'raza' => 'raza',
                'raza_otros' => 'razaOtros', 'peso' => 'peso', 'talla' => 'talla', 'temperatura' => 'temperatura',
                'presion_arterial' => 'presionArterial', 'frecuencia_respiratoria' => 'frecuenciaRespiratoria',
                'pulso' => 'pulso', 'frecuencia_cardiaca' => 'frecuenciaCardiaca', 'forma_craneo' => 'formaCraneo',
                'cabello_implantacion' => 'cabelloImplantacion', 'cabello_color' => 'cabelloColor',
                'ojos_estado' => 'ojosEstado', 'ojos_patologia' => 'ojosPatologia', 'ojos_color' => 'ojosColor',
                'ojos_forma' => 'ojosForma', 'oidos_estado' => 'oidosEstado', 'oidos_patologia' => 'oidosPatologia',
                'audicion' => 'audicion', 'nariz_estado' => 'narizEstado', 'nariz_forma' => 'narizForma',
                'labios_estado' => 'labiosEstado', 'labios_patologia' => 'labiosPatologia', 'labios_forma' => 'labiosForma',
                'fascies_estado' => 'fasciesEstado', 'fascies_color' => 'fasciesColor', 'cuello_forma' => 'cuelloForma',
                'cuello_patologia' => 'cuelloPatologia', 'cadena_linfatica' => 'cadenaLinfatica',
                'cadena_linfatica_patologia' => 'cadenaLinfaticaPatologia', 'atm' => 'atm', 'atm_otros' => 'atmOtros',
                'tiroides' => 'tiroides', 'tiroides_patologia' => 'tiroidesPatologia',
                'miembros_superiores' => 'miembrosSuperiores', 'miembros_superiores_detalle' => 'miembrosSuperioresDetalle',
                'miembros_inferiores' => 'miembrosInferiores', 'miembros_inferiores_detalle' => 'miembrosInferioresDetalle',
                'torax' => 'torax', 'torax_patologia' => 'toraxPatologia',
            ]),
            'examen-extraoral' => $this->leerEstomatologico($id, 'EXTRAORAL'),
            'examen-intraoral' => $this->leerEstomatologico($id, 'INTRAORAL'),
            'oclusion' => $this->leerOclusion($id),
            'examenes-auxiliares' => $this->leerAuxiliares($id),
            'diagnostico' => $this->leerDiagnostico($id),
            'modelos' => $this->leerModelos($id),
            'plan-tratamiento' => $this->leerPlan($id),
            'consentimiento' => $this->leerConsentimiento($id),
            'cirugia' => $this->leerCirugia($id),
            'reporte-operatorio' => $this->leerReporte($id),
            'seguimiento' => $this->leerSeguimiento($id),
        ];

        foreach ($this->archivos->porSeccion($id) as $seccion => $campos) {
            $form[$seccion] = $campos + ($form[$seccion] ?? []);
        }

        $registro = $this->odontograma->leer($id);
        if ($registro !== null) {
            $form['odontograma'] = ['registro' => $registro];
        }

        $estados = $this->estadosSeccion($id);

        return [
            'historia' => $historia,
            'paciente' => $this->pacientes->serializar($paciente),
            'formData' => $form,
            'sectionStatus' => $estados,
        ];
    }

    /** @return array<string, string> */
    public function estadosSeccion(int $id): array
    {
        return DB::table('historia_seccion_estado')
            ->where('id_historia_clinica', $id)
            ->pluck('estado', 'codigo_seccion')
            ->all();
    }

    public function guardar(int $id, array $formulario, array $estados, Cuenta $actor): array
    {
        $this->historias->fila($id);
        $pacienteId = (int) DB::table('historia_clinica')->where('id_historia_clinica', $id)->value('id_paciente');
        // El autoguardado envía todo el expediente: lo aprobado se omite en silencio en vez de rechazar el guardado entero.
        $aprobadas = $this->acceso->seccionesBloqueadas($actor, $id);
        $formulario = array_diff_key($formulario, array_flip($aprobadas));

        DB::transaction(function () use ($id, $pacienteId, $formulario, $estados, $actor, $aprobadas) {
            if (isset($formulario['datos-paciente']) && is_array($formulario['datos-paciente'])) {
                $this->pacientes->sincronizarFicha($pacienteId, $formulario['datos-paciente'], $actor);
            }
            if (isset($formulario['anamnesis'])) {
                $this->guardarAnamnesis($id, $formulario['anamnesis']);
            }
            if (isset($formulario['cuestionario-salud'])) {
                $this->guardarSalud($id, $formulario['cuestionario-salud']);
            }
            if (isset($formulario['antecedentes'])) {
                $this->guardarAntecedentes($id, $formulario['antecedentes']);
            }
            if (isset($formulario['examen-clinico'])) {
                $this->guardarExamenGeneral($id, $formulario['examen-clinico']);
            }
            if (isset($formulario['examen-extraoral'])) {
                $this->guardarEstomatologico($id, 'EXTRAORAL', $formulario['examen-extraoral']);
            }
            if (isset($formulario['examen-intraoral'])) {
                $this->guardarEstomatologico($id, 'INTRAORAL', $formulario['examen-intraoral']);
            }
            if (isset($formulario['oclusion'])) {
                $this->guardarOclusion($id, $formulario['oclusion']);
            }
            if (isset($formulario['examenes-auxiliares'])) {
                $this->guardarAuxiliares($id, $formulario['examenes-auxiliares']);
            }
            if (isset($formulario['diagnostico'])) {
                $this->guardarDiagnostico($id, $formulario['diagnostico']);
            }
            if (isset($formulario['modelos'])) {
                $this->guardarModelos($id, $formulario['modelos']);
            }
            if (isset($formulario['plan-tratamiento'])) {
                $this->guardarPlan($id, $formulario['plan-tratamiento']);
            }
            if (isset($formulario['consentimiento'])) {
                $this->guardarConsentimiento($id, $formulario['consentimiento']);
            }
            if (isset($formulario['cirugia'])) {
                $this->guardarCirugia($id, $formulario['cirugia']);
            }
            if (isset($formulario['reporte-operatorio'])) {
                $this->guardarReporte($id, $formulario['reporte-operatorio']);
            }
            if (isset($formulario['seguimiento'])) {
                $this->guardarSeguimiento($id, $formulario['seguimiento']);
            }
            if (isset($formulario['odontograma']['registro']) && is_array($formulario['odontograma']['registro'])) {
                $this->odontograma->guardar($id, $formulario['odontograma']['registro'], $actor);
            }

            $puedeAprobar = ! $this->acceso->restringido($actor);

            foreach ($estados as $codigo => $estado) {
                if (! is_string($codigo) || ! in_array($estado, self::ESTADOS_SECCION, true)) {
                    continue;
                }
                if (! $puedeAprobar && ($estado === 'approved' || in_array($codigo, $aprobadas, true))) {
                    continue;
                }
                DB::table('historia_seccion_estado')->updateOrInsert(
                    ['id_historia_clinica' => $id, 'codigo_seccion' => mb_substr($codigo, 0, 80)],
                    [
                        'estado' => mb_substr($estado, 0, 30),
                        'tipo_usuario' => $actor->tipoCuenta(),
                        'id_usuario' => $actor->id(),
                        'actualizado_en' => now(),
                    ],
                );
            }

            $codigoActual = DB::table('historia_clinica as h')
                ->join('estado_historia_clinica as e', 'e.id_estado_historia', '=', 'h.id_estado_historia')
                ->where('h.id_historia_clinica', $id)
                ->value('e.codigo');

            if ($codigoActual === 'BORRADOR') {
                $enProceso = (int) DB::table('estado_historia_clinica')->where('codigo', 'EN_PROCESO')->value('id_estado_historia');
                DB::table('historia_clinica')->where('id_historia_clinica', $id)->update([
                    'id_estado_historia' => $enProceso,
                    'actualizado_por_tipo' => $actor->tipoCuenta(),
                    'actualizado_por_id' => $actor->id(),
                ]);
                DB::table('paciente')->where('id_paciente', $pacienteId)->update(['estado_atencion' => 'En proceso']);
            }
        });

        return $this->obtener($id);
    }

    private function datosPaciente(?object $paciente, ?object $contacto, array $historia): array
    {
        if ($paciente === null) {
            return [];
        }

        $apellidos = preg_split('/\s+/', (string) $paciente->apellidos) ?: [];

        // fechaPaciente = momento de creación de ESTA historia (no la ficha del paciente ni una HC previa).
        $ficha = array_filter($this->pacientes->ficha((int) $paciente->id_paciente) + [
            'apellidoPaterno' => $apellidos[0] ?? '',
            'apellidoMaterno' => implode(' ', array_slice($apellidos, 1)),
            'operador' => $historia['operador'] ?? '',
        ], fn ($valor) => $valor !== null && $valor !== '');
        $ficha['fechaPaciente'] = Valores::fechaHoraLocal($historia['fecha'] ?? null);

        return $ficha;
    }

    private function guardarAnamnesis(int $id, array $datos): void
    {
        $fila = [
            'enfermedad_actual' => Valores::texto($datos['historiaEnfermedad'] ?? null),
            'motivo_consulta' => Valores::texto($datos['motivoConsulta'] ?? null),
            'estado_general' => Valores::texto($datos['estadoGeneral'] ?? null),
            'ectoscopia' => Valores::texto($datos['ectoscopia'] ?? null),
            'ultima_visita_dentista' => Valores::texto($datos['ultimaVisitaDentista'] ?? null),
            'motivo_visita_dentista' => Valores::texto($datos['motivoVisitaDentista'] ?? null),
            'observaciones' => Valores::texto($datos['observacionesPsicologicas'] ?? $datos['observaciones'] ?? null),
        ];
        $existente = DB::table('anamnesis')->where('id_historia_clinica', $id)->value('id_anamnesis');
        if ($existente) {
            DB::table('anamnesis')->where('id_anamnesis', $existente)->update($fila);
            $idAnamnesis = (int) $existente;
        } else {
            $idAnamnesis = (int) DB::table('anamnesis')->insertGetId($fila + ['id_historia_clinica' => $id, 'creado_en' => now()]);
        }

        DB::table('anamnesis_estado_psicologico')->where('id_anamnesis', $idAnamnesis)->delete();
        foreach ((array) ($datos['estadoPsicologico'] ?? []) as $estado) {
            $texto = Valores::texto($estado);
            if ($texto) {
                DB::table('anamnesis_estado_psicologico')->insert(['id_anamnesis' => $idAnamnesis, 'estado' => mb_substr($texto, 0, 40)]);
            }
        }

        DB::table('historia_clinica')->where('id_historia_clinica', $id)->update([
            'motivo_consulta' => $fila['motivo_consulta'],
            'tipo_atencion' => Valores::texto($datos['tipoAtencion'] ?? null),
        ]);
    }

    private function leerAnamnesis(int $id): array
    {
        $fila = DB::table('anamnesis')->where('id_historia_clinica', $id)->first();
        if ($fila === null) {
            return [];
        }
        $historia = DB::table('historia_clinica')->where('id_historia_clinica', $id)->first();
        $estados = DB::table('anamnesis_estado_psicologico')
            ->where('id_anamnesis', $fila->id_anamnesis)
            ->orderBy('id_anamnesis_estado')
            ->pluck('estado')
            ->all();

        return array_filter([
            'motivoConsulta' => $fila->motivo_consulta ?? '',
            'tipoAtencion' => $historia->tipo_atencion ?? '',
            'historiaEnfermedad' => $fila->enfermedad_actual ?? '',
            'estadoGeneral' => $fila->estado_general ?? '',
            'ectoscopia' => $fila->ectoscopia ?? '',
            'observacionesPsicologicas' => $fila->observaciones ?? '',
            'estadoPsicologico' => $estados,
            'ultimaVisitaDentista' => $fila->ultima_visita_dentista ?? '',
            'motivoVisitaDentista' => $fila->motivo_visita_dentista ?? '',
        ], fn ($valor) => $valor !== '' && $valor !== []);
    }

    private function guardarSalud(int $id, array $datos): void
    {
        $preguntas = DB::table('pregunta_salud')->where('estado', 1)->get()->keyBy('numero');
        foreach ($preguntas as $numero => $pregunta) {
            $respuesta = Valores::siNo($datos['q'.$numero.'Answer'] ?? null);
            if ($respuesta === null) {
                continue;
            }
            DB::table('respuesta_salud')->updateOrInsert(
                ['id_historia_clinica' => $id, 'id_pregunta' => $pregunta->id_pregunta],
                [
                    'respuesta' => $respuesta,
                    'detalle' => Valores::texto($datos['q'.$numero.'Detail'] ?? null),
                    'detalle_adicional' => Valores::texto($datos['q'.$numero.'Extra'] ?? null),
                ],
            );
        }
    }

    private function leerSalud(int $id): array
    {
        $filas = DB::table('respuesta_salud as r')
            ->join('pregunta_salud as p', 'p.id_pregunta', '=', 'r.id_pregunta')
            ->where('r.id_historia_clinica', $id)
            ->get(['p.numero', 'r.respuesta', 'r.detalle', 'r.detalle_adicional']);
        $datos = [];
        foreach ($filas as $fila) {
            $datos['q'.$fila->numero.'Answer'] = Valores::desdeSiNo($fila->respuesta);
            if ($fila->detalle) {
                $datos['q'.$fila->numero.'Detail'] = $fila->detalle;
            }
            if ($fila->detalle_adicional) {
                $datos['q'.$fila->numero.'Extra'] = $fila->detalle_adicional;
            }
        }

        return $datos;
    }

    private function guardarAntecedentes(int $id, array $datos): void
    {
        $personal = [
            'hijos_numero' => $this->entero($datos['hijosNumero'] ?? null),
            'hijos_vivos' => $this->entero($datos['hijosVivos'] ?? null),
            'hijos_fallecidos' => $this->entero($datos['hijosFallecidos'] ?? null),
            'ningun_hijo' => Valores::siNo($datos['ningunHijo'] ?? null),
            'vivienda' => Valores::texto($datos['vivienda'] ?? null),
            'vivienda_otros' => Valores::texto($datos['viviendaOtros'] ?? null),
            'material_vivienda' => Valores::texto($datos['materialVivienda'] ?? null),
            'material_otros' => Valores::texto($datos['materialOtros'] ?? null),
            'viajes' => Valores::texto($datos['viajes'] ?? null),
            'viajes_otros' => Valores::texto($datos['viajesOtros'] ?? null),
            'alimentacion' => Valores::texto($datos['alimentacion'] ?? null),
            'alimentacion_otros' => Valores::texto($datos['alimentacionOtros'] ?? null),
            'inmunizaciones' => Valores::siNo($datos['inmunizaciones'] ?? null),
            'situacion_socioeconomica' => Valores::texto($datos['socioeconomica'] ?? null),
        ];
        $idPersonal = DB::table('antecedente_personal')->where('id_historia_clinica', $id)->value('id_antecedente_personal');
        if ($idPersonal) {
            DB::table('antecedente_personal')->where('id_antecedente_personal', $idPersonal)->update($personal);
        } else {
            $idPersonal = DB::table('antecedente_personal')->insertGetId($personal + ['id_historia_clinica' => $id, 'creado_en' => now()]);
        }
        DB::table('antecedente_habito_nocivo')->where('id_antecedente_personal', $idPersonal)->delete();
        foreach ((array) ($datos['habitosNocivos'] ?? []) as $habito) {
            $texto = Valores::texto($habito);
            if ($texto) {
                DB::table('antecedente_habito_nocivo')->insert([
                    'id_antecedente_personal' => $idPersonal,
                    'tipo_habito' => mb_substr($texto, 0, 40),
                    'detalle' => Valores::texto($datos['habitosDetalle'] ?? null),
                ]);
            }
        }

        $this->upsertUno('antecedente_fisiologico', 'id_antecedente_fisiologico', $id, [
            'prenatal' => Valores::texto($datos['prenatal'] ?? null),
            'prenatal_detalle' => Valores::texto($datos['prenatalDetalle'] ?? null),
            'natal' => Valores::texto($datos['natal'] ?? null),
            'natal_detalle' => Valores::texto($datos['natalDetalle'] ?? null),
            'lactancia' => Valores::texto($datos['lactancia'] ?? null),
            'lactancia_otros' => Valores::texto($datos['lactanciaOtros'] ?? null),
            'menarquia' => Valores::texto($datos['menarquia'] ?? null),
            'menstruacion_caracteristicas' => Valores::texto($datos['menstruacionCaracteristicas'] ?? null),
            'menstruacion_final' => Valores::texto($datos['menstruacionFinal'] ?? null),
            'gestacion' => Valores::siNo($datos['gestacion'] ?? null),
            'gestacion_tiempo' => Valores::texto($datos['gestacionTiempo'] ?? null),
        ]);
        $this->upsertUno('antecedente_terapeutico', 'id_antecedente_terapeutico', $id, [
            'alergia_medicamento' => Valores::siNo($datos['alergiaMedicamento'] ?? null),
            'alergia_medicamento_detalle' => Valores::texto($datos['alergiaMedicamentoDetalle'] ?? null),
            'medicacion_anterior_nombre' => Valores::texto($datos['medicacionAnteriorNombre'] ?? null),
            'medicacion_anterior_dosis' => Valores::texto($datos['medicacionAnteriorDosis'] ?? null),
            'medicacion_actual' => Valores::siNo($datos['medicacionActual'] ?? null),
            'medicacion_actual_nombre' => Valores::texto($datos['medicacionActualNombre'] ?? null),
            'medicacion_actual_dosis' => Valores::texto($datos['medicacionActualDosis'] ?? null),
            'medicacion_actual_motivo' => Valores::texto($datos['medicacionActualMotivo'] ?? null),
        ]);

        DB::table('antecedente_anestesia')->where('id_historia_clinica', $id)->delete();
        DB::table('antecedente_anestesia')->insert([
            'id_historia_clinica' => $id,
            'anestesia_total' => Valores::siNo($datos['cirugiaAnestesiaTotal'] ?? null),
            'tipo_intervencion' => Valores::texto($datos['tipoIntervencion'] ?? null),
            'reaccion_anestesia' => Valores::texto($datos['reaccionAnestesia'] ?? null),
            'reaccion_detalle' => Valores::texto($datos['reaccionAnestesiaDetalle'] ?? null),
            'hemorragia_intervencion' => Valores::siNo($datos['hemorragiaIntervencion'] ?? null),
            'hemorragia_dias' => Valores::texto($datos['hemorragiaDias'] ?? null),
            'cicatrizacion' => Valores::texto($datos['cicatrizacion'] ?? null),
            'cicatrizacion_otros' => Valores::texto($datos['cicatrizacionOtros'] ?? null),
            'creado_en' => now(),
        ]);
        DB::table('antecedente_exodoncia')->where('id_historia_clinica', $id)->delete();
        DB::table('antecedente_exodoncia')->insert([
            'id_historia_clinica' => $id,
            'realizo_exodoncias' => Valores::siNo($datos['exodoncias'] ?? null),
            'problemas_anestesico' => Valores::siNo($datos['problemasAnestesicoOdontologico'] ?? null),
            'hemorragia_post_exodoncia' => Valores::siNo($datos['hemorragiasPostExodoncia'] ?? null),
            'hemorragia_dias' => Valores::texto($datos['hemorragiasPostExodonciaDias'] ?? null),
            'realizada_por' => Valores::texto($datos['exodonciaRealizadaPor'] ?? null),
            'creado_en' => now(),
        ]);

        DB::table('antecedente_familiar')->where('id_historia_clinica', $id)->delete();
        foreach ([
            'PADRE' => ['padreEstado', 'padreEstadoOtros', null, null, null],
            'MADRE' => ['madreEstado', 'madreEstadoOtros', null, null, null],
            'HERMANOS' => ['hermanosOtros', 'hermanosOtros', 'hermanosNumero', 'hermanosVivos', 'hermanosFallecidos'],
        ] as $parentesco => [$estado, $detalle, $total, $vivos, $fallecidos]) {
            DB::table('antecedente_familiar')->insert([
                'id_historia_clinica' => $id,
                'parentesco' => $parentesco,
                'estado_familiar' => Valores::texto($datos[$estado] ?? null),
                'detalle' => Valores::texto($datos[$detalle] ?? null),
                'cantidad_total' => $total ? $this->entero($datos[$total] ?? null) : null,
                'vivos' => $vivos ? $this->entero($datos[$vivos] ?? null) : null,
                'fallecidos' => $fallecidos ? $this->entero($datos[$fallecidos] ?? null) : null,
                'creado_en' => now(),
            ]);
        }
    }

    private function leerAntecedentes(int $id): array
    {
        $personal = DB::table('antecedente_personal')->where('id_historia_clinica', $id)->first();
        $datos = [];
        if ($personal) {
            $datos = [
                'hijosNumero' => $personal->hijos_numero, 'hijosVivos' => $personal->hijos_vivos,
                'hijosFallecidos' => $personal->hijos_fallecidos, 'ningunHijo' => Valores::desdeSiNo($personal->ningun_hijo),
                'vivienda' => $personal->vivienda ?? '', 'viviendaOtros' => $personal->vivienda_otros ?? '',
                'materialVivienda' => $personal->material_vivienda ?? '', 'materialOtros' => $personal->material_otros ?? '',
                'viajes' => $personal->viajes ?? '', 'viajesOtros' => $personal->viajes_otros ?? '',
                'alimentacion' => $personal->alimentacion ?? '', 'alimentacionOtros' => $personal->alimentacion_otros ?? '',
                'inmunizaciones' => Valores::desdeSiNo($personal->inmunizaciones),
                'socioeconomica' => $personal->situacion_socioeconomica ?? '',
                'habitosNocivos' => DB::table('antecedente_habito_nocivo')->where('id_antecedente_personal', $personal->id_antecedente_personal)->pluck('tipo_habito')->all(),
                'habitosDetalle' => DB::table('antecedente_habito_nocivo')->where('id_antecedente_personal', $personal->id_antecedente_personal)->value('detalle') ?? '',
            ];
        }
        $fisio = DB::table('antecedente_fisiologico')->where('id_historia_clinica', $id)->first();
        if ($fisio) {
            $datos += [
                'prenatal' => $fisio->prenatal ?? '', 'prenatalDetalle' => $fisio->prenatal_detalle ?? '',
                'natal' => $fisio->natal ?? '', 'natalDetalle' => $fisio->natal_detalle ?? '',
                'lactancia' => $fisio->lactancia ?? '', 'lactanciaOtros' => $fisio->lactancia_otros ?? '',
                'menarquia' => $fisio->menarquia ?? '', 'menstruacionCaracteristicas' => $fisio->menstruacion_caracteristicas ?? '',
                'menstruacionFinal' => $fisio->menstruacion_final ?? '', 'gestacion' => Valores::desdeSiNo($fisio->gestacion),
                'gestacionTiempo' => $fisio->gestacion_tiempo ?? '',
            ];
        }
        $tera = DB::table('antecedente_terapeutico')->where('id_historia_clinica', $id)->first();
        if ($tera) {
            $datos += [
                'alergiaMedicamento' => Valores::desdeSiNo($tera->alergia_medicamento),
                'alergiaMedicamentoDetalle' => $tera->alergia_medicamento_detalle ?? '',
                'medicacionAnteriorNombre' => $tera->medicacion_anterior_nombre ?? '',
                'medicacionAnteriorDosis' => $tera->medicacion_anterior_dosis ?? '',
                'medicacionActual' => Valores::desdeSiNo($tera->medicacion_actual),
                'medicacionActualNombre' => $tera->medicacion_actual_nombre ?? '',
                'medicacionActualDosis' => $tera->medicacion_actual_dosis ?? '',
                'medicacionActualMotivo' => $tera->medicacion_actual_motivo ?? '',
            ];
        }
        $anestesia = DB::table('antecedente_anestesia')->where('id_historia_clinica', $id)->first();
        if ($anestesia) {
            $datos += [
                'cirugiaAnestesiaTotal' => Valores::desdeSiNo($anestesia->anestesia_total),
                'tipoIntervencion' => $anestesia->tipo_intervencion ?? '',
                'reaccionAnestesia' => $anestesia->reaccion_anestesia ?? '',
                'reaccionAnestesiaDetalle' => $anestesia->reaccion_detalle ?? '',
                'hemorragiaIntervencion' => Valores::desdeSiNo($anestesia->hemorragia_intervencion),
                'hemorragiaDias' => $anestesia->hemorragia_dias ?? '',
                'cicatrizacion' => $anestesia->cicatrizacion ?? '',
                'cicatrizacionOtros' => $anestesia->cicatrizacion_otros ?? '',
            ];
        }
        $exodoncia = DB::table('antecedente_exodoncia')->where('id_historia_clinica', $id)->first();
        if ($exodoncia) {
            $datos += [
                'exodoncias' => Valores::desdeSiNo($exodoncia->realizo_exodoncias),
                'problemasAnestesicoOdontologico' => Valores::desdeSiNo($exodoncia->problemas_anestesico),
                'hemorragiasPostExodoncia' => Valores::desdeSiNo($exodoncia->hemorragia_post_exodoncia),
                'hemorragiasPostExodonciaDias' => $exodoncia->hemorragia_dias ?? '',
                'exodonciaRealizadaPor' => $exodoncia->realizada_por ?? '',
            ];
        }
        foreach (DB::table('antecedente_familiar')->where('id_historia_clinica', $id)->get() as $familiar) {
            if ($familiar->parentesco === 'PADRE') {
                $datos['padreEstado'] = $familiar->estado_familiar ?? '';
                $datos['padreEstadoOtros'] = $familiar->detalle ?? '';
            }
            if ($familiar->parentesco === 'MADRE') {
                $datos['madreEstado'] = $familiar->estado_familiar ?? '';
                $datos['madreEstadoOtros'] = $familiar->detalle ?? '';
            }
            if ($familiar->parentesco === 'HERMANOS') {
                $datos['hermanosNumero'] = $familiar->cantidad_total;
                $datos['hermanosVivos'] = $familiar->vivos;
                $datos['hermanosFallecidos'] = $familiar->fallecidos;
                $datos['hermanosOtros'] = $familiar->detalle ?? '';
            }
        }

        return array_filter($datos, fn ($valor) => $valor !== '' && $valor !== null && $valor !== []);
    }

    private function guardarExamenGeneral(int $id, array $datos): void
    {
        $mapa = [
            'tipoPsicologico' => 'tipo_psicologico', 'marcha' => 'marcha', 'raza' => 'raza', 'razaOtros' => 'raza_otros',
            'presionArterial' => 'presion_arterial', 'formaCraneo' => 'forma_craneo', 'cabelloImplantacion' => 'cabello_implantacion',
            'cabelloColor' => 'cabello_color', 'ojosEstado' => 'ojos_estado', 'ojosPatologia' => 'ojos_patologia',
            'ojosColor' => 'ojos_color', 'ojosForma' => 'ojos_forma', 'oidosEstado' => 'oidos_estado',
            'oidosPatologia' => 'oidos_patologia', 'audicion' => 'audicion', 'narizEstado' => 'nariz_estado',
            'narizForma' => 'nariz_forma', 'labiosEstado' => 'labios_estado', 'labiosPatologia' => 'labios_patologia',
            'labiosForma' => 'labios_forma', 'fasciesEstado' => 'fascies_estado', 'fasciesColor' => 'fascies_color',
            'cuelloForma' => 'cuello_forma', 'cuelloPatologia' => 'cuello_patologia', 'cadenaLinfatica' => 'cadena_linfatica',
            'cadenaLinfaticaPatologia' => 'cadena_linfatica_patologia', 'atm' => 'atm', 'atmOtros' => 'atm_otros',
            'tiroides' => 'tiroides', 'tiroidesPatologia' => 'tiroides_patologia', 'miembrosSuperiores' => 'miembros_superiores',
            'miembrosSuperioresDetalle' => 'miembros_superiores_detalle', 'miembrosInferiores' => 'miembros_inferiores',
            'miembrosInferioresDetalle' => 'miembros_inferiores_detalle', 'torax' => 'torax', 'toraxPatologia' => 'torax_patologia',
        ];
        $fila = ['fatiga' => Valores::texto($datos['fatiga'] ?? null)];
        foreach ($mapa as $origen => $destino) {
            $fila[$destino] = Valores::texto($datos[$origen] ?? null);
        }
        foreach (['peso', 'talla', 'temperatura', 'frecuenciaRespiratoria', 'pulso', 'frecuenciaCardiaca'] as $numerico) {
            $columna = strtolower(preg_replace('/([a-z])([A-Z])/', '$1_$2', $numerico) ?? $numerico);
            $fila[$columna] = Valores::decimal($datos[$numerico] ?? null);
        }
        $this->upsertUno('examen_clinico_general', 'id_examen_clinico_general', $id, $fila);
    }

    private function guardarEstomatologico(int $id, string $tipo, array $datos): void
    {
        $ids = DB::table('examen_estomatologico')->where('id_historia_clinica', $id)->where('tipo_examen', $tipo)->pluck('id_examen_estomatologico');
        if ($ids->isNotEmpty()) {
            DB::table('hallazgo_estomatologico')->whereIn('id_examen_estomatologico', $ids)->delete();
            DB::table('examen_estomatologico')->whereIn('id_examen_estomatologico', $ids)->delete();
        }
        foreach ($datos as $clave => $valor) {
            if (! is_string($clave) || is_array($valor) || $valor === '' || $valor === null) {
                continue;
            }
            DB::table('examen_estomatologico')->insert([
                'id_historia_clinica' => $id,
                'tipo_examen' => $tipo,
                'estructura_anatomica' => mb_substr($clave, 0, 100),
                'estado_estructura' => 'REGISTRADO',
                'descripcion' => (string) $valor,
                'creado_en' => now(),
            ]);
        }
    }

    private function leerEstomatologico(int $id, string $tipo): array
    {
        return DB::table('examen_estomatologico')
            ->where('id_historia_clinica', $id)
            ->where('tipo_examen', $tipo)
            ->pluck('descripcion', 'estructura_anatomica')
            ->all();
    }

    private function guardarOclusion(int $id, array $datos): void
    {
        $this->upsertUno('examen_oclusion', 'id_examen_oclusion', $id, [
            'clasificacion_posterior' => Valores::texto($datos['oclusionPosterior'] ?? null),
            'clasificacion_anterior' => Valores::texto($datos['oclusionAnterior'] ?? null),
            'motivos_perdida' => $this->lista($datos['motivosPerdida'] ?? [], 255),
            'motivos_perdida_otros' => $this->corto($datos['motivosPerdidaOtros'] ?? null, 255),
            'ultima_exodoncia' => Valores::texto($datos['ultimaExodoncia'] ?? null),
            'diagnostico_presuntivo' => Valores::texto($datos['diagnosticoPresuntivoOclusion'] ?? null),
        ]);
        DB::table('protesis')->where('id_historia_clinica', $id)->delete();
        $profesional = $this->corto($datos['protesisProfesional'] ?? null, 80);
        foreach ((array) ($datos['protesisTipos'] ?? []) as $tipo) {
            $texto = Valores::texto(is_scalar($tipo) ? $tipo : null);
            if ($texto) {
                DB::table('protesis')->insert([
                    'id_historia_clinica' => $id,
                    'tipo_protesis' => mb_substr($texto, 0, 60),
                    'confeccionada_por' => $profesional,
                    'observaciones' => $texto === 'Otros' ? Valores::texto($datos['protesisOtros'] ?? null) : null,
                    'creado_en' => now(),
                ]);
            }
        }
    }

    private function leerOclusion(int $id): array
    {
        $fila = DB::table('examen_oclusion')->where('id_historia_clinica', $id)->first();
        $protesis = DB::table('protesis')->where('id_historia_clinica', $id)->orderBy('id_protesis')->get();

        return array_filter([
            'oclusionPosterior' => $fila->clasificacion_posterior ?? '',
            'oclusionAnterior' => $fila->clasificacion_anterior ?? '',
            'ultimaExodoncia' => $fila->ultima_exodoncia ?? '',
            'motivosPerdida' => $fila && $fila->motivos_perdida ? array_map('trim', explode(',', $fila->motivos_perdida)) : [],
            'motivosPerdidaOtros' => $fila->motivos_perdida_otros ?? '',
            'diagnosticoPresuntivoOclusion' => $fila->diagnostico_presuntivo ?? '',
            'protesisTipos' => $protesis->pluck('tipo_protesis')->all(),
            'protesisOtros' => $protesis->firstWhere('tipo_protesis', 'Otros')->observaciones ?? '',
            'protesisProfesional' => $protesis->first()->confeccionada_por ?? '',
        ], fn ($valor) => $valor !== '' && $valor !== [] && $valor !== null);
    }

    private function lista(mixed $valores, int $longitud): ?string
    {
        $textos = array_filter(array_map(
            fn ($valor) => is_scalar($valor) ? Valores::texto(str_replace(',', ' ', (string) $valor)) : null,
            (array) $valores,
        ));

        return $textos === [] ? null : mb_substr(implode(', ', $textos), 0, $longitud);
    }

    private function corto(mixed $valor, int $longitud): ?string
    {
        $texto = Valores::texto(is_scalar($valor) ? $valor : null);

        return $texto === null ? null : mb_substr($texto, 0, $longitud);
    }

    private function guardarAuxiliares(int $id, array $datos): void
    {
        DB::table('examen_auxiliar')->where('id_historia_clinica', $id)->whereNull('id_archivo')->delete();
        foreach (self::AUXILIARES as $clave => [$tipo, $nombre]) {
            $texto = Valores::texto(is_scalar($datos[$clave] ?? null) ? $datos[$clave] : null);
            if ($texto) {
                DB::table('examen_auxiliar')->insert([
                    'id_historia_clinica' => $id,
                    'tipo_examen' => $tipo,
                    'nombre_examen' => $nombre,
                    'resultado' => $texto,
                    'creado_en' => now(),
                ]);
            }
        }
    }

    private function leerAuxiliares(int $id): array
    {
        $inverso = [];
        foreach (self::AUXILIARES as $clave => [$tipo, $nombre]) {
            $inverso[$tipo.'|'.$nombre] = $clave;
        }
        $datos = [];
        foreach (DB::table('examen_auxiliar')->where('id_historia_clinica', $id)->whereNull('id_archivo')->get() as $fila) {
            $clave = $inverso[$fila->tipo_examen.'|'.$fila->nombre_examen] ?? null;
            if ($clave) {
                $datos[$clave] = $fila->resultado;
            }
        }

        return $datos;
    }

    private function guardarDiagnostico(int $id, array $datos): void
    {
        DB::table('diagnostico')->where('id_historia_clinica', $id)->delete();
        $version = 1;
        foreach ((array) ($datos['diagnosticos'] ?? []) as $item) {
            if (! is_array($item)) {
                continue;
            }
            $descripcion = Valores::texto($item['evidencia'] ?? $item['observaciones'] ?? $item['descripcion'] ?? null) ?? 'Sin descripción';
            DB::table('diagnostico')->insert([
                'id_historia_clinica' => $id,
                'codigo' => Valores::texto($item['codigo'] ?? null),
                'tipo_diagnostico' => mb_substr((string) ($item['tipo'] ?? 'CLINICO'), 0, 40),
                'pieza_region' => Valores::texto($item['piezaRegion'] ?? null),
                'severidad' => Valores::texto($item['severidad'] ?? null),
                'descripcion' => $descripcion,
                'evidencia_clinica' => Valores::texto($item['evidencia'] ?? null),
                'observaciones' => Valores::texto($item['observaciones'] ?? null),
                'numero_version' => $version,
                'es_actual' => 1,
                'creado_en' => now(),
            ]);
            $version++;
        }
        foreach ([
            'CLINICO_RADIOGRAFICO' => 'dxClinicoRadiografico',
            'PRESUNTIVO' => 'dxPresuntivo',
            'DEFINITIVO' => 'dxDefinitivo',
        ] as $tipo => $clave) {
            $texto = Valores::texto($datos[$clave] ?? null);
            if ($texto) {
                DB::table('diagnostico')->insert([
                    'id_historia_clinica' => $id,
                    'tipo_diagnostico' => $tipo,
                    'descripcion' => $texto,
                    'numero_version' => $version,
                    'es_actual' => 1,
                    'creado_en' => now(),
                ]);
                $version++;
            }
        }
        $estructurado = $this->corto($datos['pronosticoEstructurado'] ?? null, 20);
        $libre = Valores::texto(is_scalar($datos['pronostico'] ?? null) ? $datos['pronostico'] : null);
        $justificacion = Valores::texto(is_scalar($datos['pronosticoJustificacion'] ?? null) ? $datos['pronosticoJustificacion'] : null);
        if ($estructurado || $libre || $justificacion) {
            $this->upsertUno('pronostico_clinico', 'id_pronostico_clinico', $id, [
                'pronostico' => $estructurado ?? '',
                'justificacion' => $justificacion,
                'pronostico_libre' => $libre,
            ]);
        }
    }

    private function leerDiagnostico(int $id): array
    {
        $items = [];
        $libres = [];
        foreach (DB::table('diagnostico')->where('id_historia_clinica', $id)->where('es_actual', 1)->orderBy('numero_version')->get() as $fila) {
            if (in_array($fila->tipo_diagnostico, ['CLINICO_RADIOGRAFICO', 'PRESUNTIVO', 'DEFINITIVO'], true) && $fila->codigo === null && $fila->pieza_region === null) {
                $libres[$fila->tipo_diagnostico] = $fila->descripcion;

                continue;
            }
            $items[] = [
                'codigo' => $fila->codigo ?? '',
                'tipo' => $fila->tipo_diagnostico,
                'piezaRegion' => $fila->pieza_region ?? '',
                'severidad' => $fila->severidad ?? '',
                'evidencia' => $fila->evidencia_clinica ?? '',
                'observaciones' => $fila->observaciones ?? '',
            ];
        }
        $pronostico = DB::table('pronostico_clinico')->where('id_historia_clinica', $id)->first();

        return array_filter([
            'diagnosticos' => $items,
            'dxClinicoRadiografico' => $libres['CLINICO_RADIOGRAFICO'] ?? '',
            'dxPresuntivo' => $libres['PRESUNTIVO'] ?? '',
            'dxDefinitivo' => $libres['DEFINITIVO'] ?? '',
            'pronosticoEstructurado' => $pronostico->pronostico ?? '',
            'pronosticoJustificacion' => $pronostico->justificacion ?? '',
            'pronostico' => $pronostico->pronostico_libre ?? '',
        ], fn ($valor) => $valor !== '' && $valor !== [] && $valor !== null);
    }

    private function guardarModelos(int $id, array $datos): void
    {
        $this->upsertUno('estudio_modelo', 'id_estudio_modelo', $id, [
            'informe_maxilar' => Valores::texto($datos['informeMaxilar'] ?? null),
            'informe_mandibula' => Valores::texto($datos['informeMandibula'] ?? null),
            'planificacion' => Valores::texto($datos['planificacionModelos'] ?? $datos['planificacion'] ?? null),
        ]);
    }

    private function leerModelos(int $id): array
    {
        $fila = DB::table('estudio_modelo')->where('id_historia_clinica', $id)->first();

        return $fila ? array_filter([
            'informeMaxilar' => $fila->informe_maxilar ?? '',
            'informeMandibula' => $fila->informe_mandibula ?? '',
            'planificacionModelos' => $fila->planificacion ?? '',
        ], fn ($valor) => $valor !== '') : [];
    }

    private function guardarPlan(int $id, array $datos): void
    {
        $planes = DB::table('plan_tratamiento')->where('id_historia_clinica', $id)->pluck('id_plan_tratamiento');
        if ($planes->isNotEmpty()) {
            $fases = DB::table('fase_tratamiento')->whereIn('id_plan_tratamiento', $planes)->pluck('id_fase_tratamiento');
            if ($fases->isNotEmpty()) {
                DB::table('plan_tratamiento_item')->whereIn('id_fase_tratamiento', $fases)->delete();
                DB::table('fase_tratamiento')->whereIn('id_fase_tratamiento', $fases)->delete();
            }
            DB::table('plan_tratamiento')->whereIn('id_plan_tratamiento', $planes)->delete();
        }
        $idPlan = DB::table('plan_tratamiento')->insertGetId([
            'id_historia_clinica' => $id,
            'tipo_plan' => 'INTEGRAL',
            'descripcion' => Valores::texto($datos['planIntegral'] ?? null),
            'estado' => 'BORRADOR',
            'creado_en' => now(),
        ]);
        $fases = [];
        $numero = 1;
        foreach ((array) ($datos['procedimientosPlan'] ?? []) as $orden => $item) {
            if (! is_array($item)) {
                continue;
            }
            $nombre = (string) ($item['fase'] ?? 'Otra');
            if (! isset($fases[$nombre])) {
                $fases[$nombre] = DB::table('fase_tratamiento')->insertGetId([
                    'id_plan_tratamiento' => $idPlan,
                    'numero_fase' => $numero,
                    'nombre' => mb_substr($nombre, 0, 120),
                    'orden' => $numero,
                    'estado' => 'PENDIENTE',
                ]);
                $numero++;
            }
            $codigoPieza = Valores::texto($item['pieza'] ?? null);
            DB::table('plan_tratamiento_item')->insert([
                'id_fase_tratamiento' => $fases[$nombre],
                'id_tratamiento_dental' => $this->tratamientoPorNombre($item['procedimiento'] ?? null),
                'id_pieza_dental' => $codigoPieza ? DB::table('pieza_dental')->where('codigo_fdi', $codigoPieza)->value('id_pieza_dental') : null,
                'pieza_region' => $codigoPieza,
                'descripcion_procedimiento' => Valores::texto($item['procedimiento'] ?? null),
                'prioridad' => Valores::texto($item['prioridad'] ?? null),
                'estado' => Valores::texto($item['estado'] ?? null) ?? 'Pendiente',
                'observaciones' => Valores::texto($item['observaciones'] ?? null),
                'orden' => $orden,
                'creado_en' => now(),
            ]);
        }
    }

    private function leerPlan(int $id): array
    {
        $plan = DB::table('plan_tratamiento')->where('id_historia_clinica', $id)->orderByDesc('id_plan_tratamiento')->first();
        if ($plan === null) {
            return [];
        }
        $items = DB::table('plan_tratamiento_item as i')
            ->join('fase_tratamiento as f', 'f.id_fase_tratamiento', '=', 'i.id_fase_tratamiento')
            ->where('f.id_plan_tratamiento', $plan->id_plan_tratamiento)
            ->orderBy('i.orden')
            ->get(['f.nombre as fase', 'i.pieza_region', 'i.descripcion_procedimiento', 'i.prioridad', 'i.estado', 'i.observaciones']);

        return array_filter([
            'planIntegral' => $plan->descripcion ?? '',
            'procedimientosPlan' => $items->map(fn ($item) => [
                'fase' => $item->fase,
                'pieza' => $item->pieza_region ?? '',
                'procedimiento' => $item->descripcion_procedimiento ?? '',
                'prioridad' => $item->prioridad ?? 'Media',
                'estado' => $item->estado,
                'observaciones' => $item->observaciones ?? '',
            ])->all(),
        ], fn ($valor) => $valor !== '' && $valor !== []);
    }

    private function guardarConsentimiento(int $id, array $datos): void
    {
        $fecha = $this->fecha($datos['fecha'] ?? null) ?? now()->toDateString();
        $existente = DB::table('consentimiento_informado')->where('id_historia_clinica', $id)->orderByDesc('version_documento')->first();
        $fila = [
            'fecha_consentimiento' => $fecha,
            'intervencion_autorizada' => Valores::texto(is_scalar($datos['intervencionAutorizada'] ?? null) ? $datos['intervencionAutorizada'] : null),
            'domicilio_acto' => $this->corto($datos['domicilio'] ?? null, 250),
            'doctor_informante' => $this->corto($datos['doctor'] ?? null, 180),
            'firma_dia' => $this->corto($datos['firmaDia'] ?? null, 2),
            'firma_mes' => $this->corto($datos['firmaMes'] ?? null, 20),
            'firma_anio' => $this->corto($datos['firmaAnio'] ?? null, 4),
            'estado' => 'BORRADOR',
        ];
        if ($existente) {
            DB::table('consentimiento_informado')->where('id_consentimiento', $existente->id_consentimiento)->update($fila);
            $idConsentimiento = (int) $existente->id_consentimiento;
            DB::table('consentimiento_clausula')->where('id_consentimiento', $idConsentimiento)->delete();
        } else {
            $idConsentimiento = (int) DB::table('consentimiento_informado')->insertGetId($fila + [
                'id_historia_clinica' => $id,
                'version_documento' => 1,
                'creado_en' => now(),
            ]);
        }
        $textos = is_array($datos['textosClausulas'] ?? null) ? $datos['textosClausulas'] : [];
        foreach ($datos as $clave => $valor) {
            if (preg_match('/^consent(\d{1,3})$/', (string) $clave, $coincidencia)) {
                $numero = (int) $coincidencia[1];
                $texto = $textos[$numero] ?? $textos[(string) $numero] ?? null;
                DB::table('consentimiento_clausula')->insert([
                    'id_consentimiento' => $idConsentimiento,
                    'numero' => $numero,
                    'texto' => $this->corto($texto, 5000) ?? 'Cláusula '.$numero,
                    'aceptada' => $valor ? 1 : 0,
                ]);
            }
        }

        $this->guardarFirmanteAcompanante($idConsentimiento, $datos);
        $this->vincularFirmasConsentimiento($id, $idConsentimiento, $datos);
        $this->guardarProgramacion($id, $datos);
    }

    private function vincularFirmasConsentimiento(int $idHistoria, int $idConsentimiento, array $datos): void
    {
        $paciente = DB::table('historia_clinica as h')
            ->join('paciente as p', 'p.id_paciente', '=', 'h.id_paciente')
            ->where('h.id_historia_clinica', $idHistoria)
            ->first(['p.nombres', 'p.apellidos', 'p.numero_documento']);
        $nombrePaciente = trim(($paciente->nombres ?? '').' '.($paciente->apellidos ?? ''));
        $firmantes = [
            'PACIENTE' => ['firmaPaciente', $nombrePaciente, $paciente->numero_documento ?? null],
            'HUELLA_PACIENTE' => ['huellaDactilar', $nombrePaciente, $paciente->numero_documento ?? null],
            'DOCENTE' => ['firmaDocente', $this->corto($datos['doctor'] ?? null, 180) ?? '', null],
        ];
        foreach ($firmantes as $tipo => [$campo, $nombre, $documento]) {
            $idArchivo = $this->archivos->vigente($idHistoria, $campo);
            $consulta = DB::table('firma_consentimiento')->where('id_consentimiento', $idConsentimiento)->where('tipo_firmante', $tipo);
            if ($idArchivo === null) {
                $consulta->delete();

                continue;
            }
            $fila = ['nombre_firmante' => mb_substr($nombre, 0, 180), 'documento_firmante' => $documento, 'id_archivo' => $idArchivo];
            $existente = (clone $consulta)->first(['id_firma_consentimiento', 'id_archivo']);
            if ($existente) {
                $cambios = (int) $existente->id_archivo === $idArchivo ? $fila : $fila + ['fecha_firma' => now()];
                DB::table('firma_consentimiento')->where('id_firma_consentimiento', $existente->id_firma_consentimiento)->update($cambios);
            } else {
                DB::table('firma_consentimiento')->insert($fila + [
                    'id_consentimiento' => $idConsentimiento,
                    'tipo_firmante' => $tipo,
                    'fecha_firma' => now(),
                ]);
            }
        }

        $idAcompanante = $this->archivos->vigente($idHistoria, 'firmaAcompanante');
        $acompanante = DB::table('firma_consentimiento')->where('id_consentimiento', $idConsentimiento)->where('tipo_firmante', 'ACOMPANANTE');
        if ((clone $acompanante)->exists()) {
            $acompanante->update(['id_archivo' => $idAcompanante, 'fecha_firma' => $idAcompanante ? now() : null]);
        } elseif ($idAcompanante !== null) {
            DB::table('firma_consentimiento')->insert([
                'id_consentimiento' => $idConsentimiento,
                'tipo_firmante' => 'ACOMPANANTE',
                'nombre_firmante' => '',
                'id_archivo' => $idAcompanante,
                'fecha_firma' => now(),
            ]);
        }
    }

    private function guardarFirmanteAcompanante(int $idConsentimiento, array $datos): void
    {
        $fila = [
            'nombre_firmante' => $this->corto($datos['acompananteNombres'] ?? null, 180),
            'direccion_firmante' => $this->corto($datos['acompananteDireccion'] ?? null, 250),
            'parentesco_firmante' => $this->corto($datos['acompananteParentesco'] ?? null, 80),
            'documento_firmante' => $this->corto($datos['acompananteDni'] ?? null, 20),
        ];
        $existente = DB::table('firma_consentimiento')
            ->where('id_consentimiento', $idConsentimiento)
            ->where('tipo_firmante', 'ACOMPANANTE')
            ->value('id_firma_consentimiento');
        $vacio = array_filter($fila) === [];
        if ($existente) {
            DB::table('firma_consentimiento')->where('id_firma_consentimiento', $existente)->update(['nombre_firmante' => $fila['nombre_firmante'] ?? ''] + $fila);
        } elseif (! $vacio) {
            DB::table('firma_consentimiento')->insert(['nombre_firmante' => $fila['nombre_firmante'] ?? ''] + $fila + [
                'id_consentimiento' => $idConsentimiento,
                'tipo_firmante' => 'ACOMPANANTE',
            ]);
        }
    }

    private function guardarProgramacion(int $idHistoria, array $datos): void
    {
        $fecha = $this->fecha($datos['programacionFecha'] ?? null);
        $plan = DB::table('plan_quirurgico')->where('id_historia_clinica', $idHistoria)->orderByDesc('id_plan_quirurgico')->value('id_plan_quirurgico');
        if ($fecha === null) {
            if ($plan) {
                DB::table('programacion_cirugia')->where('id_plan_quirurgico', $plan)->where('estado', 'PROGRAMADA')->delete();
            }

            return;
        }
        $idPlan = $plan ? (int) $plan : $this->planQuirurgico($idHistoria, 'Cirugía programada');
        $fila = [
            'fecha' => $fecha,
            'hora' => $this->hora($datos['programacionHora'] ?? null),
            'observaciones' => Valores::texto(is_scalar($datos['programacionObservaciones'] ?? null) ? $datos['programacionObservaciones'] : null),
        ];
        $existente = DB::table('programacion_cirugia')->where('id_plan_quirurgico', $idPlan)->where('estado', 'PROGRAMADA')->orderByDesc('id_programacion_cirugia')->value('id_programacion_cirugia');
        if ($existente) {
            DB::table('programacion_cirugia')->where('id_programacion_cirugia', $existente)->update($fila);
        } else {
            DB::table('programacion_cirugia')->insert($fila + ['id_plan_quirurgico' => $idPlan, 'estado' => 'PROGRAMADA', 'creado_en' => now()]);
        }
    }

    private function leerConsentimiento(int $id): array
    {
        $fila = DB::table('consentimiento_informado')->where('id_historia_clinica', $id)->orderByDesc('version_documento')->first();
        if ($fila === null) {
            return [];
        }
        $datos = [
            'fecha' => $fila->fecha_consentimiento,
            'intervencionAutorizada' => $fila->intervencion_autorizada ?? '',
            'domicilio' => $fila->domicilio_acto ?? '',
            'doctor' => $fila->doctor_informante ?? '',
            'firmaDia' => $fila->firma_dia ?? '',
            'firmaMes' => $fila->firma_mes ?? '',
            'firmaAnio' => $fila->firma_anio ?? '',
        ];
        foreach (DB::table('consentimiento_clausula')->where('id_consentimiento', $fila->id_consentimiento)->orderBy('numero')->get() as $clausula) {
            $datos['consent'.$clausula->numero] = (bool) $clausula->aceptada;
        }
        $acompanante = DB::table('firma_consentimiento')
            ->where('id_consentimiento', $fila->id_consentimiento)
            ->where('tipo_firmante', 'ACOMPANANTE')
            ->first();
        $datos += [
            'acompananteNombres' => $acompanante->nombre_firmante ?? '',
            'acompananteDireccion' => $acompanante->direccion_firmante ?? '',
            'acompananteParentesco' => $acompanante->parentesco_firmante ?? '',
            'acompananteDni' => $acompanante->documento_firmante ?? '',
        ];
        $plan = DB::table('plan_quirurgico')->where('id_historia_clinica', $id)->orderByDesc('id_plan_quirurgico')->value('id_plan_quirurgico');
        $programacion = $plan ? DB::table('programacion_cirugia')->where('id_plan_quirurgico', $plan)->where('estado', 'PROGRAMADA')->orderByDesc('id_programacion_cirugia')->first() : null;
        $datos += [
            'programacionFecha' => $programacion->fecha ?? '',
            'programacionHora' => $programacion && $programacion->hora ? substr((string) $programacion->hora, 0, 5) : '',
            'programacionObservaciones' => $programacion->observaciones ?? '',
        ];

        return array_filter($datos, fn ($valor) => $valor !== '' && $valor !== null);
    }

    private function fecha(mixed $valor): ?string
    {
        $texto = Valores::texto(is_scalar($valor) ? $valor : null);
        if ($texto === null || ! preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $texto, $partes)) {
            return null;
        }

        return checkdate((int) $partes[2], (int) $partes[3], (int) $partes[1]) ? "{$partes[1]}-{$partes[2]}-{$partes[3]}" : null;
    }

    private function hora(mixed $valor): ?string
    {
        $texto = Valores::texto(is_scalar($valor) ? $valor : null);
        if ($texto === null || ! preg_match('/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/', $texto, $partes)) {
            return null;
        }

        return "{$partes[1]}:{$partes[2]}:".($partes[3] ?? '00');
    }

    private function guardarCirugia(int $id, array $datos): void
    {
        $idPlan = $this->planQuirurgico($id, Valores::texto($datos['procedimiento'] ?? null) ?? 'Plan quirúrgico');
        DB::table('etapa_quirurgica')->where('id_plan_quirurgico', $idPlan)->delete();
        $orden = 1;
        foreach (['PREOPERATORIO' => 'preoperatorio', 'INTRAOPERATORIO' => 'intraoperatorio', 'POSTOPERATORIO' => 'postoperatorio'] as $etapa => $clave) {
            $texto = Valores::texto($datos[$clave] ?? null);
            if ($texto) {
                DB::table('etapa_quirurgica')->insert([
                    'id_plan_quirurgico' => $idPlan,
                    'etapa' => $etapa,
                    'descripcion' => $texto,
                    'orden' => $orden,
                ]);
                $orden++;
            }
        }
    }

    private function leerCirugia(int $id): array
    {
        $plan = DB::table('plan_quirurgico')->where('id_historia_clinica', $id)->orderByDesc('id_plan_quirurgico')->first();
        if ($plan === null) {
            return [];
        }
        $datos = [];
        foreach (DB::table('etapa_quirurgica')->where('id_plan_quirurgico', $plan->id_plan_quirurgico)->get() as $etapa) {
            $clave = match ($etapa->etapa) {
                'PREOPERATORIO' => 'preoperatorio',
                'INTRAOPERATORIO' => 'intraoperatorio',
                'POSTOPERATORIO' => 'postoperatorio',
                default => null,
            };
            if ($clave) {
                $datos[$clave] = $etapa->descripcion;
            }
        }

        return $datos;
    }

    private function guardarReporte(int $id, array $datos): void
    {
        $idPlan = $this->planQuirurgico($id, Valores::texto($datos['tipoTratamiento'] ?? null) ?? 'Reporte operatorio');
        $fila = [
            'fecha' => $this->fecha($datos['fecha'] ?? null) ?? now()->toDateString(),
            'asistente' => $this->corto($datos['asistente'] ?? null, 180),
            'lugar' => $this->corto($datos['lugar'] ?? null, 150),
            'caso_clinico' => $this->corto($datos['casoClinico'] ?? null, 180),
            'tipo_anestesia' => $this->corto($datos['tipoAnestesia'] ?? null, 100),
            'tecnica_anestesia' => $this->corto($datos['tecnicaAnestesia'] ?? null, 150),
            'procedimiento_realizado' => Valores::texto($datos['tipoTratamiento'] ?? null),
            'pronostico' => Valores::texto(is_scalar($datos['pronostico'] ?? null) ? $datos['pronostico'] : null),
            'hora_inicio' => $this->hora($datos['horaInicio'] ?? null),
            'hora_termino' => $this->hora($datos['horaTermino'] ?? null),
            'id_archivo_firma_docente' => $this->archivos->vigente($id, 'firmaDocenteReporte'),
            'id_archivo_firma_alumno' => $this->archivos->vigente($id, 'firmaAlumnoReporte'),
            'estado' => 'BORRADOR',
        ];
        $idReporte = DB::table('reporte_operatorio')->where('id_plan_quirurgico', $idPlan)->value('id_reporte_operatorio');
        if ($idReporte) {
            DB::table('reporte_operatorio')->where('id_reporte_operatorio', $idReporte)->update($fila);
        } else {
            $idReporte = DB::table('reporte_operatorio')->insertGetId($fila + ['id_plan_quirurgico' => $idPlan, 'creado_en' => now()]);
        }
        DB::table('signo_vital_operatorio')->where('id_reporte_operatorio', $idReporte)->delete();
        foreach (['pre' => 'PRE', 'intra' => 'INTRA', 'post' => 'POST'] as $momento => $codigo) {
            DB::table('signo_vital_operatorio')->insert([
                'id_reporte_operatorio' => $idReporte,
                'momento' => $codigo,
                'presion_arterial' => Valores::texto($datos[$momento.'_pa'] ?? null),
                'temperatura' => Valores::decimal($datos[$momento.'_temp'] ?? null),
                'frecuencia_respiratoria' => Valores::decimal($datos[$momento.'_fr'] ?? null),
                'frecuencia_cardiaca' => Valores::decimal($datos[$momento.'_fc'] ?? null),
                'pulso' => Valores::decimal($datos[$momento.'_pulso'] ?? null),
                'creado_en' => now(),
            ]);
        }
        DB::table('prescripcion')->where('id_reporte_operatorio', $idReporte)->delete();
        if (Valores::texto($datos['prescripcionPost'] ?? null)) {
            DB::table('prescripcion')->insert([
                'id_reporte_operatorio' => $idReporte,
                'resumen' => Valores::texto($datos['prescripcionPost'] ?? null),
                'creado_en' => now(),
            ]);
        }
        DB::table('alta_clinica')->where('id_reporte_operatorio', $idReporte)->delete();
        if (Valores::texto($datos['alta'] ?? null)) {
            DB::table('alta_clinica')->insert([
                'id_reporte_operatorio' => $idReporte,
                'indicaciones' => Valores::texto($datos['alta'] ?? null),
                'creado_en' => now(),
            ]);
        }
        DB::table('epicrisis')->where('id_reporte_operatorio', $idReporte)->delete();
        $epicrisis = Valores::texto($datos['epicrisis'] ?? null);
        $diagnostico = Valores::texto(is_scalar($datos['diagnosticoDefinitivo'] ?? null) ? $datos['diagnosticoDefinitivo'] : null);
        if ($epicrisis || $diagnostico) {
            DB::table('epicrisis')->insert([
                'id_reporte_operatorio' => $idReporte,
                'resumen_clinico' => $epicrisis,
                'diagnostico' => $diagnostico,
                'creado_en' => now(),
            ]);
        }
    }

    private function leerReporte(int $id): array
    {
        $plan = DB::table('plan_quirurgico')->where('id_historia_clinica', $id)->orderByDesc('id_plan_quirurgico')->first();
        if ($plan === null) {
            return [];
        }
        $reporte = DB::table('reporte_operatorio')->where('id_plan_quirurgico', $plan->id_plan_quirurgico)->first();
        if ($reporte === null) {
            return [];
        }
        $datos = [
            'fecha' => $reporte->fecha ?? '',
            'pronostico' => $reporte->pronostico ?? '',
            'asistente' => $reporte->asistente ?? '',
            'lugar' => $reporte->lugar ?? '',
            'casoClinico' => $reporte->caso_clinico ?? '',
            'tipoAnestesia' => $reporte->tipo_anestesia ?? '',
            'tecnicaAnestesia' => $reporte->tecnica_anestesia ?? '',
            'tipoTratamiento' => $reporte->procedimiento_realizado ?? '',
            'horaInicio' => $reporte->hora_inicio ? substr((string) $reporte->hora_inicio, 0, 5) : '',
            'horaTermino' => $reporte->hora_termino ? substr((string) $reporte->hora_termino, 0, 5) : '',
        ];
        $momentos = ['PRE' => 'pre', 'INTRA' => 'intra', 'POST' => 'post'];
        foreach (DB::table('signo_vital_operatorio')->where('id_reporte_operatorio', $reporte->id_reporte_operatorio)->get() as $signo) {
            $prefijo = $momentos[$signo->momento] ?? null;
            if ($prefijo === null) {
                continue;
            }
            $datos[$prefijo.'_pa'] = $signo->presion_arterial ?? '';
            $datos[$prefijo.'_temp'] = $signo->temperatura ?? '';
            $datos[$prefijo.'_fr'] = $signo->frecuencia_respiratoria ?? '';
            $datos[$prefijo.'_fc'] = $signo->frecuencia_cardiaca ?? '';
            $datos[$prefijo.'_pulso'] = $signo->pulso ?? '';
        }
        $datos['prescripcionPost'] = DB::table('prescripcion')->where('id_reporte_operatorio', $reporte->id_reporte_operatorio)->value('resumen') ?? '';
        $datos['alta'] = DB::table('alta_clinica')->where('id_reporte_operatorio', $reporte->id_reporte_operatorio)->value('indicaciones') ?? '';
        $epicrisis = DB::table('epicrisis')->where('id_reporte_operatorio', $reporte->id_reporte_operatorio)->first();
        $datos['epicrisis'] = $epicrisis->resumen_clinico ?? '';
        $datos['diagnosticoDefinitivo'] = $epicrisis->diagnostico ?? '';

        return array_filter($datos, fn ($valor) => $valor !== '' && $valor !== null);
    }

    private function guardarSeguimiento(int $id, array $datos): void
    {
        $this->upsertUno('evolucion_clinica', 'id_evolucion_clinica', $id, [
            'fecha_referencia' => $this->fecha($datos['fecha'] ?? null),
            'evolucion' => Valores::texto(is_scalar($datos['evolucion'] ?? null) ? $datos['evolucion'] : null),
        ]);
        $filas = array_values(array_filter((array) ($datos['procedimientos'] ?? []), 'is_array'));
        $plan = DB::table('plan_quirurgico')->where('id_historia_clinica', $id)->orderByDesc('id_plan_quirurgico')->value('id_plan_quirurgico');
        if ($filas === [] && ! $plan) {
            return;
        }
        $idPlan = $plan ? (int) $plan : $this->planQuirurgico($id, 'Seguimiento clínico');
        $idReporte = DB::table('reporte_operatorio')->where('id_plan_quirurgico', $idPlan)->value('id_reporte_operatorio');
        if (! $idReporte && $filas === []) {
            return;
        }
        if (! $idReporte) {
            $idReporte = DB::table('reporte_operatorio')->insertGetId([
                'id_plan_quirurgico' => $idPlan,
                'fecha' => now()->toDateString(),
                'procedimiento_realizado' => 'Seguimiento clínico',
                'estado' => 'BORRADOR',
                'creado_en' => now(),
            ]);
        }
        $anteriores = DB::table('seguimiento_quirurgico')->where('id_reporte_operatorio', $idReporte)->pluck('id_seguimiento_quirurgico');
        if ($anteriores->isNotEmpty()) {
            DB::table('firma_seguimiento')->whereIn('id_seguimiento_quirurgico', $anteriores)->delete();
            DB::table('seguimiento_quirurgico')->whereIn('id_seguimiento_quirurgico', $anteriores)->delete();
        }
        foreach (array_slice($filas, 0, 200) as $indice => $fila) {
            $idSeguimiento = DB::table('seguimiento_quirurgico')->insertGetId([
                'id_reporte_operatorio' => $idReporte,
                'numero_control' => $indice + 1,
                'fecha' => $this->fecha($fila['fecha'] ?? null) ?? now()->toDateString(),
                'procedimiento' => $this->corto($fila['procedimiento'] ?? null, 255),
                'evolucion' => Valores::texto(is_scalar($fila['evolucion'] ?? null) ? $fila['evolucion'] : null),
                'creado_en' => now(),
            ]);
            foreach (['OPERADOR' => 'firmaOperador', 'SUPERVISOR' => 'firmaSupervisor'] as $tipo => $clave) {
                $nombre = $this->corto($fila[$clave] ?? null, 180);
                if ($nombre !== null) {
                    DB::table('firma_seguimiento')->insert([
                        'id_seguimiento_quirurgico' => $idSeguimiento,
                        'tipo_firmante' => $tipo,
                        'nombre_firmante' => $nombre,
                        'fecha_firma' => now(),
                    ]);
                }
            }
        }
    }

    private function leerSeguimiento(int $id): array
    {
        $evolucion = DB::table('evolucion_clinica')->where('id_historia_clinica', $id)->first();
        $plan = DB::table('plan_quirurgico')->where('id_historia_clinica', $id)->orderByDesc('id_plan_quirurgico')->first();
        $procedimientos = [];
        if ($plan) {
            $idReporte = DB::table('reporte_operatorio')->where('id_plan_quirurgico', $plan->id_plan_quirurgico)->value('id_reporte_operatorio');
            if ($idReporte) {
                $controles = DB::table('seguimiento_quirurgico')->where('id_reporte_operatorio', $idReporte)->orderBy('numero_control')->get();
                $firmas = DB::table('firma_seguimiento')
                    ->whereIn('id_seguimiento_quirurgico', $controles->pluck('id_seguimiento_quirurgico'))
                    ->get()
                    ->groupBy('id_seguimiento_quirurgico');
                $procedimientos = $controles->map(function ($fila) use ($firmas) {
                    $propias = $firmas->get($fila->id_seguimiento_quirurgico, collect());

                    return [
                        'fecha' => $fila->fecha,
                        'procedimiento' => $fila->procedimiento ?? '',
                        'evolucion' => $fila->evolucion ?? '',
                        'firmaOperador' => $propias->firstWhere('tipo_firmante', 'OPERADOR')->nombre_firmante ?? '',
                        'firmaSupervisor' => $propias->firstWhere('tipo_firmante', 'SUPERVISOR')->nombre_firmante ?? '',
                    ];
                })->all();
            }
        }

        return array_filter([
            'fecha' => $evolucion->fecha_referencia ?? '',
            'evolucion' => $evolucion->evolucion ?? '',
            'procedimientos' => $procedimientos,
        ], fn ($valor) => $valor !== '' && $valor !== []);
    }

    private function planQuirurgico(int $idHistoria, string $procedimiento): int
    {
        $id = DB::table('plan_quirurgico')->where('id_historia_clinica', $idHistoria)->orderByDesc('id_plan_quirurgico')->value('id_plan_quirurgico');
        if ($id) {
            return (int) $id;
        }

        return (int) DB::table('plan_quirurgico')->insertGetId([
            'id_historia_clinica' => $idHistoria,
            'procedimiento' => mb_substr($procedimiento, 0, 255),
            'estado' => 'BORRADOR',
            'creado_en' => now(),
        ]);
    }

    private function upsertUno(string $tabla, string $pk, int $idHistoria, array $datos): void
    {
        $id = DB::table($tabla)->where('id_historia_clinica', $idHistoria)->value($pk);
        if ($id) {
            DB::table($tabla)->where($pk, $id)->update($datos);
        } else {
            DB::table($tabla)->insert($datos + ['id_historia_clinica' => $idHistoria, 'creado_en' => now()]);
        }
    }

    private function filaACamello(string $tabla, int $id, array $mapa): array
    {
        $fila = DB::table($tabla)->where('id_historia_clinica', $id)->first();
        if ($fila === null) {
            return [];
        }
        $datos = [];
        foreach ($mapa as $columna => $clave) {
            if ($fila->{$columna} !== null && $fila->{$columna} !== '') {
                $datos[$clave] = $fila->{$columna};
            }
        }
        foreach (['peso', 'talla', 'temperatura', 'frecuencia_respiratoria', 'pulso', 'frecuencia_cardiaca'] as $columna) {
            if ($fila->{$columna} !== null) {
                $clave = lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $columna))));
                $datos[$clave] = $fila->{$columna};
            }
        }

        return $datos;
    }

    private function entero(mixed $valor): ?int
    {
        return is_numeric($valor) ? (int) $valor : null;
    }

    private function tratamientoPorNombre(mixed $nombre): ?int
    {
        $texto = Valores::texto($nombre);
        if ($texto === null) {
            return null;
        }
        $id = DB::table('catalogo_tratamiento_dental')->where('nombre', $texto)->value('id_tratamiento_dental');

        return $id ? (int) $id : DB::table('catalogo_tratamiento_dental')->where('codigo', 'OTRO')->value('id_tratamiento_dental');
    }
}
