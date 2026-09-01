import React from 'react';
import {
  healthQuestions,
  psychologicalStates,
  intraoralTissues,
  consentParagraphs,
  labFields,
  followupColumns,
} from '../../configuracion/historiaClinica.config.mjs';
import {
  SectionCard,
  Field,
  TextAreaField,
  SelectField,
  ChoiceGroup,
  CheckboxGroup,
  PhotoPlaceholder,
} from './ControlesClinicos.jsx';

const yesNo = ['Sí', 'No'];
const normalAltered = ['Normal', 'Alterada'];

function useSection(values, onChange) {
  const get = (key, fallback = '') => values?.[key] ?? fallback;
  const set = (key) => (value) => onChange?.(key, value);
  return { get, set };
}

function Subheading({ children, hint }) {
  return <div className="undac-subheading"><h4>{children}</h4>{hint ? <span>{hint}</span> : null}</div>;
}

export function DatosPacienteSection({ values, onChange, meta }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Datos del operador" subtitle="Información académica vinculada con la elaboración de la Historia Clínica.">
      <div className="undac-form-grid">
        <Field label="Apellidos y nombres" value={get('operador', meta?.operador)} onChange={set('operador')} className="undac-col-2" />
        <Field label="Semestre" value={get('semestre', meta?.semestre)} onChange={set('semestre')} />
        <Field label="Año académico" value={get('anioAcademico', meta?.anioAcademico)} onChange={set('anioAcademico')} />
        <Field label="Fecha" type="date" value={get('fecha', meta?.fecha)} onChange={set('fecha')} />
        <Field label="Docente" value={get('docente', meta?.docente)} onChange={set('docente')} />
        <Field label="C.O.P." value={get('cop', meta?.cop)} onChange={set('cop')} />
      </div>
    </SectionCard>
    <SectionCard title="Datos personales del paciente" subtitle="Filiación según la ficha institucional UNDAC.">
      <div className="undac-form-grid">
        <Field label="DNI" value={get('dni')} onChange={set('dni')} />
        <Field label="Fecha" type="date" value={get('fechaPaciente')} onChange={set('fechaPaciente')} />
        <Field label="Apellidos y nombres" value={get('nombres')} onChange={set('nombres')} className="undac-col-2" />
        <Field label="Edad" type="number" min="0" max="120" value={get('edad')} onChange={set('edad')} />
        <ChoiceGroup label="Sexo" value={get('sexo')} onChange={set('sexo')} options={['M','F']} />
        <Field label="Fecha de nacimiento" type="date" value={get('fechaNacimiento')} onChange={set('fechaNacimiento')} />
        <Field label="Lugar de nacimiento" value={get('lugarNacimiento')} onChange={set('lugarNacimiento')} />
        <Field label="Procedencia" value={get('procedencia')} onChange={set('procedencia')} />
        <Field label="Tiempo de residencia en Cerro de Pasco" value={get('tiempoResidencia')} onChange={set('tiempoResidencia')} />
        <Field label="Domicilio" value={get('domicilio')} onChange={set('domicilio')} className="undac-col-2" />
        <Field label="N.º de celular" value={get('celular')} onChange={set('celular')} />
        <Field label="Correo electrónico" type="email" value={get('correo')} onChange={set('correo')} />
        <Field label="Distrito" value={get('distrito')} onChange={set('distrito')} />
        <Field label="Provincia" value={get('provincia')} onChange={set('provincia')} />
        <Field label="Departamento" value={get('departamento')} onChange={set('departamento')} />
        <Field label="Grado de instrucción" value={get('gradoInstruccion')} onChange={set('gradoInstruccion')} />
        <Field label="Centro de estudios" value={get('centroEstudios')} onChange={set('centroEstudios')} className="undac-col-2" />
        <SelectField label="Estado civil" value={get('estadoCivil')} onChange={set('estadoCivil')} options={['Soltero','Casado','Divorciado','Viudo','Otros']} />
        <Field label="Ocupación" value={get('ocupacion')} onChange={set('ocupacion')} />
        <Field label="Lugar de trabajo" value={get('lugarTrabajo')} onChange={set('lugarTrabajo')} />
        <Field label="Idioma" value={get('idioma')} onChange={set('idioma')} />
        <Field label="Religión" value={get('religion')} onChange={set('religion')} />
        <Field label="Domicilio" value={get('domicilioRegistro2')} onChange={set('domicilioRegistro2')} />
        <Field label="Nro. telefónico" value={get('telefonoRegistro2')} onChange={set('telefonoRegistro2')} />
      </div>
      <Subheading>Informante y acompañante</Subheading>
      <div className="undac-form-grid">
        <Field label="Nombre del informante" value={get('informante')} onChange={set('informante')} className="undac-col-2" />
        <Field label="Persona que lo acompaña" value={get('acompanante')} onChange={set('acompanante')} className="undac-col-2" />
        <Field label="Nombre del padre" value={get('padre')} onChange={set('padre')} /><Field label="N.º celular del padre" value={get('padreCelular')} onChange={set('padreCelular')} />
        <Field label="Nombre de la madre" value={get('madre')} onChange={set('madre')} /><Field label="N.º celular de la madre" value={get('madreCelular')} onChange={set('madreCelular')} />
        <Field label="Parentesco (tutor)" value={get('tutorParentesco')} onChange={set('tutorParentesco')} /><Field label="N.º celular del tutor" value={get('tutorCelular')} onChange={set('tutorCelular')} />
      </div>
    </SectionCard>
  </div>;
}

