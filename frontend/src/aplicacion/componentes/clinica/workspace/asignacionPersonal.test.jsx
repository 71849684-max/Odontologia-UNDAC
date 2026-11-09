import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import PatientContextBar from './PatientContextBar.jsx';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import { asignarPersonal, listarPersonal } from '../../../servicios/servicioClinico.js';

vi.mock('../contexto/HistoriaClinicaContext.jsx', () => ({ useHistoriaClinica: vi.fn() }));
vi.mock('../../../servicios/servicioClinico.js', () => ({
  asignarPersonal: vi.fn(), listarPersonal: vi.fn(), idHistoria: () => 2,
  mensajeError: (error) => error.message,
}));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

test.each([
  ['alumno', 'DOCENTE', 'Profesional encargado'],
  ['docente', 'ALUMNO', 'Asistente responsable'],
  ['administrador', 'ALUMNO', 'Asistente responsable'],
])('el rol %s filtra personal y actualiza el equipo solo tras guardar en el servidor', async (rol, tipo, etiqueta) => {
  const actualizarEquipo = vi.fn();
  const historia = { id: 2, operador: 'Asistente anterior', docente: 'Profesional anterior' };
  useHistoriaClinica.mockReturnValue({
    patient: { nombres: 'Paciente' }, history: historia, formData: {}, meta: {}, actualizarEquipo,
  });
  listarPersonal.mockResolvedValue([
    { id: 'ALUMNO-7', tipo: 'ALUMNO', nombre: 'Persona asistente', dni: '12345678' },
    { id: 'DOCENTE-9', tipo: 'DOCENTE', nombre: 'Persona profesional', dni: '87654321' },
  ]);
  const respuesta = { ...historia, [tipo === 'DOCENTE' ? 'docente' : 'operador']: 'Persona asignada' };
  asignarPersonal.mockResolvedValue(respuesta);
  render(<PatientContextBar rol={rol} />);
  expect(screen.getByRole('region', { name: etiqueta })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cambiar asignación' }));
  fireEvent.change(screen.getByLabelText('Buscar personal por DNI o nombres / apellidos'), { target: { value: 'Persona' } });
  const nombre = tipo === 'DOCENTE' ? 'Persona profesional' : 'Persona asistente';
  const seleccion = await screen.findByRole('button', { name: new RegExp(nombre) });
  expect(screen.queryByRole('button', { name: new RegExp(tipo === 'DOCENTE' ? 'Persona asistente' : 'Persona profesional') })).not.toBeInTheDocument();
  fireEvent.click(seleccion);
  await waitFor(() => expect(actualizarEquipo).toHaveBeenCalledWith(respuesta));
  expect(asignarPersonal).toHaveBeenCalledWith(2, tipo === 'DOCENTE' ? 'DOCENTE-9' : 'ALUMNO-7');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
