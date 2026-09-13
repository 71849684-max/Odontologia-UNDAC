export const clinicalSections = [
  { id: 'datos-paciente', label: 'Datos del paciente', short: 'Paciente', group: 'Ingreso', icon: 'user' },
  { id: 'anamnesis', label: 'Anamnesis y enfermedad actual', short: 'Anamnesis', group: 'Ingreso', icon: 'clipboard' },
  { id: 'cuestionario-salud', label: 'Cuestionario de salud', short: 'Salud', group: 'Antecedentes', icon: 'heart' },
  { id: 'antecedentes', label: 'Antecedentes personales y familiares', short: 'Antecedentes', group: 'Antecedentes', icon: 'history' },
  { id: 'examen-clinico', label: 'Examen clínico general', short: 'Examen general', group: 'Examen', icon: 'stethoscope' },
  { id: 'examen-extraoral', label: 'Examen estomatológico extraoral', short: 'Extraoral', group: 'Examen', icon: 'face' },
  { id: 'examen-intraoral', label: 'Examen estomatológico intraoral', short: 'Intraoral', group: 'Examen', icon: 'mouth' },
  { id: 'odontograma', label: 'Odontograma digital', short: 'Odontograma', group: 'Examen', icon: 'tooth' },
  { id: 'oclusion', label: 'Oclusión y pérdida dentaria', short: 'Oclusión', group: 'Examen', icon: 'bite' },
  { id: 'examenes-auxiliares', label: 'Exámenes auxiliares', short: 'Auxiliares', group: 'Diagnóstico', icon: 'lab' },
  { id: 'diagnostico', label: 'Diagnóstico y pronóstico', short: 'Diagnóstico', group: 'Diagnóstico', icon: 'diagnosis' },
  { id: 'modelos', label: 'Estudio de modelos', short: 'Modelos', group: 'Planificación', icon: 'model' },
  { id: 'plan-tratamiento', label: 'Plan de tratamiento integral', short: 'Tratamiento', group: 'Planificación', icon: 'plan' },
  { id: 'consentimiento', label: 'Consentimiento informado', short: 'Consentimiento', group: 'Cirugía', icon: 'signature' },
  { id: 'cirugia', label: 'Plan de tratamiento quirúrgico', short: 'Cirugía', group: 'Cirugía', icon: 'surgery' },
  { id: 'reporte-operatorio', label: 'Reporte operatorio', short: 'Operatorio', group: 'Cirugía', icon: 'report' },
  { id: 'seguimiento', label: 'Seguimiento quirúrgico', short: 'Seguimiento', group: 'Seguimiento', icon: 'followup' },
];

export const dashboardServices = [
  { id: 'pacientes', label: 'Pacientes', description: 'Registro, búsqueda y acceso a pacientes', metric: '24', metricLabel: 'asignados', target: { view: 'pacientes' }, icon: 'users' },
  { id: 'historias', label: 'Historias clínicas', description: 'Historias activas, en revisión y cerradas', metric: '18', metricLabel: 'activas', target: { view: 'historias' }, icon: 'folder' },
  { id: 'nueva-historia', label: 'Nueva historia', description: 'Iniciar una historia clínica odontológica', metric: '+', metricLabel: 'registrar', target: { view: 'nueva-historia' }, icon: 'add' },
  { id: 'odontograma', label: 'Odontograma', description: 'Dentición permanente y temporal · numeración FDI', metric: '52', metricLabel: 'posiciones', target: { view: 'historia', section: 'odontograma' }, icon: 'tooth' },
  { id: 'examenes', label: 'Exámenes auxiliares', description: 'Laboratorio, radiografías y resultados clínicos', metric: '3', metricLabel: 'grupos', target: { view: 'historia', section: 'examenes-auxiliares' }, icon: 'lab' },
  { id: 'diagnostico', label: 'Diagnóstico', description: 'Diagnóstico clínico-radiográfico y pronóstico', metric: 'DX', metricLabel: 'clínico', target: { view: 'historia', section: 'diagnostico' }, icon: 'diagnosis' },
  { id: 'tratamiento', label: 'Plan de tratamiento', description: 'Plan integral y planificación por fases', metric: 'Fases', metricLabel: 'clínicas', target: { view: 'historia', section: 'plan-tratamiento' }, icon: 'plan' },
  { id: 'cirugia', label: 'Cirugía bucal', description: 'Consentimiento, cirugía y reporte operatorio', metric: '3', metricLabel: 'módulos', target: { view: 'historia', section: 'cirugia' }, icon: 'surgery' },
  { id: 'seguimiento', label: 'Seguimiento', description: 'Evolución y procedimientos posteriores', metric: 'Hoy', metricLabel: 'control', target: { view: 'historia', section: 'seguimiento' }, icon: 'followup' },
];

export { healthQuestions } from '../formularios/cuestionario-salud/cuestionario-salud.config.mjs';

export { psychologicalStates } from '../formularios/anamnesis/anamnesis.config.mjs';

export { intraoralTissues } from '../formularios/examen-intraoral/examen-intraoral.config.mjs';

export { consentParagraphs } from '../formularios/consentimiento/consentimiento.config.mjs';

export { labFields } from '../formularios/examenes-auxiliares/examenes-auxiliares.config.mjs';

export { followupColumns } from '../formularios/seguimiento/seguimiento.config.mjs';