export function AnamnesisSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Enfermedad actual" subtitle="Motivo de consulta, historia de enfermedad y evaluación general al momento de la atención.">
      <div className="undac-form-grid">
        <TextAreaField label="Motivo de consulta" value={get('motivoConsulta')} onChange={set('motivoConsulta')} className="undac-col-2" rows={3} />
        <ChoiceGroup label="Tipo de atención" value={get('tipoAtencion')} onChange={set('tipoAtencion')} options={['Urgencia','Tratamiento integral','Tratamiento específico']} className="undac-col-2" />
        <TextAreaField label="Historia de la enfermedad" value={get('historiaEnfermedad')} onChange={set('historiaEnfermedad')} className="undac-col-2" rows={5} />
        <ChoiceGroup label="Estado general del paciente" value={get('estadoGeneral')} onChange={set('estadoGeneral')} options={['Malo','Regular','Bueno']} className="undac-col-2" />
        <TextAreaField label="Ectoscopía" value={get('ectoscopia')} onChange={set('ectoscopia')} className="undac-col-2" rows={3} />
      </div>
    </SectionCard>
    <SectionCard title="Datos psicológicos" subtitle="Cómo se encuentra el paciente al momento de la consulta.">
      <CheckboxGroup label="Estado observado" values={get('estadoPsicologico', [])} onChange={set('estadoPsicologico')} options={psychologicalStates} />
      <TextAreaField label="Observaciones" value={get('observacionesPsicologicas')} onChange={set('observacionesPsicologicas')} rows={3} />
    </SectionCard>
  </div>;
}

export function CuestionarioSaludSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <SectionCard title="Cuestionario de salud — Antecedentes médicos" subtitle="Las 24 preguntas corresponden al documento institucional. Los detalles se habilitan al seleccionar Sí.">
    <div className="undac-question-list">
      {healthQuestions.map((question) => {
        const answerKey = `q${question.number}Answer`;
        const answer = get(answerKey);
        return <div className="undac-clinical-question" key={question.number}>
          <div className="undac-clinical-question__number">{question.number}</div>
          <div className="undac-clinical-question__content">
            <strong>{question.text}</strong>
            <ChoiceGroup label="Respuesta" value={answer} onChange={set(answerKey)} options={yesNo} />
            {answer === 'Sí' ? <div className="undac-question-detail">
              <Field label={question.detailLabel || 'Detalle'} value={get(`q${question.number}Detail`)} onChange={set(`q${question.number}Detail`)} />
              {question.extraLabel ? <Field label={question.extraLabel} value={get(`q${question.number}Extra`)} onChange={set(`q${question.number}Extra`)} /> : null}
            </div> : null}
          </div>
        </div>;
      })}
    </div>
  </SectionCard>;
}

