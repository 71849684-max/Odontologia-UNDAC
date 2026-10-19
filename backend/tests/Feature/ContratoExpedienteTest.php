<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\CreaUsuarios;
use Tests\TestCase;

/**
 * El frontend es la fuente de verdad: cada clave que un formulario escribe en formData
 * debe volver con la misma clave y valor al recargar el expediente.
 */
class ContratoExpedienteTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    /** Los proveedores se evalúan antes de iniciar la aplicación; la fecha real se sustituye en la prueba. */
    private const HOY = '__HOY__';

    public static function secciones(): array
    {
        $hoy = self::HOY;

        return [
            'datos-paciente' => ['datos-paciente', [
                'dni' => '70000099',
                // fechaPaciente la fija el servidor con creado_en de la historia; no es ida y vuelta del cliente.
                'sexo' => 'F',
                'apellidos' => 'Salazar Huamán',
                'nombres' => 'Andrea Lucía',
                'fechaNacimiento' => '2001-03-12',
                'lugarNacimiento' => 'Hospital Daniel A. Carrión',
                'celular' => '987654321',
                'correo' => 'andrea@example.com',
                'gradoInstruccion' => 'Superior universitaria',
                'estadoCivil' => 'Soltero',
                'ocupacion' => 'Estudiante',
                'centroEstudios' => 'UNDAC',
                'idioma' => 'Quechua',
                'religion' => 'Católica',
                'lugarTrabajo' => 'Mercado central',
                'domicilioRegistro2' => 'Jr. Lima 123',
                'telefonoRegistro2' => '963852741',
                'departamento' => 'Pasco',
                'provincia' => 'Pasco',
                'distrito' => 'Yanacancha',
                'domicilio' => 'Av. Los Próceres 456',
                'tiempoResidencia' => '10 años',
                'procedencia' => 'Huánuco',
                'modalidadAsistencia' => 'acompanado',
                'informante' => 'Rosa Huamán',
                'acompanante' => 'Pedro Salazar',
                'tutorParentesco' => 'Padre',
                'acompananteDni' => '40000001',
                'tutorCelular' => '912345678',
                'confiabilidad' => 'Confiable',
                'informanteDireccion' => 'Av. Los Próceres 456',
                'padre' => 'Pedro Salazar',
                'padreDni' => '40000001',
                'padreCelular' => '912345678',
                'padreOcupacion' => 'Comerciante',
                'madre' => 'Rosa Huamán',
                'madreDni' => '40000002',
                'madreCelular' => '923456789',
                'madreOcupacion' => 'Docente',
            ]],
            'anamnesis' => ['anamnesis', [
                'motivoConsulta' => 'Dolor dental',
                'tipoAtencion' => 'Urgencia',
                'historiaEnfermedad' => 'Inicio hace tres días',
                'estadoGeneral' => 'Bueno',
                'ectoscopia' => 'Paciente lúcido',
                'estadoPsicologico' => ['Tranquilo', 'Colaborador'],
                'observacionesPsicologicas' => 'Sin observaciones',
            ]],
            'cuestionario-salud' => ['cuestionario-salud', [
                'q1Answer' => 'Sí', 'q1Detail' => 'Control anual', 'q1Extra' => 'Chequeo',
                'q2Answer' => 'No',
                'q20Answer' => 'Sí', 'q20Detail' => 'Tipo 2',
                'q21Answer' => 'Sí',
            ]],
            'antecedentes' => ['antecedentes', [
                'hijosNumero' => '2', 'hijosVivos' => '2', 'hijosFallecidos' => '0', 'ningunHijo' => 'No',
                'vivienda' => 'Otros', 'viviendaOtros' => 'Cedida', 'materialVivienda' => 'Otros', 'materialOtros' => 'Adobe',
                'viajes' => 'Otros', 'viajesOtros' => 'Selva', 'alimentacion' => 'Otros', 'alimentacionOtros' => 'Vegetariana',
                'habitosNocivos' => ['Tabaco'], 'habitosDetalle' => 'Dos cigarrillos al día',
                'inmunizaciones' => 'Sí', 'socioeconomica' => 'Media',
                'prenatal' => 'Normal', 'prenatalDetalle' => 'Sin complicaciones', 'natal' => 'Normal', 'natalDetalle' => 'Parto eutócico',
                'lactancia' => 'Otros', 'lactanciaOtros' => 'Mixta', 'menarquia' => '12', 'menstruacionCaracteristicas' => 'Regular',
                'menstruacionFinal' => '-', 'gestacion' => 'No', 'gestacionTiempo' => '-',
                'alergiaMedicamento' => 'Sí', 'alergiaMedicamentoDetalle' => 'Penicilina',
                'medicacionAnteriorNombre' => 'Ibuprofeno', 'medicacionAnteriorDosis' => '400 mg',
                'medicacionActual' => 'Sí', 'medicacionActualNombre' => 'Metformina', 'medicacionActualDosis' => '850 mg',
                'medicacionActualMotivo' => 'Diabetes',
                'cirugiaAnestesiaTotal' => 'Sí', 'tipoIntervencion' => 'Apendicectomía', 'reaccionAnestesia' => 'Con complicaciones',
                'reaccionAnestesiaDetalle' => 'Náuseas', 'hemorragiaIntervencion' => 'No', 'hemorragiaDias' => '0',
                'cicatrizacion' => 'Otros', 'cicatrizacionOtros' => 'Lenta',
                'exodoncias' => 'Sí', 'problemasAnestesicoOdontologico' => 'No', 'hemorragiasPostExodoncia' => 'Sí',
                'hemorragiasPostExodonciaDias' => '2', 'exodonciaRealizadaPor' => 'Odontólogo',
                'padreEstado' => 'Otros', 'padreEstadoOtros' => 'Hipertenso', 'madreEstado' => 'Otros', 'madreEstadoOtros' => 'Sana',
                'hermanosNumero' => '3', 'hermanosVivos' => '3', 'hermanosFallecidos' => '0', 'hermanosOtros' => 'Sanos',
            ]],
            'examen-clinico' => ['examen-clinico', [
                'tipoPsicologico' => 'Colaborador', 'marcha' => 'Normal', 'fatiga' => 'No', 'raza' => 'Otros', 'razaOtros' => 'Andina',
                'peso' => '65.50', 'talla' => '1.62', 'temperatura' => '36.50', 'presionArterial' => '120/80',
                'frecuenciaRespiratoria' => '18.00', 'pulso' => '72.00', 'frecuenciaCardiaca' => '72.00',
                'formaCraneo' => 'Mesocéfalo', 'cabelloImplantacion' => 'Normal', 'cabelloColor' => 'Negro',
                'ojosEstado' => 'Patológico', 'ojosPatologia' => 'Miopía', 'ojosColor' => 'Marrón', 'ojosForma' => 'Almendrados',
                'oidosEstado' => 'Normal', 'oidosPatologia' => '-', 'audicion' => 'Normal', 'narizEstado' => 'Normal', 'narizForma' => 'Recta',
                'labiosEstado' => 'Normal', 'labiosPatologia' => '-', 'labiosForma' => 'Delgados', 'fasciesEstado' => 'Patológico',
                'fasciesColor' => 'Pálida', 'cuelloForma' => 'Cilíndrico', 'cuelloPatologia' => '-', 'cadenaLinfatica' => 'Normal',
                'cadenaLinfaticaPatologia' => '-', 'atm' => 'Otros', 'atmOtros' => 'Chasquido', 'tiroides' => 'Normal',
                'tiroidesPatologia' => '-', 'miembrosSuperiores' => 'Normal', 'miembrosSuperioresDetalle' => '-',
                'miembrosInferiores' => 'Normal', 'miembrosInferioresDetalle' => '-', 'torax' => 'Normal', 'toraxPatologia' => '-',
            ]],
            'examen-extraoral' => ['examen-extraoral', [
                'tipoFacial' => 'Mesocéfalo', 'simetriaFacial' => 'Simétrica', 'perfil' => 'Recto', 'competenciaLabial' => 'Competencia labial',
                'tonicidad' => 'Normotónico', 'anguloNasolabial' => 'Normal', 'fonacion' => 'Otros', 'fonacionOtros' => 'Ceceo',
                'ultimaVisitaDentista' => 'Hace un año', 'motivoVisitaDentista' => 'Limpieza',
            ]],
            'examen-intraoral' => ['examen-intraoral', [
                'tissue0Status' => 'Normal', 'tissue3Status' => 'Alterada', 'tissue3Detail' => 'Lengua saburral',
            ]],
            'oclusion' => ['oclusion', [
                'oclusionPosterior' => 'Clase I', 'oclusionAnterior' => 'Clase II',
                'ultimaExodoncia' => 'Hace dos años por caries',
                'motivosPerdida' => ['Caries', 'Otros'], 'motivosPerdidaOtros' => 'Enfermedad periodontal',
                'protesisTipos' => ['Parcial', 'Otros'], 'protesisOtros' => 'Placa miorrelajante', 'protesisProfesional' => 'Odontólogo',
                'diagnosticoPresuntivoOclusion' => 'Maloclusión clase II',
            ]],
            'examenes-auxiliares' => ['examenes-auxiliares', [
                'hemoglobina' => '13.5 g/dL', 'hematocrito' => '40 %', 'tiempoCoagulacion' => '8 min', 'tiempoSangria' => '2 min',
                'grupoSanguineo' => 'O', 'factorRh' => '+', 'glucosa' => '95 mg/dL', 'otros' => 'Sin otros',
                'diagnosticoLaboratorio' => 'Valores normales', 'rxPanoramico' => 'Sin lesiones', 'rxOclusales' => 'Normal',
                'rxPeriapicales' => 'Lesión en 36',
            ]],
            'diagnostico' => ['diagnostico', [
                'diagnosticos' => [[
                    'codigo' => 'K02.1', 'tipo' => 'Definitivo', 'piezaRegion' => '36', 'severidad' => 'Moderada',
                    'evidencia' => 'Caries de dentina', 'observaciones' => 'Requiere endodoncia',
                ]],
                'pronosticoEstructurado' => 'Favorable',
                'pronosticoJustificacion' => 'Buena higiene',
                'dxClinicoRadiografico' => 'Caries profunda', 'dxPresuntivo' => 'Pulpitis', 'dxDefinitivo' => 'Pulpitis irreversible',
                'pronostico' => 'Pronóstico favorable si el paciente mantiene controles periódicos y buena higiene oral.',
            ]],
            'modelos' => ['modelos', [
                'informeMaxilar' => 'Arco ovoide', 'informeMandibula' => 'Arco en U', 'planificacionModelos' => 'Encerado diagnóstico',
            ]],
            'plan-tratamiento' => ['plan-tratamiento', [
                'planIntegral' => 'Rehabilitación integral',
                'procedimientosPlan' => [[
                    'fase' => 'Fase sistémica', 'pieza' => '36', 'procedimiento' => 'Endodoncia', 'prioridad' => 'Alta',
                    'estado' => 'Pendiente', 'observaciones' => 'Prioritario',
                ]],
            ]],
            'consentimiento' => ['consentimiento', [
                'domicilio' => 'Av. Los Próceres 456', 'fecha' => $hoy, 'doctor' => 'Dra. Ríos',
                'consent1' => true, 'consent2' => false, 'consent3' => true,
                'intervencionAutorizada' => 'Exodoncia de 38',
                'firmaDia' => '15', 'firmaMes' => 'Octubre', 'firmaAnio' => '2026',
                'acompananteNombres' => 'Pedro Salazar', 'acompananteDireccion' => 'Av. Los Próceres 456',
                'acompananteParentesco' => 'Padre', 'acompananteDni' => '40000001',
                'programacionFecha' => '2026-10-20', 'programacionHora' => '09:30',
                'programacionObservaciones' => 'Ayuno de 8 horas',
            ]],
            'cirugia' => ['cirugia', [
                'preoperatorio' => 'Evaluación preoperatoria', 'intraoperatorio' => 'Sin incidentes', 'postoperatorio' => 'Reposo',
            ]],
            'reporte-operatorio' => ['reporte-operatorio', [
                'asistente' => 'Luis Pérez', 'lugar' => 'Sala 2', 'casoClinico' => 'Exodoncia', 'tipoAnestesia' => 'Local',
                'tecnicaAnestesia' => 'Troncular', 'diagnosticoDefinitivo' => 'Tercer molar retenido', 'tipoTratamiento' => 'Exodoncia de 38',
                'pre_pa' => '120/80', 'pre_temp' => '36.50', 'pre_fr' => '18.00', 'pre_fc' => '72.00', 'pre_pulso' => '72.00',
                'pronostico' => 'Favorable', 'horaInicio' => '09:30', 'horaTermino' => '10:15',
                'prescripcionPost' => 'Amoxicilina 500 mg', 'alta' => 'Alta ambulatoria', 'epicrisis' => 'Evolución favorable',
                'fecha' => '2026-10-20',
            ]],
            'seguimiento' => ['seguimiento', [
                'fecha' => '2026-10-27', 'evolucion' => 'Cicatrización adecuada',
                'procedimientos' => [[
                    'fecha' => '2026-10-27', 'procedimiento' => 'Retiro de puntos', 'evolucion' => 'Sin signos de infección',
                    'firmaOperador' => 'Andrea Salazar', 'firmaSupervisor' => 'Dra. Ríos',
                ]],
            ]],
        ];
    }

    #[DataProvider('secciones')]
    public function test_cada_clave_del_frontend_vuelve_al_recargar(string $seccion, array $valores): void
    {
        $hoy = now()->toDateString();
        array_walk_recursive($valores, function (&$valor) use ($hoy) {
            $valor = $valor === self::HOY ? $hoy : $valor;
        });
        $alumno = $this->crearUsuario('alumno.contrato', self::CLAVE, 'ALUMNO');
        $historia = $this->actingAs($alumno, 'web')->postJson('/api/historias', [
            'dni' => '70000099',
            'nombres' => 'Andrea Lucía Salazar Huamán',
            'sexo' => 'F',
        ])->assertCreated();
        $id = $historia->json('id');

        foreach ([1, 2] as $_) {
            $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", [
                'formData' => [$seccion => $valores],
                'sectionStatus' => [$seccion => 'in-progress'],
            ])->assertOk();
        }

        $devuelto = $this->actingAs($alumno, 'web')->getJson("/api/historias/{$id}/expediente")
            ->assertOk()
            ->json("formData.{$seccion}") ?? [];

        $faltantes = [];
        foreach ($valores as $clave => $esperado) {
            if (! array_key_exists($clave, $devuelto)) {
                $faltantes[] = "{$clave} (no devuelta)";

                continue;
            }
            if ($this->normalizar($esperado) !== $this->normalizar($devuelto[$clave])) {
                $faltantes[] = "{$clave} (esperado ".json_encode($esperado, JSON_UNESCAPED_UNICODE).', recibido '.json_encode($devuelto[$clave], JSON_UNESCAPED_UNICODE).')';
            }
        }

        $this->assertSame([], $faltantes, "Claves de '{$seccion}' que no sobreviven la ida y vuelta.");
    }

    private function normalizar(mixed $valor): mixed
    {
        if (is_array($valor)) {
            return array_map(fn ($item) => $this->normalizar($item), $valor);
        }
        if (is_bool($valor)) {
            return $valor;
        }

        return $valor === null ? '' : (string) $valor;
    }
}
