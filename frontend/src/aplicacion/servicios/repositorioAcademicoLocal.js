const STORAGE_KEY = 'undac:academico:frontend:v1';
const SCHEMA_VERSION = 1;

let sequence = 0;

export class ErrorAcademico extends Error {
  constructor(codigo, mensaje) {
    super(mensaje);
    this.name = 'ErrorAcademico';
    this.codigo = codigo;
    this.mensaje = mensaje;
  }
}

function id(prefix) {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence.toString(36)}`;
}

function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function text(value) {
  return String(value ?? '').trim();
}

function code(value) {
  return text(value).toUpperCase();
}

function seedState() {
  return {
    version: SCHEMA_VERSION,
    perfil: {
      nombres: 'María',
      apellidos: 'Fernández',
      documento: '71000001',
      correo: 'maria.fernandez@undac.edu.pe',
      telefono: '900 000 001',
      roles: ['Alumno'],
    },
    personas: [
      { id: 'persona-estudiante-maria', nombre: 'María Fernández', documento: '71000001', tipo: 'estudiante' },
      { id: 'persona-estudiante-jose', nombre: 'José Paredes', documento: '71000002', tipo: 'estudiante' },
      { id: 'persona-estudiante-lucia', nombre: 'Lucía Quispe', documento: '71000003', tipo: 'estudiante' },
      { id: 'persona-docente-carlos', nombre: 'Dr. Carlos Rojas', documento: '72000001', tipo: 'docente' },
      { id: 'persona-docente-elena', nombre: 'Dra. Elena Vargas', documento: '72000002', tipo: 'docente' },
    ],
    cursos: [
      { id: 'curso-rx', codigo: 'RX', nombre: 'Rayos X', descripcion: 'Diagnóstico por imágenes', estado: 'activo' },
      { id: 'curso-cd', codigo: 'CD', nombre: 'Cirugía Dental', descripcion: 'Procedimientos de cirugía bucal', estado: 'activo' },
    ],
    periodos: [
      { id: 'periodo-2026-ii', codigo: '2026-II', nombre: 'Periodo 2026-II', fechaInicio: '2026-08-01', fechaFin: '2026-12-20', estado: 'activo' },
    ],
    grupos: [
      { id: 'grupo-viii-a', codigo: 'VIII-A', nombre: 'Octavo A', semestre: 'VIII', estado: 'activo' },
    ],
    membresias: [],
    rotaciones: [],
    docentesRotacion: [],
  };
}

function validState(value) {
  const arrays = ['personas', 'cursos', 'periodos', 'grupos', 'membresias', 'rotaciones', 'docentesRotacion'];
  return value && value.version === SCHEMA_VERSION && value.perfil && arrays.every((field) => Array.isArray(value[field]));
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    throw new ErrorAcademico('ALMACENAMIENTO', 'No se pudo guardar la información en este navegador.');
  }
  return clone(state);
}

function read() {
  let stored;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new ErrorAcademico('ALMACENAMIENTO', 'No se pudo leer la información guardada.');
  }

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (validState(parsed)) return parsed;
    } catch {
      // El contenido inválido se reemplaza por el estado inicial versionado.
    }
  }

  const initial = seedState();
  persist(initial);
  return initial;
}

function update(mutator) {
  const state = read();
  const result = mutator(state);
  persist(state);
  return clone(result);
}

function duplicate(message) {
  throw new ErrorAcademico('DUPLICADO', message);
}

export function obtenerEstadoAcademico() {
  return clone(read());
}

export function actualizarPerfil(datos = {}) {
  return update((state) => {
    state.perfil = {
      ...state.perfil,
      nombres: text(datos.nombres),
      apellidos: text(datos.apellidos),
      correo: text(datos.correo),
      telefono: text(datos.telefono),
    };
    return state.perfil;
  });
}

export function crearCurso(datos = {}) {
  return update((state) => {
    const codigo = code(datos.codigo);
    if (state.cursos.some((item) => item.codigo === codigo)) duplicate('Ya existe un curso con ese código.');
    const curso = {
      id: id('curso'),
      codigo,
      nombre: text(datos.nombre),
      descripcion: text(datos.descripcion),
      estado: text(datos.estado) || 'activo',
    };
    state.cursos.push(curso);
    return curso;
  });
}

export function crearGrupo(datos = {}) {
  return update((state) => {
    const codigo = code(datos.codigo);
    if (state.grupos.some((item) => item.codigo === codigo)) duplicate('Ya existe un grupo con ese código.');
    const grupo = {
      id: id('grupo'),
      codigo,
      nombre: text(datos.nombre),
      semestre: text(datos.semestre),
      estado: text(datos.estado) || 'activo',
    };
    state.grupos.push(grupo);
    return grupo;
  });
}

function activeMembership(item) {
  return item.estado !== 'finalizada' && !item.fechaFin;
}

export function guardarMembresias(grupoId, membresias = []) {
  return update((state) => {
    const prepared = membresias.map((item) => ({
      id: id('membresia'),
      grupoId,
      personaId: text(item.personaId),
      funcion: text(item.funcion) || 'estudiante',
      fechaInicio: text(item.fechaInicio),
      fechaFin: text(item.fechaFin),
      estado: text(item.estado) || 'activa',
    }));

    const candidates = [...state.membresias];
    for (const membership of prepared) {
      const duplicateActive = activeMembership(membership) && candidates.some((existing) => (
        existing.grupoId === membership.grupoId
        && existing.personaId === membership.personaId
        && existing.funcion === membership.funcion
        && activeMembership(existing)
      ));
      if (duplicateActive) {
        throw new ErrorAcademico('ASIGNACION_DUPLICADA', 'La persona ya tiene una membresía activa en este grupo.');
      }
      candidates.push(membership);
    }

    state.membresias.push(...prepared);
    return prepared;
  });
}

export function crearRotacion(datos = {}) {
  const fechaInicio = text(datos.fechaInicio);
  const fechaFin = text(datos.fechaFin);
  if (!fechaInicio || !fechaFin || fechaFin < fechaInicio) {
    throw new ErrorAcademico('FECHAS_INVALIDAS', 'La fecha final debe ser igual o posterior a la fecha inicial.');
  }

  return update((state) => {
    const rotacion = {
      id: id('rotacion'),
      grupoId: text(datos.grupoId),
      cursoId: text(datos.cursoId),
      periodoId: text(datos.periodoId),
      fechaInicio,
      fechaFin,
      estado: text(datos.estado) || 'programada',
    };
    state.rotaciones.push(rotacion);
    return rotacion;
  });
}

export function guardarDocentesRotacion(rotacionId, docentes = []) {
  return update((state) => {
    const prepared = docentes.map((item) => ({
      id: id('docente-rotacion'),
      rotacionId,
      personaId: text(item.personaId),
      funcion: text(item.funcion) || 'colaborador',
    }));
    const candidates = [...state.docentesRotacion];

    for (const assignment of prepared) {
      if (candidates.some((existing) => existing.rotacionId === rotacionId && existing.personaId === assignment.personaId)) {
        throw new ErrorAcademico('ASIGNACION_DUPLICADA', 'El docente ya está asignado a esta rotación.');
      }
      candidates.push(assignment);
    }

    state.docentesRotacion.push(...prepared);
    return prepared;
  });
}

export { STORAGE_KEY as CLAVE_ALMACENAMIENTO_ACADEMICO };