export function AntecedentesSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Antecedentes personales — Generales">
      <div className="undac-form-grid">
        <Field label="Hijos: número" type="number" min="0" value={get('hijosNumero')} onChange={set('hijosNumero')} /><Field label="Hijos vivos" type="number" min="0" value={get('hijosVivos')} onChange={set('hijosVivos')} />
        <Field label="Hijos fallecidos" type="number" min="0" value={get('hijosFallecidos')} onChange={set('hijosFallecidos')} /><ChoiceGroup label="Ningún hijo" value={get('ningunHijo')} onChange={set('ningunHijo')} options={yesNo} />
        <SelectField label="Vivienda" value={get('vivienda')} onChange={set('vivienda')} options={['Propia','Alquilada','Otros']} /><Field label="Vivienda — otros" value={get('viviendaOtros')} onChange={set('viviendaOtros')} />
        <SelectField label="Material de vivienda" value={get('materialVivienda')} onChange={set('materialVivienda')} options={['Noble','Rústico','Otros']} /><Field label="Material — otros" value={get('materialOtros')} onChange={set('materialOtros')} />
        <SelectField label="Viajes" value={get('viajes')} onChange={set('viajes')} options={['Nunca','Frecuente','Otros']} /><Field label="Viajes — otros" value={get('viajesOtros')} onChange={set('viajesOtros')} />
        <SelectField label="Alimentación" value={get('alimentacion')} onChange={set('alimentacion')} options={['Come todo','Vegetariano','Dieta por indicación médica','Otros']} /><Field label="Alimentación — otros" value={get('alimentacionOtros')} onChange={set('alimentacionOtros')} />
        <CheckboxGroup label="Hábitos nocivos" values={get('habitosNocivos', [])} onChange={set('habitosNocivos')} options={['Fuma','Alcohol','Drogas','Otros']} className="undac-col-2" />
        <Field label="De ser sí, tipo y tiempo" value={get('habitosDetalle')} onChange={set('habitosDetalle')} className="undac-col-2" />
        <ChoiceGroup label="Inmunizaciones" value={get('inmunizaciones')} onChange={set('inmunizaciones')} options={yesNo} /><SelectField label="Situación socioeconómica" value={get('socioeconomica')} onChange={set('socioeconomica')} options={['Baja','Media','Alta']} />
      </div>
    </SectionCard>
    <SectionCard title="Antecedentes fisiológicos">
      <div className="undac-form-grid">
        <ChoiceGroup label="Periodo prenatal" value={get('prenatal')} onChange={set('prenatal')} options={['Normal','Con dificultad']} /><Field label="Detalle prenatal" value={get('prenatalDetalle')} onChange={set('prenatalDetalle')} />
        <ChoiceGroup label="Periodo natal" value={get('natal')} onChange={set('natal')} options={['Normal','Con dificultad']} /><Field label="Detalle natal" value={get('natalDetalle')} onChange={set('natalDetalle')} />
        <SelectField label="Lactancia" value={get('lactancia')} onChange={set('lactancia')} options={['Materna','Artificial','Otros']} /><Field label="Lactancia — otros" value={get('lactanciaOtros')} onChange={set('lactanciaOtros')} />
        <Field label="En mujeres: inicio de menstruación" value={get('menarquia')} onChange={set('menarquia')} /><SelectField label="Características" value={get('menstruacionCaracteristicas')} onChange={set('menstruacionCaracteristicas')} options={['Normal','A veces','Finalizó por la edad']} />
        <Field label="Edad de finalización" value={get('menstruacionFinal')} onChange={set('menstruacionFinal')} /><ChoiceGroup label="Gestación" value={get('gestacion')} onChange={set('gestacion')} options={yesNo} />
        {get('gestacion') === 'Sí' ? <Field label="Tiempo de gestación" value={get('gestacionTiempo')} onChange={set('gestacionTiempo')} className="undac-col-2" /> : null}
      </div>
    </SectionCard>
    <SectionCard title="Antecedentes terapéuticos">
      <div className="undac-form-grid">
        <ChoiceGroup label="¿Es alérgico a algún medicamento?" value={get('alergiaMedicamento')} onChange={set('alergiaMedicamento')} options={yesNo} /><Field label="Medicamento / detalle" value={get('alergiaMedicamentoDetalle')} onChange={set('alergiaMedicamentoDetalle')} />
        <Field label="Medicación anterior — nombre" value={get('medicacionAnteriorNombre')} onChange={set('medicacionAnteriorNombre')} /><Field label="Dosis" value={get('medicacionAnteriorDosis')} onChange={set('medicacionAnteriorDosis')} />
        <ChoiceGroup label="Medicación actual" value={get('medicacionActual')} onChange={set('medicacionActual')} options={yesNo} /><Field label="Nombre" value={get('medicacionActualNombre')} onChange={set('medicacionActualNombre')} />
        <Field label="Dosis" value={get('medicacionActualDosis')} onChange={set('medicacionActualDosis')} /><Field label="¿Por qué?" value={get('medicacionActualMotivo')} onChange={set('medicacionActualMotivo')} />
      </div>
    </SectionCard>
    <SectionCard title="Actos quirúrgicos">
      <div className="undac-form-grid">
        <ChoiceGroup label="¿Ha sido intervenido quirúrgicamente con anestesia total?" value={get('cirugiaAnestesiaTotal')} onChange={set('cirugiaAnestesiaTotal')} options={yesNo} className="undac-col-2" />
        <Field label="Tipo de intervención quirúrgica" value={get('tipoIntervencion')} onChange={set('tipoIntervencion')} className="undac-col-2" />
        <ChoiceGroup label="Reacción de la anestesia total" value={get('reaccionAnestesia')} onChange={set('reaccionAnestesia')} options={['Normal','Con complicaciones']} /><Field label="Si fue con complicaciones, explique" value={get('reaccionAnestesiaDetalle')} onChange={set('reaccionAnestesiaDetalle')} />
        <ChoiceGroup label="Hemorragias a causa de la intervención" value={get('hemorragiaIntervencion')} onChange={set('hemorragiaIntervencion')} options={yesNo} /><Field label="De ser sí, ¿cuántos días?" value={get('hemorragiaDias')} onChange={set('hemorragiaDias')} />
        <SelectField label="Proceso de cicatrización" value={get('cicatrizacion')} onChange={set('cicatrizacion')} options={['Normal','Demoró','Se complicó','Otros']} /><Field label="Cicatrización — otros" value={get('cicatrizacionOtros')} onChange={set('cicatrizacionOtros')} />
        <ChoiceGroup label="¿Le han realizado exodoncias?" value={get('exodoncias')} onChange={set('exodoncias')} options={yesNo} /><ChoiceGroup label="¿Problemas con el anestésico odontológico?" value={get('problemasAnestesicoOdontologico')} onChange={set('problemasAnestesicoOdontologico')} options={yesNo} />
        <ChoiceGroup label="¿Hemorragias post exodoncias?" value={get('hemorragiasPostExodoncia')} onChange={set('hemorragiasPostExodoncia')} options={yesNo} /><Field label="¿Por cuántos días?" value={get('hemorragiasPostExodonciaDias')} onChange={set('hemorragiasPostExodonciaDias')} />
        <ChoiceGroup label="Las exodoncias fueron realizadas por" value={get('exodonciaRealizadaPor')} onChange={set('exodonciaRealizadaPor')} options={['Odontólogo','Técnico']} className="undac-col-2" />
      </div>
    </SectionCard>
    <SectionCard title="Antecedentes familiares">
      <div className="undac-form-grid">
        <SelectField label="Padre" value={get('padreEstado')} onChange={set('padreEstado')} options={['Vive','Fallecido','Otros']} /><Field label="Padre — otros" value={get('padreEstadoOtros')} onChange={set('padreEstadoOtros')} />
        <SelectField label="Madre" value={get('madreEstado')} onChange={set('madreEstado')} options={['Vive','Fallecido','Otros']} /><Field label="Madre — otros" value={get('madreEstadoOtros')} onChange={set('madreEstadoOtros')} />
        <Field label="Hermanos — número" type="number" min="0" value={get('hermanosNumero')} onChange={set('hermanosNumero')} /><Field label="Hermanos vivos" type="number" min="0" value={get('hermanosVivos')} onChange={set('hermanosVivos')} />
        <Field label="Hermanos fallecidos" type="number" min="0" value={get('hermanosFallecidos')} onChange={set('hermanosFallecidos')} /><Field label="Otros" value={get('hermanosOtros')} onChange={set('hermanosOtros')} />
      </div>
    </SectionCard>
  </div>;
}

