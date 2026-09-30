import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  actualizarPerfil,
  actualizarCurso,
  crearPeriodo,
  crearCurso,
  crearGrupo,
  crearRotacion,
  finalizarMembresia,
  guardarAsignacionesExcepcionales,
  guardarDocentesRotacion,
  guardarMembresias,
  obtenerEstadoAcademico,
} from './repositorioAcademicoLocal.js';

const STORAGE_KEY = 'undac:academico:frontend:v1';

function cargarFixturesAcademicos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 2,
    perfil: {},
    perfiles: {},
    personas: [
      { id: 'estudiante-1', nombre: 'Estudiante Uno', documento: '70000001', tipo: 'estudiante' },
      { id: 'docente-1', nombre: 'Docente Uno', documento: '72000001', tipo: 'docente' },
      { id: 'docente-2', nombre: 'Docente Dos', documento: '72000002', tipo: 'docente' },
    ],
    cursos: [
      { id: 'curso-1', codigo: 'CUR-1', nombre: 'Curso Uno', descripcion: '', estado: 'activo' },
      { id: 'curso-2', codigo: 'CUR-2', nombre: 'Curso Dos', descripcion: '', estado: 'activo' },
    ],
    periodos: [{ id: 'periodo-1', codigo: '2026-I', nombre: 'Periodo 2026-I', fechaInicio: '2026-03-01', fechaFin: '2026-07-31', estado: 'activo' }],
    grupos: [{ id: 'grupo-1', codigo: 'VIII-A', nombre: 'Grupo Uno', semestre: 'VIII', estado: 'activo' }],
    membresias: [],
    rotaciones: [],
    docentesRotacion: [],
    asignacionesExcepcionales: [],
  }));
}

beforeEach(() => {
  const data = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear(),
  });
});

