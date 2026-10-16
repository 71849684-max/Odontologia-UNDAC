import { expect, test } from 'vitest';
import { accionesDeEstado, formatearFechaObservacion, observacionesDeHistoria, puedeVerObservacion } from './HistoriasApp.jsx';

const codigos = (codigoEstado, rol) => accionesDeEstado({ codigoEstado }, rol).map((accion) => accion.codigo);

test('alumno, docente y administrador ven el botón de observación solo cuando hay texto', () => {
    expect(puedeVerObservacion({ observacion: 'Corregir odontograma', codigoEstado: 'OBSERVADA' }, 'alumno')).toBe(true);
    expect(puedeVerObservacion({ observacion: 'Corregir odontograma', codigoEstado: 'EN_PROCESO' }, 'docente')).toBe(true);
    expect(puedeVerObservacion({ observacion: 'Corregir odontograma', codigoEstado: 'OBSERVADA' }, 'administrador')).toBe(true);
    expect(puedeVerObservacion({ observacion: '' }, 'alumno')).toBe(false);
    expect(puedeVerObservacion({ observacion: 'Corregir odontograma' }, 'administrativo')).toBe(false);
    expect(puedeVerObservacion({ observacion: 'Corregir odontograma', codigoEstado: 'VALIDADA' }, 'docente')).toBe(false);
    expect(puedeVerObservacion({ observacion: 'Corregir odontograma', estado: 'Validada' }, 'alumno')).toBe(false);
});

test('el alumno envía a revisión y puede retomar una historia pendiente', () => {
    expect(codigos('BORRADOR', 'alumno')).toEqual(['PENDIENTE_REVISION']);
    expect(codigos('OBSERVADA', 'alumno')).toEqual(['PENDIENTE_REVISION']);
    expect(codigos('PENDIENTE_REVISION', 'alumno')).toEqual(['EN_PROCESO']);
    expect(codigos('BORRADOR', 'docente')).toEqual([]);
    expect(codigos('BORRADOR', 'administrador')).toEqual(['PENDIENTE_REVISION']);
});

test('el docente valida u observa, y la observación exige texto', () => {
    const acciones = accionesDeEstado({ codigoEstado: 'PENDIENTE_REVISION' }, 'docente');
    expect(acciones.map((accion) => accion.codigo)).toEqual(['VALIDADA', 'OBSERVADA']);
    expect(acciones.find((accion) => accion.codigo === 'OBSERVADA').requiereObservacion).toBe(true);
    expect(codigos('PENDIENTE_REVISION', 'administrador')).toEqual(['VALIDADA', 'OBSERVADA', 'EN_PROCESO']);
    expect(codigos('PENDIENTE_REVISION', 'alumno')).toEqual(['EN_PROCESO']);
});

test('una historia validada o local no ofrece transiciones', () => {
    expect(codigos('VALIDADA', 'docente')).toEqual([]);
    expect(accionesDeEstado({ estado: 'Borrador' }, 'alumno')).toEqual([]);
});

test('el modal lista todas las observaciones de la historia', () => {
    const lista = observacionesDeHistoria({
        observaciones: [
            { id: 2, texto: 'Segunda', fecha: '2026-10-16 12:00:00', docente: 'Ana Docente' },
            { id: 1, texto: 'Primera', fecha: '2026-10-15 09:30:00', docente: 'Ana Docente' },
        ],
    });
    expect(lista).toHaveLength(2);
    expect(lista[0].texto).toBe('Segunda');
    expect(lista[0].docente).toBe('Ana Docente');
    expect(formatearFechaObservacion('2026-10-16 12:00:00')).toMatch(/16/);
});