export function ExamenClinicoSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Examen clínico general" subtitle="Evaluación general y signos vitales al momento de realizar la Historia Clínica.">
      <div className="undac-form-grid">
        <ChoiceGroup label="Tipo psicológico de paciente" value={get('tipoPsicologico')} onChange={set('tipoPsicologico')} options={['Receptivo','Escéptico','Pasivo','No colaborador']} className="undac-col-2" />
        <ChoiceGroup label="Marcha o caminata" value={get('marcha')} onChange={set('marcha')} options={['Normal','Con dificultad']} />
        <ChoiceGroup label="¿Presenta fatiga o cansancio al sentarse o caminar?" value={get('fatiga')} onChange={set('fatiga')} options={yesNo} />
        <SelectField label="Raza" value={get('raza')} onChange={set('raza')} options={['Mestiza','Blanca','Negra','Caucásico','Otros']} /><Field label="Raza — otros" value={get('razaOtros')} onChange={set('razaOtros')} />
        <Field label="Peso" value={get('peso')} onChange={set('peso')} /><Field label="Talla" value={get('talla')} onChange={set('talla')} />
      </div>
      <Subheading>Signos vitales</Subheading>
      <div className="undac-vitals-grid">
        <Field label="T°" value={get('temperatura')} onChange={set('temperatura')} />
        <Field label="P.A." value={get('presionArterial')} onChange={set('presionArterial')} />
        <Field label="F.R." value={get('frecuenciaRespiratoria')} onChange={set('frecuenciaRespiratoria')} />
        <Field label="Pulso" value={get('pulso')} onChange={set('pulso')} />
        <Field label="F.C." value={get('frecuenciaCardiaca')} onChange={set('frecuenciaCardiaca')} />
      </div>
    </SectionCard>
    <SectionCard title="Cabeza">
      <div className="undac-form-grid">
        <ChoiceGroup label="Forma del cráneo" value={get('formaCraneo')} onChange={set('formaCraneo')} options={['Dolicocéfalo','Mesocéfalo','Braquicéfalo']} className="undac-col-2" />
        <ChoiceGroup label="Cabellos — implantación" value={get('cabelloImplantacion')} onChange={set('cabelloImplantacion')} options={['Buena','Regular','Patológica']} /><Field label="Cabellos — color" value={get('cabelloColor')} onChange={set('cabelloColor')} />
        <ChoiceGroup label="Ojos" value={get('ojosEstado')} onChange={set('ojosEstado')} options={['Normales','Presenta patología']} /><Field label="Ojos — patología" value={get('ojosPatologia')} onChange={set('ojosPatologia')} />
        <Field label="Ojos — color" value={get('ojosColor')} onChange={set('ojosColor')} /><Field label="Ojos — forma" value={get('ojosForma')} onChange={set('ojosForma')} />
        <ChoiceGroup label="Oídos" value={get('oidosEstado')} onChange={set('oidosEstado')} options={['Normales','Presenta patología']} /><Field label="Oídos — patología" value={get('oidosPatologia')} onChange={set('oidosPatologia')} />
        <ChoiceGroup label="Audición" value={get('audicion')} onChange={set('audicion')} options={['Escucha bien','Escucha con dificultad']} className="undac-col-2" />
        <ChoiceGroup label="Nariz / olfacción" value={get('narizEstado')} onChange={set('narizEstado')} options={['Normal','Buen olfato','Dificultad en olfacción']} /><Field label="Nariz — forma" value={get('narizForma')} onChange={set('narizForma')} />
        <ChoiceGroup label="Labios" value={get('labiosEstado')} onChange={set('labiosEstado')} options={['Normal','Presenta patología']} /><Field label="Patología de labios (queilitis angular, herpes simple, etc.)" value={get('labiosPatologia')} onChange={set('labiosPatologia')} />
        <Field label="Labios — forma" value={get('labiosForma')} onChange={set('labiosForma')} /><ChoiceGroup label="Fascies" value={get('fasciesEstado')} onChange={set('fasciesEstado')} options={['Normal','Patológico']} />
        <Field label="Color de fascies" value={get('fasciesColor')} onChange={set('fasciesColor')} />
      </div>
    </SectionCard>
    <SectionCard title="Cuello, extremidades y tórax">
      <div className="undac-form-grid">
        <ChoiceGroup label="Cuello — forma" value={get('cuelloForma')} onChange={set('cuelloForma')} options={['Normal','Patológico']} /><Field label="¿Qué patología?" value={get('cuelloPatologia')} onChange={set('cuelloPatologia')} />
        <ChoiceGroup label="Exploración de cadena linfática" value={get('cadenaLinfatica')} onChange={set('cadenaLinfatica')} options={['Normal','Patológico']} /><Field label="¿Qué patología?" value={get('cadenaLinfaticaPatologia')} onChange={set('cadenaLinfaticaPatologia')} />
        <ChoiceGroup label="ATM" value={get('atm')} onChange={set('atm')} options={['Normal','Chasquidos','Otros']} /><Field label="ATM — otros" value={get('atmOtros')} onChange={set('atmOtros')} />
        <ChoiceGroup label="Glándulas tiroides (palpación)" value={get('tiroides')} onChange={set('tiroides')} options={['Normal','Patológico']} /><Field label="¿Qué patología?" value={get('tiroidesPatologia')} onChange={set('tiroidesPatologia')} />
        <ChoiceGroup label="Miembros superiores" value={get('miembrosSuperiores')} onChange={set('miembrosSuperiores')} options={['Normales','Presenta alteración']} /><Field label="Tipo de alteración" value={get('miembrosSuperioresDetalle')} onChange={set('miembrosSuperioresDetalle')} />
        <ChoiceGroup label="Miembros inferiores" value={get('miembrosInferiores')} onChange={set('miembrosInferiores')} options={['Normales','Presenta alteración']} /><Field label="Tipo de alteración" value={get('miembrosInferioresDetalle')} onChange={set('miembrosInferioresDetalle')} />
        <ChoiceGroup label="Tórax" value={get('torax')} onChange={set('torax')} options={['Normal','Presenta alteración o patología']} /><Field label="¿Qué patología?" value={get('toraxPatologia')} onChange={set('toraxPatologia')} />
      </div>
    </SectionCard>
  </div>;
}

