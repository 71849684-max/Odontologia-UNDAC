import React from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { GuardadosClinicosContext } from '../compartidos/GuardadosClinicosContext.js';
import { createRecord } from './odontogramaRegistro.mjs';
import useOdontogramaServidor from './useOdontogramaServidor.js';

const servicio = vi.hoisted(() => ({ obtenerOdontograma: vi.fn(), guardarOdontograma: vi.fn() }));
vi.mock('../../servicios/servicioClinico.js', () => ({ ...servicio, mensajeError: fallo => fallo.message }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

function escenario() {
  const registros = { current: new Map() };
  const Envoltura = ({ children }) => <GuardadosClinicosContext.Provider value={registros}>{children}</GuardadosClinicosContext.Provider>;
  const datos = { ...createRecord('HC-77'), revisionServidor: 'a'.repeat(64) };
  servicio.obtenerOdontograma.mockResolvedValue(datos);
  return { registros, Envoltura, datos };
}

test('una confirmación sin cambios no bloquea los guardados posteriores', async () => {
  const { registros, Envoltura } = escenario();
  servicio.guardarOdontograma.mockImplementation(async (_id, datos) => ({ ...datos, revisionServidor: 'b'.repeat(64) }));
  const vista = renderHook(() => useOdontogramaServidor(77, 'HC-77'), { wrapper: Envoltura });
  await waitFor(() => expect(vista.result.current.registro).not.toBeNull());
  await act(() => vista.result.current.guardar());
  act(() => vista.result.current.cambiar({ ...vista.result.current.registro, savedAt: '2026-11-09' }));
  await act(() => vista.result.current.guardar());
  expect(servicio.guardarOdontograma).toHaveBeenCalledTimes(1);
  expect(registros.current.get('odontograma:77').pendiente()).toBe(false);
  registros.current.get('odontograma:77').descartar();
});

test('un fallo conserva los cambios en memoria y el reintento usa la revisión confirmada', async () => {
  const { registros, Envoltura } = escenario();
  servicio.guardarOdontograma.mockRejectedValueOnce(new Error('Sin conexión')).mockImplementation(async (_id, datos) => ({ ...datos, revisionServidor: 'b'.repeat(64) }));
  const vista = renderHook(() => useOdontogramaServidor(77, 'HC-77'), { wrapper: Envoltura });
  await waitFor(() => expect(vista.result.current.registro).not.toBeNull());
  act(() => vista.result.current.cambiar({ ...vista.result.current.registro, savedAt: 'pendiente' }));
  await act(() => vista.result.current.guardar());
  expect(registros.current.get('odontograma:77').pendiente()).toBe(true);
  expect(vista.result.current.error).toBe('Sin conexión');
  await act(() => vista.result.current.guardar());
  expect(registros.current.get('odontograma:77').pendiente()).toBe(false);
  expect(servicio.guardarOdontograma.mock.calls[1][1].revisionServidor).toBe('a'.repeat(64));
  registros.current.get('odontograma:77').descartar();
});

test('volver a la sección durante un guardado recibe la versión canónica del servidor', async () => {
  const { registros, Envoltura } = escenario();
  let finalizar;
  servicio.guardarOdontograma.mockImplementation((_id, datos) => new Promise(resolver => { finalizar = () => resolver({ ...datos, savedAt: 'confirmado', revisionServidor: 'c'.repeat(64) }); }));
  const primera = renderHook(() => useOdontogramaServidor(77, 'HC-77'), { wrapper: Envoltura });
  await waitFor(() => expect(primera.result.current.registro).not.toBeNull());
  act(() => primera.result.current.cambiar({ ...primera.result.current.registro, savedAt: 'pendiente' }));
  let promesa;
  act(() => { promesa = primera.result.current.guardar(); });
  primera.unmount();
  const segunda = renderHook(() => useOdontogramaServidor(77, 'HC-77'), { wrapper: Envoltura });
  await act(async () => { finalizar(); await promesa; });
  expect(segunda.result.current.registro.savedAt).toBe('confirmado');
  expect(registros.current.get('odontograma:77').pendiente()).toBe(false);
  registros.current.get('odontograma:77').descartar();
});