describe('repositorio académico local', () => {
  test('inicializa el estado vacío y entrega copias inmutables', () => {
    const estado = obtenerEstadoAcademico();

    expect(estado.version).toBe(2);
    expect(estado.personas).toEqual([]);
    expect(estado.cursos).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).version).toBe(2);

    estado.cursos.push({ nombre: 'Alterado fuera del repositorio' });
    expect(obtenerEstadoAcademico().cursos).toEqual([]);
  });

  test('recupera el estado inicial cuando el almacenamiento contiene JSON corrupto', () => {
    localStorage.setItem(STORAGE_KEY, '{sin-json');

    const estado = obtenerEstadoAcademico();

    expect(estado.version).toBe(2);
    expect(estado.grupos).toEqual([]);
    expect(() => JSON.parse(localStorage.getItem(STORAGE_KEY))).not.toThrow();
  });

  test('persiste el perfil aun cuando los datos opcionales estén vacíos', () => {
    actualizarPerfil({ nombres: 'María', apellidos: 'Fernández', correo: '', telefono: '' });

    expect(obtenerEstadoAcademico().perfil).toMatchObject({
      nombres: 'María',
      apellidos: 'Fernández',
      correo: '',
      telefono: '',
    });
  });

  test('conserva un perfil independiente por cada cuenta', () => {
    actualizarPerfil({ usuarioId: 'usuario-1', nombres: 'Ana', apellidos: 'Uno', telefono: '111' });
    actualizarPerfil({ usuarioId: 'usuario-2', nombres: 'Bea', apellidos: 'Dos', telefono: '222' });

    const estado = obtenerEstadoAcademico();
    expect(estado.perfiles['usuario-1']).toMatchObject({ nombres: 'Ana', telefono: '111' });
    expect(estado.perfiles['usuario-2']).toMatchObject({ nombres: 'Bea', telefono: '222' });
  });

  test('reemplaza estructuras inválidas aunque el JSON y la versión sean válidos', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, perfil: {}, personas: 'incorrecto' }));

    const estado = obtenerEstadoAcademico();
    expect(Array.isArray(estado.personas)).toBe(true);
    expect(Array.isArray(estado.rotaciones)).toBe(true);
  });

  test('rechaza códigos duplicados de curso y grupo sin sobrescribirlos', () => {
    crearCurso({ codigo: 'PROS', nombre: 'Prostodoncia', descripcion: '', estado: 'activo' });
    expect(() => crearCurso({ codigo: ' pros ', nombre: 'Otra asignatura' })).toThrow(expect.objectContaining({ codigo: 'DUPLICADO' }));
    expect(obtenerEstadoAcademico().cursos.filter((curso) => curso.codigo === 'PROS')).toHaveLength(1);

    crearGrupo({ codigo: 'IX-B', nombre: 'Noveno B', semestre: 'IX', estado: 'activo' });
    expect(() => crearGrupo({ codigo: 'ix-b', nombre: 'Reemplazo' })).toThrow(expect.objectContaining({ codigo: 'DUPLICADO' }));
    expect(obtenerEstadoAcademico().grupos.filter((grupo) => grupo.codigo === 'IX-B')).toHaveLength(1);
  });

  test('actualiza un curso existente sin perder su identidad', () => {
    cargarFixturesAcademicos();
    const curso = obtenerEstadoAcademico().cursos[0];
    actualizarCurso(curso.id, { ...curso, nombre: 'Radiología actualizada', estado: 'inactivo' });

    expect(obtenerEstadoAcademico().cursos.find((item) => item.id === curso.id)).toMatchObject({
      nombre: 'Radiología actualizada',
      estado: 'inactivo',
    });
  });

  test('rechaza una rotación cuya fecha final antecede a la inicial', () => {
    cargarFixturesAcademicos();
    const estado = obtenerEstadoAcademico();

    expect(() => crearRotacion({
      grupoId: estado.grupos[0].id,
      cursoId: estado.cursos[0].id,
      periodoId: estado.periodos[0].id,
      fechaInicio: '2026-10-20',
      fechaFin: '2026-10-01',
      estado: 'programada',
    })).toThrow(expect.objectContaining({ codigo: 'FECHAS_INVALIDAS' }));
  });

  test('conserva membresías históricas y rechaza una asignación activa duplicada', () => {
    cargarFixturesAcademicos();
    const estado = obtenerEstadoAcademico();
    const estudiante = estado.personas.find((persona) => persona.tipo === 'estudiante');
    const grupo = crearGrupo({ codigo: 'HIST-1', nombre: 'Grupo histórico', semestre: 'VIII', estado: 'activo' });

    guardarMembresias(grupo.id, [{ personaId: estudiante.id, funcion: 'estudiante', fechaInicio: '2026-01-01', fechaFin: '2026-03-31', estado: 'finalizada' }]);
    guardarMembresias(grupo.id, [{ personaId: estudiante.id, funcion: 'estudiante', fechaInicio: '2026-04-01', estado: 'activa' }]);

    expect(obtenerEstadoAcademico().membresias.filter((item) => item.grupoId === grupo.id)).toHaveLength(2);
    expect(() => guardarMembresias(grupo.id, [{ personaId: estudiante.id, funcion: 'estudiante', fechaInicio: '2026-05-01', estado: 'activa' }]))
      .toThrow(expect.objectContaining({ codigo: 'ASIGNACION_DUPLICADA' }));
  });

  test('finaliza una membresía y permite una reincorporación posterior', () => {
    cargarFixturesAcademicos();
    const estado = obtenerEstadoAcademico();
    const estudiante = estado.personas.find((persona) => persona.tipo === 'estudiante');
    const grupo = estado.grupos[0];
    const [membresia] = guardarMembresias(grupo.id, [{ personaId: estudiante.id, fechaInicio: '2026-08-01' }]);

    finalizarMembresia(membresia.id, '2026-09-30');
    guardarMembresias(grupo.id, [{ personaId: estudiante.id, fechaInicio: '2027-03-01' }]);

    expect(obtenerEstadoAcademico().membresias.filter((item) => item.personaId === estudiante.id)).toHaveLength(2);
  });

  test('permite registrar periodos académicos sin duplicar su código', () => {
    crearPeriodo({ codigo: '2027-I', nombre: 'Periodo 2027-I', fechaInicio: '2027-03-01', fechaFin: '2027-07-31' });

    expect(obtenerEstadoAcademico().periodos.some((item) => item.codigo === '2027-I')).toBe(true);
    expect(() => crearPeriodo({ codigo: '2027-i', nombre: 'Duplicado', fechaInicio: '2027-03-01', fechaFin: '2027-07-31' }))
      .toThrow(expect.objectContaining({ codigo: 'DUPLICADO' }));
  });

  test('admite varios docentes y conserva sus asignaciones entre rotaciones', () => {
    cargarFixturesAcademicos();
    const estado = obtenerEstadoAcademico();
    const docentes = estado.personas.filter((persona) => persona.tipo === 'docente');
    const base = {
      grupoId: estado.grupos[0].id,
      cursoId: estado.cursos[0].id,
      periodoId: estado.periodos[0].id,
      estado: 'activa',
    };
    const primera = crearRotacion({ ...base, fechaInicio: '2026-08-01', fechaFin: '2026-08-31' });
    const segunda = crearRotacion({ ...base, cursoId: estado.cursos[1].id, fechaInicio: '2026-09-01', fechaFin: '2026-09-30' });

    guardarDocentesRotacion(primera.id, [
      { personaId: docentes[0].id, funcion: 'responsable' },
      { personaId: docentes[1].id, funcion: 'colaborador' },
    ]);
    guardarDocentesRotacion(segunda.id, [{ personaId: docentes[0].id, funcion: 'responsable' }]);

    expect(obtenerEstadoAcademico().docentesRotacion).toHaveLength(3);
    expect(() => guardarDocentesRotacion(primera.id, [{ personaId: docentes[0].id, funcion: 'responsable' }]))
      .toThrow(expect.objectContaining({ codigo: 'ASIGNACION_DUPLICADA' }));
  });

  test('conserva estudiantes asignados excepcionalmente a una rotación', () => {
    cargarFixturesAcademicos();
    const estado = obtenerEstadoAcademico();
    const rotacion = crearRotacion({ grupoId: estado.grupos[0].id, cursoId: estado.cursos[0].id, periodoId: estado.periodos[0].id, fechaInicio: '2026-10-01', fechaFin: '2026-10-31' });
    const estudiante = estado.personas.find((item) => item.tipo === 'estudiante');

    guardarAsignacionesExcepcionales(rotacion.id, [{ personaId: estudiante.id }]);

    expect(obtenerEstadoAcademico().asignacionesExcepcionales).toHaveLength(1);
    expect(() => guardarAsignacionesExcepcionales(rotacion.id, [{ personaId: estudiante.id }]))
      .toThrow(expect.objectContaining({ codigo: 'ASIGNACION_DUPLICADA' }));
  });
});
