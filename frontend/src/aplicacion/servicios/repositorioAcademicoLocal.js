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
    perfiles: {},
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
    asignacionesExcepcionales: [],
  };
}

function validState(value) {
  const arrays = ['personas', 'cursos', 'periodos', 'grupos', 'membresias', 'rotaciones', 'docentesRotacion'];
  return Boolean(value && value.version === SCHEMA_VERSION
    && value.perfil && typeof value.perfil === 'object' && !Array.isArray(value.perfil)
    && arrays.every((field) => Array.isArray(value[field]) && value[field].every((item) => item && typeof item === 'object' && !Array.isArray(item))));
}

function normalizeState(value) {
  return {
    ...value,
    perfiles: value.perfiles && typeof value.perfiles === 'object' && !Array.isArray(value.perfiles) ? value.perfiles : {},
    asignacionesExcepcionales: Array.isArray(value.asignacionesExcepcionales) ? value.asignacionesExcepcionales : [],
  };
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
      if (validState(parsed)) return normalizeState(parsed);
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
    const usuarioId = String(datos.usuarioId ?? 'actual');
    const anterior = state.perfiles[usuarioId] || (usuarioId === 'actual' ? state.perfil : {});
    const perfil = {
      ...anterior,
      usuarioId,
      personaId: datos.personaId ?? anterior.personaId,
      nombres: text(datos.nombres),
      apellidos: text(datos.apellidos),
      documento: datos.documento == null ? text(anterior.documento) : text(datos.documento),
      correo: text(datos.correo),
      telefono: text(datos.telefono),
      roles: Array.isArray(datos.roles) ? [...datos.roles] : (anterior.roles || []),
    };
    state.perfiles[usuarioId] = perfil;
    if (usuarioId === 'actual') state.perfil = perfil;
    return perfil;
  });
}

export function crearPeriodo(datos = {}) {
  const fechaInicio = text(datos.fechaInicio);
  const fechaFin = text(datos.fechaFin);
  if (!fechaInicio || !fechaFin || fechaFin < fechaInicio) {
    throw new ErrorAcademico('FECHAS_INVALIDAS', 'La fecha final debe ser igual o posterior a la fecha inicial.');
  }
  return update((state) => {
    const codigo = code(datos.codigo);
    if (state.periodos.some((item) => item.codigo === codigo)) duplicate('Ya existe un periodo con ese código.');
    const periodo = { id: id('periodo'), codigo, nombre: text(datos.nombre), fechaInicio, fechaFin, estado: text(datos.estado) || 'activo' };
    state.periodos.push(periodo);
    return periodo;
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

export function actualizarCurso(cursoId, datos = {}) {
  return update((state) => {
    const curso = state.cursos.find((item) => item.id === cursoId);
    if (!curso) throw new ErrorAcademico('NO_ENCONTRADO', 'No se encontró el curso.');
    const codigo = code(datos.codigo);
    if (state.cursos.some((item) => item.id !== cursoId && item.codigo === codigo)) duplicate('Ya existe un curso con ese código.');
    Object.assign(curso, { codigo, nombre: text(datos.nombre), descripcion: text(datos.descripcion), estado: text(datos.estado) || 'activo' });
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

export function actualizarGrupo(grupoId, datos = {}) {
  return update((state) => {
    const grupo = state.grupos.find((item) => item.id === grupoId);
    if (!grupo) throw new ErrorAcademico('NO_ENCONTRADO', 'No se encontró el grupo.');
    const codigo = code(datos.codigo);
    if (state.grupos.some((item) => item.id !== grupoId && item.codigo === codigo)) duplicate('Ya existe un grupo con ese código.');
    Object.assign(grupo, { codigo, nombre: text(datos.nombre), semestre: text(datos.semestre), estado: text(datos.estado) || 'activo' });
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

export function finalizarMembresia(membresiaId, fechaFin) {
  return update((state) => {
    const membresia = state.membresias.find((item) => item.id === membresiaId);
    if (!membresia) throw new ErrorAcademico('NO_ENCONTRADO', 'No se encontró la membresía.');
    const fin = text(fechaFin);
    if (!fin || fin < membresia.fechaInicio) {
      throw new ErrorAcademico('FECHAS_INVALIDAS', 'La fecha final debe ser igual o posterior a la fecha inicial.');
    }
    membresia.fechaFin = fin;
    membresia.estado = 'finalizada';
    return membresia;
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

export function guardarAsignacionesExcepcionales(rotacionId, personas = []) {
  return update((state) => {
    const prepared = personas.map((item) => ({ id: id('asignacion-excepcional'), rotacionId, personaId: text(item.personaId) }));
    const actuales = state.asignacionesExcepcionales || [];
    for (const assignment of prepared) {
      if (actuales.some((item) => item.rotacionId === rotacionId && item.personaId === assignment.personaId)) {
        throw new ErrorAcademico('ASIGNACION_DUPLICADA', 'La persona ya está asignada a esta rotación.');
      }
    }
    state.asignacionesExcepcionales = [...actuales, ...prepared];
    return prepared;
  });
}

export { STORAGE_KEY as CLAVE_ALMACENAMIENTO_ACADEMICO };