export function ExamenExtraoralSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Examen clínico estomatológico extraoral">
      <div className="undac-form-grid">
        <ChoiceGroup label="Tipo facial" value={get('tipoFacial')} onChange={set('tipoFacial')} options={['Dolicocéfalo','Mesocéfalo','Braquicéfalo']} className="undac-col-2" />
        <ChoiceGroup label="Simetría facial" value={get('simetriaFacial')} onChange={set('simetriaFacial')} options={['Simétrica','Asimétrica']} />
        <ChoiceGroup label="Perfil anteroposterior" value={get('perfil')} onChange={set('perfil')} options={['Convexo','Recto','Cóncavo']} />
        <ChoiceGroup label="Labios" value={get('competenciaLabial')} onChange={set('competenciaLabial')} options={['Competencia labial','Incompetencia labial','Cortos']} className="undac-col-2" />
        <ChoiceGroup label="Tonicidad de músculos peribucales" value={get('tonicidad')} onChange={set('tonicidad')} options={['Hipertónico','Normotónico','Hipotónico']} className="undac-col-2" />
        <ChoiceGroup label="Ángulo nasolabial" value={get('anguloNasolabial')} onChange={set('anguloNasolabial')} options={['Cerrado','Normal','Abierto']} />
        <ChoiceGroup label="Fonación" value={get('fonacion')} onChange={set('fonacion')} options={['Normal','Paranormal','Otros']} />
        <Field label="Fonación — otros" value={get('fonacionOtros')} onChange={set('fonacionOtros')} />
        <Field label="¿Cuándo fue la última visita al dentista?" value={get('ultimaVisitaDentista')} onChange={set('ultimaVisitaDentista')} />
        <TextAreaField label="Motivo de la visita al dentista" value={get('motivoVisitaDentista')} onChange={set('motivoVisitaDentista')} className="undac-col-2" rows={3} />
      </div>
    </SectionCard>
    <SectionCard title="Fotografías extraorales" subtitle="Área visual equivalente al espacio de fotografías del documento físico."><PhotoPlaceholder title="Fotografías extraorales" count={5} /></SectionCard>
  </div>;
}

export function ExamenIntraoralSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Examen clínico estomatológico intraoral — Tejidos blandos" subtitle="Para cada tejido se registra condición anatómica/color y la descripción cuando está alterado.">
      <div className="undac-tissue-list">
        {intraoralTissues.map((tissue, index) => {
          const key = `tissue${index}`;
          const status = get(`${key}Status`);
          return <div className="undac-tissue-row" key={tissue}><div><strong>{tissue}</strong><span>Anatomía y color</span></div><ChoiceGroup label="Condición" value={status} onChange={set(`${key}Status`)} options={normalAltered} />{status === 'Alterada' ? <Field label="Si es alterada, describir" value={get(`${key}Detail`)} onChange={set(`${key}Detail`)} /> : <div className="undac-tissue-ok">Sin descripción adicional</div>}</div>;
        })}
      </div>
    </SectionCard>
    <SectionCard title="Fotografías intraorales"><PhotoPlaceholder title="Fotografías intraorales" count={6} /></SectionCard>
  </div>;
}

