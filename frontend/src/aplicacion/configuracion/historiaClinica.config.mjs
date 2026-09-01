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
  { id: 'odontograma', label: 'Odontograma', description: 'Registro visual de piezas y superficies dentales', metric: '32', metricLabel: 'piezas', target: { view: 'historia', section: 'odontograma' }, icon: 'tooth' },
  { id: 'examenes', label: 'Exámenes auxiliares', description: 'Laboratorio, radiografías y resultados clínicos', metric: '3', metricLabel: 'grupos', target: { view: 'historia', section: 'examenes-auxiliares' }, icon: 'lab' },
  { id: 'diagnostico', label: 'Diagnóstico', description: 'Diagnóstico clínico-radiográfico y pronóstico', metric: 'DX', metricLabel: 'clínico', target: { view: 'historia', section: 'diagnostico' }, icon: 'diagnosis' },
  { id: 'tratamiento', label: 'Plan de tratamiento', description: 'Plan integral y planificación por fases', metric: 'Fases', metricLabel: 'clínicas', target: { view: 'historia', section: 'plan-tratamiento' }, icon: 'plan' },
  { id: 'cirugia', label: 'Cirugía bucal', description: 'Consentimiento, cirugía y reporte operatorio', metric: '3', metricLabel: 'módulos', target: { view: 'historia', section: 'cirugia' }, icon: 'surgery' },
  { id: 'seguimiento', label: 'Seguimiento', description: 'Evolución y procedimientos posteriores', metric: 'Hoy', metricLabel: 'control', target: { view: 'historia', section: 'seguimiento' }, icon: 'followup' },
];

export const healthQuestions = [
  { number: 1, text: '¿Fue atendido por un médico últimamente?', detailLabel: '¿Hace qué tiempo?', extraLabel: '¿Cuál fue la razón?' },
  { number: 2, text: '¿Ha tenido Ud. un problema de tipo cardiaco?', detailLabel: '¿Qué tipo?' },
  { number: 3, text: '¿Ha tenido Ud. un problema de tipo renal?', detailLabel: '¿Qué tipo?' },
  { number: 4, text: '¿Ha tenido Ud. un problema de tipo pulmonar?', detailLabel: '¿Qué tipo?' },
  { number: 5, text: '¿Ha tenido Ud. un problema de tipo gástrico?', detailLabel: '¿Qué tipo?' },
  { number: 6, text: '¿Ha tenido Ud. alguna alteración del SNC?', detailLabel: '¿Qué tipo?' },
  { number: 7, text: '¿Ha tenido Ud. un problema de tipo digestivo?', detailLabel: '¿Qué tipo?' },
  { number: 8, text: '¿Ha tenido Ud. un problema en el sistema hepático (Hepatitis)?', detailLabel: '¿Qué tipo?' },
  { number: 9, text: '¿Ha tenido Ud. un problema de hipertensión?', detailLabel: '¿Qué tipo?' },
  { number: 10, text: '¿Ha tenido Ud. alguna vez una enfermedad venérea?', detailLabel: '¿Qué tipo?' },
  { number: 11, text: '¿Ha tenido Ud. un trastorno de tipo tiroideo?', detailLabel: '¿Qué tipo?' },
  { number: 12, text: '¿Ha tenido Ud. alguna vez pápulas o hipersensibilidades?', detailLabel: '¿Qué tipo?' },
  { number: 13, text: '¿Es Ud. alérgico a la penicilina?', detailLabel: 'Detalle' },
  { number: 14, text: '¿Es Ud. alérgico a otro tipo de medicamento?', detailLabel: '¿Qué tipo?' },
  { number: 15, text: '¿Ha sido internado alguna vez en un hospital?', detailLabel: '¿Qué causa?' },
  { number: 16, text: '¿Le han realizado alguna vez transfusión sanguínea?', detailLabel: '¿Qué tipo?' },
  { number: 17, text: '¿Ud. tiene algún problema con las articulaciones óseas?', detailLabel: '¿Qué tipo?' },
  { number: 18, text: '¿Ud. tiene algún problema hematológico?', detailLabel: '¿Con qué?' },
  { number: 19, text: '¿Ha sufrido algún tipo de desmayo o convulsiones?', detailLabel: '¿Qué tipo?' },
  { number: 20, text: '¿Ud. sufre o tiene diabetes?', detailLabel: '¿Qué tipo?' },
  { number: 21, text: 'Si tiene Ud. diabetes, ¿está compensado?', detailLabel: 'Detalle' },
  { number: 22, text: '¿Ud. tiene o presentó algún problema en la piel?', detailLabel: '¿Qué tipo?' },
  { number: 23, text: '¿Tiene o presenta un proceso infeccioso o respiratorio?', detailLabel: '¿Qué tipo?' },
  { number: 24, text: '¿Tiene o presenta una dificultad para respirar?', detailLabel: '¿Qué tipo?' },
];

