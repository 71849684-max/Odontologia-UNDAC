import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { addFinding, createRecord } from './odontogramaRegistro.mjs';

const servicio = vi.hoisted(() => ({
  obtenerOdontograma: vi.fn(),
  guardarOdontograma: vi.fn(async (_id, registro) => registro),
}));

vi.mock('../../servicios/servicioClinico.js', () => ({
  idHistoria: (valor) => (/^\d+$/.test(String(valor)) ? Number(valor) : null),
  mensajeError: (_error, respaldo) => respaldo,
  obtenerOdontograma: servicio.obtenerOdontograma,
  guardarOdontograma: servicio.guardarOdontograma,
}));

const { default: Odontograma } = await import('./Odontograma.jsx');

let almacen;
beforeEach(() => {
  almacen = new Map();
  vi.stubGlobal('localStorage', { getItem: (k) => almacen.get(k) ?? null, setItem: (k, v) => almacen.set(k, String(v)), clear: () => almacen.clear() });
  servicio.obtenerOdontograma.mockReset();
  servicio.guardarOdontograma.mockClear();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function registroConCaries(paciente, savedAt) {
  const registro = createRecord(paciente);
  registro.examinations[0] = addFinding(registro.examinations[0], { state: 'endodoncia', tooth: '16', surface: 'oclusal', code: 'TC', points: [] });
  return { ...registro, savedAt };
}

test('al abrir una historia del servidor se muestra el odontograma guardado aunque el navegador esté vacío', async () => {
  servicio.obtenerOdontograma.mockResolvedValue({ ...registroConCaries('OTRO-ID', '2026-10-15T10:00:00.000Z') });
  render(<Odontograma patientId="HC-0007" historyId="7" />);

  await waitFor(() => expect(screen.getByText(/Registro de hallazgos \(1\)/)).toBeInTheDocument());
  expect(servicio.obtenerOdontograma).toHaveBeenCalledWith(7);
  expect(JSON.parse(almacen.get('undac:odontograma:nts188:v1:HC-0007')).patientId).toBe('HC-0007');
  expect(servicio.guardarOdontograma).not.toHaveBeenCalled();
});

test('si el registro local es más reciente se conserva y se sincroniza con el servidor', async () => {
  const local = registroConCaries('HC-0008', '2026-10-15T12:00:00.000Z');
  almacen.set('undac:odontograma:nts188:v1:HC-0008', JSON.stringify(local));
  servicio.obtenerOdontograma.mockResolvedValue({ ...createRecord('HC-0008'), savedAt: '2026-10-15T09:00:00.000Z' });

  render(<Odontograma patientId="HC-0008" historyId="8" />);

  await waitFor(() => expect(servicio.guardarOdontograma).toHaveBeenCalledWith(8, expect.objectContaining({ savedAt: local.savedAt })));
  expect(screen.getByText(/Registro de hallazgos \(1\)/)).toBeInTheDocument();
});