export function OclusionSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Oclusión">
      <div className="undac-form-grid">
        <Field label="Posterior: clase" value={get('oclusionPosterior')} onChange={set('oclusionPosterior')} /><Field label="Anterior: clase" value={get('oclusionAnterior')} onChange={set('oclusionAnterior')} />
        <TextAreaField label="¿Cuándo fue la última exodoncia o cuál fue el motivo de pérdida dentaria?" value={get('ultimaExodoncia')} onChange={set('ultimaExodoncia')} className="undac-col-2" rows={3} />
        <CheckboxGroup label="Motivo por el cual perdió las piezas dentarias" values={get('motivosPerdida', [])} onChange={set('motivosPerdida')} options={['Caries','Traumatismos','Genético','Atrición','Otros']} className="undac-col-2" />
        <Field label="Motivo de pérdida — otros" value={get('motivosPerdidaOtros')} onChange={set('motivosPerdidaOtros')} className="undac-col-2" />
        <CheckboxGroup label="¿Fue portador de algún tipo de prótesis bucal?" values={get('protesisTipos', [])} onChange={set('protesisTipos')} options={['Total','Parcial','Fija','Otros']} className="undac-col-2" />
        <ChoiceGroup label="La prótesis fue confeccionada e instalada por" value={get('protesisProfesional')} onChange={set('protesisProfesional')} options={['Odontólogo','Técnico dental']} className="undac-col-2" />
        <TextAreaField label="Diagnóstico presuntivo" value={get('diagnosticoPresuntivoOclusion')} onChange={set('diagnosticoPresuntivoOclusion')} className="undac-col-2" rows={4} />
      </div>
    </SectionCard>
  </div>;
}

export function ExamenesAuxiliaresSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Análisis de laboratorio clínico" subtitle="Valores solicitados por la ficha institucional.">
      <div className="undac-lab-grid">{labFields.map(([key, label], index) => <div className="undac-lab-row" key={key}><span>{index + 1}</span><Field label={label} value={get(key)} onChange={set(key)} /></div>)}</div>
      <PhotoPlaceholder title="Resultados de laboratorio" description="Área de visualización mock para resultados de laboratorio." />
      <TextAreaField label="Diagnóstico de análisis de laboratorio clínico" value={get('diagnosticoLaboratorio')} onChange={set('diagnosticoLaboratorio')} rows={5} />
    </SectionCard>
    <SectionCard title="Exámenes radiográficos">
      <div className="undac-form-grid">
        <TextAreaField label="Informe RX panorámico" value={get('rxPanoramico')} onChange={set('rxPanoramico')} className="undac-col-2" rows={7} />
        <TextAreaField label="Informe RX oclusales (ambos maxilar y mandíbula)" value={get('rxOclusales')} onChange={set('rxOclusales')} className="undac-col-2" rows={6} />
        <TextAreaField label="Informe RX periapicales" value={get('rxPeriapicales')} onChange={set('rxPeriapicales')} className="undac-col-2" rows={6} />
      </div>
      <PhotoPlaceholder title="Radiografías" description="Espacio preparado para radiografías. No realiza carga real." count={4} />
    </SectionCard>
  </div>;
}

export function DiagnosticoSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <SectionCard title="Diagnóstico y pronóstico" subtitle="Consolida los hallazgos clínicos y radiográficos de la Historia Clínica.">
    <div className="undac-form-grid">
      <TextAreaField label="DX. clínico radiográfico" value={get('dxClinicoRadiografico')} onChange={set('dxClinicoRadiografico')} className="undac-col-2" rows={5} />
      <TextAreaField label="DX presuntivo" value={get('dxPresuntivo')} onChange={set('dxPresuntivo')} className="undac-col-2" rows={5} />
      <TextAreaField label="DX definitivo" value={get('dxDefinitivo')} onChange={set('dxDefinitivo')} className="undac-col-2" rows={5} />
      <TextAreaField label="Pronóstico" value={get('pronostico')} onChange={set('pronostico')} className="undac-col-2" rows={7} />
    </div>
  </SectionCard>;
}

export function ModelosSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Estudio de modelos" subtitle="Análisis de modelos de estudio y planificación.">
      <div className="undac-form-grid">
        <TextAreaField label="Informe del maxilar" value={get('informeMaxilar')} onChange={set('informeMaxilar')} className="undac-col-2" rows={6} />
        <TextAreaField label="Informe de la mandíbula" value={get('informeMandibula')} onChange={set('informeMandibula')} className="undac-col-2" rows={6} />
        <TextAreaField label="Planificación en modelos" value={get('planificacionModelos')} onChange={set('planificacionModelos')} className="undac-col-2" rows={6} />
      </div>
    </SectionCard>
    <SectionCard title="Fotografías de modelos"><PhotoPlaceholder title="Fotografías de modelos" count={4} /></SectionCard>
  </div>;
}

