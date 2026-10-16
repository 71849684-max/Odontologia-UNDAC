import { expect, test } from 'vitest';
import { accionesDeEstado } from './HistoriasApp.jsx';

const codigos = (codigoEstado, rol) => accionesDeEstado({ codigoEstado }, rol).map((accion) => accion.codigo);

test('el alumno envía a revisión y puede retomar una historia pendiente', () => {
    expect(codigos('BORRADOR', 'alumno')).toEqual(['PENDIENTE_REVISION']);
    expect(codigos('OBSERVADA', 'alumno')).toEqual(['PENDIENTE_REVISION']);
    expect(codigos('PENDIENTE_REVISION', 'alumno')).toEqual(['EN_PROCESO']);
});

test('el docente valida u observa, y la observación exige texto', () => {
    const acciones = accionesDeEstado({ codigoEstado: 'PENDIENTE_REVISION' }, 'docente');
    expect(acciones.map((accion) => accion.codigo)).toEqual(['VALIDADA', 'OBSERVADA']);
    expect(acciones.find((accion) => accion.codigo === 'OBSERVADA').requiereObservacion).toBe(true);
});

test('una historia validada o local no ofrece transiciones', () => {
    expect(codigos('VALIDADA', 'docente')).toEqual([]);
    expect(accionesDeEstado({ estado: 'Borrador' }, 'alumno')).toEqual([]);
});