export const psychologicalStates = ['Tranquilo', 'Ansioso', 'Nervioso', 'Temeroso', 'Irritable', 'Triste', 'Preocupado', 'Agitado', 'Apático'];

export const intraoralTissues = [
  'Vestíbulo', 'Paladar blando', 'Úvula', 'Lengua', 'Frenillos', 'Encías', 'Paladar duro', 'Orofaringe', 'Piso de boca', 'Carrillos'
];

export const consentParagraphs = [
  'Me han explicado la naturaleza exacta de la intervención o procedimiento, su necesidad, la forma de realización, las alternativas razonables, las posibles consecuencias de no efectuar el tratamiento y los riesgos y complicaciones que puedan derivarse.',
  'Comprendo que la cirugía bucal no es una ciencia exacta y que no es posible anticipar todas las complicaciones. Comprendo que un resultado indeseable no implica necesariamente error y confío en que las decisiones del profesional buscarán mi mayor beneficio.',
  'Me han explicado que el tratamiento se realizará bajo anestesia local mediante una o varias inyecciones, sus efectos esperados, duración aproximada, posibles reacciones alérgicas, molestias locales y eventuales alteraciones del pulso, presión arterial o ritmo cardiaco.',
  'Me han informado que pueden presentarse complicaciones como inflamación, dolor, infección, alveolitis, sangrado, hematoma, limitación de apertura bucal y, con menor frecuencia, daño de estructuras vecinas, fracturas, comunicaciones bucosinusales o lesiones neurológicas.',
  'Autorizo la toma de fotografías o registros audiovisuales antes, durante y después de la intervención para fines científicos y docentes, resguardando la identidad del paciente.',
  'He comprendido las explicaciones brindadas, he podido realizar observaciones y mis dudas han sido aclaradas.',
  'Autorizo los exámenes y análisis auxiliares necesarios antes de la intervención quirúrgica y para su programación.',
  'Comprendo que puedo revocar esta autorización en cualquier momento sin necesidad de brindar una explicación.',
  'Me comprometo a pagar el derecho de clínica por la cirugía a realizarme. Declaro estar seguro y satisfecho con la información recibida y autorizo la intervención quirúrgica indicada bajo anestesia local, así como las actuaciones necesarias ante una situación urgente imprevista por el equipo docente y alumno de pregrado.'
];

export const labFields = [
  ['hemoglobina', 'Hemoglobina'],
  ['hematocrito', 'Hematocrito'],
  ['tiempoCoagulacion', 'Tiempo de coagulación'],
  ['tiempoSangria', 'Tiempo de sangría'],
  ['grupoSanguineo', 'Grupo sanguíneo'],
  ['factorRh', 'Factor RH'],
  ['glucosa', 'Glucosa'],
  ['otros', 'Otros'],
];

export const followupColumns = ['Fecha', 'Procedimiento', 'Firma del operador', 'Firma del supervisor'];