export function PlanTratamientoSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <SectionCard title="Plan de tratamiento integral (fases)" subtitle="El documento institucional dispone este apartado como planificación clínica abierta por fases.">
    <TextAreaField label="Plan de tratamiento integral" value={get('planIntegral')} onChange={set('planIntegral')} rows={18} placeholder="Describa las fases y procedimientos planificados..." />
  </SectionCard>;
}

export function ConsentimientoSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Consentimiento informado" subtitle="Autorización para intervención quirúrgica en cirugía bucal. Esta interfaz es visual; no implementa firma digital real.">
      <div className="undac-form-grid">
        <Field label="Apellidos y nombres del paciente" value={get('paciente')} onChange={set('paciente')} className="undac-col-2" />
        <Field label="Edad" value={get('edad')} onChange={set('edad')} /><Field label="Sexo" value={get('sexo')} onChange={set('sexo')} />
        <Field label="DNI" value={get('dni')} onChange={set('dni')} /><Field label="H.C. N.º" value={get('hcNumero')} onChange={set('hcNumero')} />
        <Field label="Domicilio" value={get('domicilio')} onChange={set('domicilio')} className="undac-col-2" />
        <Field label="Fecha" type="date" value={get('fecha')} onChange={set('fecha')} /><Field label="Profesional que informa / Dr.(a)" value={get('doctor')} onChange={set('doctor')} />
      </div>
      <div className="undac-consent-list">
        {consentParagraphs.map((paragraph, index) => <label className="undac-consent-item" key={index}><input type="checkbox" checked={Boolean(get(`consent${index + 1}`, false))} onChange={(event) => set(`consent${index + 1}`)(event.target.checked)} /><span><b>{index + 1}.</b> {paragraph}</span></label>)}
      </div>
      <TextAreaField label="Intervención quirúrgica autorizada" value={get('intervencionAutorizada')} onChange={set('intervencionAutorizada')} rows={4} />
      <div className="undac-form-grid">
        <Field label="Cerro de Pasco — día" value={get('firmaDia')} onChange={set('firmaDia')} /><Field label="Mes" value={get('firmaMes')} onChange={set('firmaMes')} /><Field label="Año" value={get('firmaAnio')} onChange={set('firmaAnio')} />
      </div>
    </SectionCard>
    <SectionCard title="Firmas y acompañante" subtitle="Marcadores visuales; no representan firma electrónica.">
      <div className="undac-signature-grid">
        {['Firma del paciente','Huella dactilar — dedo índice derecho','Firma del acompañante','Firma del docente — autorización de cirugía'].map((label) => <div className="undac-signature-slot" key={label}><span>Área reservada</span><strong>{label}</strong></div>)}
      </div>
      <Subheading>Familiar que lo acompaña</Subheading>
      <div className="undac-form-grid">
        <Field label="Apellidos y nombres" value={get('acompananteNombres')} onChange={set('acompananteNombres')} className="undac-col-2" />
        <Field label="Dirección" value={get('acompananteDireccion')} onChange={set('acompananteDireccion')} /><Field label="Parentesco" value={get('acompananteParentesco')} onChange={set('acompananteParentesco')} />
        <Field label="DNI" value={get('acompananteDni')} onChange={set('acompananteDni')} />
      </div>
      <Subheading>Programación de cirugía</Subheading>
      <div className="undac-form-grid"><Field label="Fecha" type="date" value={get('programacionFecha')} onChange={set('programacionFecha')} /><Field label="Hora" type="time" value={get('programacionHora')} onChange={set('programacionHora')} /><TextAreaField label="Observaciones" value={get('programacionObservaciones')} onChange={set('programacionObservaciones')} className="undac-col-2" rows={4} /></div>
    </SectionCard>
  </div>;
}

export function CirugiaSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <SectionCard title="Plan de tratamiento quirúrgico" subtitle="Planificación preoperatoria, intraoperatoria y postoperatoria.">
    <div className="undac-form-grid">
      <TextAreaField label="Preoperatorio" value={get('preoperatorio')} onChange={set('preoperatorio')} className="undac-col-2" rows={8} />
      <TextAreaField label="Intraoperatorio" value={get('intraoperatorio')} onChange={set('intraoperatorio')} className="undac-col-2" rows={10} />
      <TextAreaField label="Postoperatorio" value={get('postoperatorio')} onChange={set('postoperatorio')} className="undac-col-2" rows={9} />
    </div>
  </SectionCard>;
}

function VitalControlTable({ values, onChange }) {
  const moments = [
    ['pre','Pre operatorio'],
    ['intra','Intra-operatorio'],
    ['post','Post-operatorio'],
  ];
  const rows = [
    ['pa','P.A.'],['temp','T°'],['fr','F.R.'],['fc','F.C.'],['pulso','Pulso']
  ];
  return <div className="undac-table-wrap"><table className="undac-table undac-vital-table"><thead><tr><th>Control</th>{moments.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(([key,label]) => <tr key={key}><th>{label}</th>{moments.map(([moment]) => <td key={moment}><input aria-label={`${label} ${moment}`} value={values?.[`${moment}_${key}`] ?? ''} onChange={(event) => onChange?.(`${moment}_${key}`, event.target.value)} /></td>)}</tr>)}</tbody></table></div>;
}

export function ReporteOperatorioSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Reporte operatorio" subtitle="Registro del procedimiento quirúrgico efectuado por el alumno de pregrado.">
      <div className="undac-form-grid">
        <Field label="Paciente — apellidos y nombres" value={get('paciente')} onChange={set('paciente')} className="undac-col-2" /><Field label="Edad" value={get('edad')} onChange={set('edad')} /><Field label="Sexo" value={get('sexo')} onChange={set('sexo')} />
        <Field label="Domicilio" value={get('domicilio')} onChange={set('domicilio')} className="undac-col-2" /><Field label="Alumno de pregrado — apellidos y nombres" value={get('alumno')} onChange={set('alumno')} /><Field label="Asistente" value={get('asistente')} onChange={set('asistente')} />
        <Field label="1. Lugar (sala de cirugía)" value={get('lugar')} onChange={set('lugar')} /><Field label="2. Caso clínico" value={get('casoClinico')} onChange={set('casoClinico')} />
        <Field label="3. Tipo de anestesia" value={get('tipoAnestesia')} onChange={set('tipoAnestesia')} /><Field label="4. Técnica de anestesia" value={get('tecnicaAnestesia')} onChange={set('tecnicaAnestesia')} />
        <TextAreaField label="5. Diagnóstico definitivo" value={get('diagnosticoDefinitivo')} onChange={set('diagnosticoDefinitivo')} className="undac-col-2" rows={3} /><TextAreaField label="6. Tipo de tratamiento" value={get('tipoTratamiento')} onChange={set('tipoTratamiento')} className="undac-col-2" rows={3} />
      </div>
      <Subheading>Control de signos (funciones) vitales</Subheading>
      <VitalControlTable values={values} onChange={onChange} />
      <div className="undac-form-grid undac-form-grid--top">
        <TextAreaField label="7. Pronóstico" value={get('pronostico')} onChange={set('pronostico')} className="undac-col-2" rows={3} />
        <Field label="8. Hora de inicio" type="time" value={get('horaInicio')} onChange={set('horaInicio')} /><Field label="9. Hora de término" type="time" value={get('horaTermino')} onChange={set('horaTermino')} />
        <TextAreaField label="10. Prescripción post operatoria" value={get('prescripcionPost')} onChange={set('prescripcionPost')} className="undac-col-2" rows={5} />
        <TextAreaField label="11. Alta" value={get('alta')} onChange={set('alta')} className="undac-col-2" rows={4} />
        <TextAreaField label="12. Epicrisis" value={get('epicrisis')} onChange={set('epicrisis')} className="undac-col-2" rows={5} />
        <Field label="Fecha" type="date" value={get('fecha')} onChange={set('fecha')} />
      </div>
      <div className="undac-signature-grid undac-signature-grid--2"><div className="undac-signature-slot"><span>Área reservada</span><strong>Firma del docente</strong></div><div className="undac-signature-slot"><span>Área reservada</span><strong>Firma del alumno</strong></div></div>
    </SectionCard>
  </div>;
}

export function SeguimientoSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  const rows = get('procedimientos', Array.from({ length: 10 }, () => ({ fecha: '', procedimiento: '', firmaOperador: '', firmaSupervisor: '' })));
  const updateRow = (index, key, value) => set('procedimientos')(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  return <div className="undac-section-stack">
    <SectionCard title="Seguimiento quirúrgico">
      <div className="undac-form-grid">
        <Field label="Apellidos y nombres del paciente" value={get('paciente')} onChange={set('paciente')} className="undac-col-2" /><Field label="Operador" value={get('operador')} onChange={set('operador')} /><Field label="Fecha" type="date" value={get('fecha')} onChange={set('fecha')} />
        <TextAreaField label="Evolución / seguimiento" value={get('evolucion')} onChange={set('evolucion')} className="undac-col-2" rows={14} />
      </div>
    </SectionCard>
    <SectionCard title="Ficha de seguimiento de los procedimientos" subtitle="La tabla reproduce los cuatro campos definidos por la ficha institucional.">
      <div className="undac-table-wrap"><table className="undac-table undac-followup-table"><thead><tr>{followupColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row,index) => <tr key={index}><td><input type="date" value={row.fecha} onChange={(event) => updateRow(index,'fecha',event.target.value)} aria-label={`Fecha procedimiento ${index + 1}`} /></td><td><input value={row.procedimiento} onChange={(event) => updateRow(index,'procedimiento',event.target.value)} aria-label={`Procedimiento ${index + 1}`} /></td><td><input value={row.firmaOperador} onChange={(event) => updateRow(index,'firmaOperador',event.target.value)} aria-label={`Firma operador ${index + 1}`} /></td><td><input value={row.firmaSupervisor} onChange={(event) => updateRow(index,'firmaSupervisor',event.target.value)} aria-label={`Firma supervisor ${index + 1}`} /></td></tr>)}</tbody></table></div>
    </SectionCard>
  </div>;
}
