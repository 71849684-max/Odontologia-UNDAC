import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import NuevaHistoriaApp from './NuevaHistoriaApp.jsx';

// Node 25 expone un localStorage incompleto: use un almacén controlado para jsdom.
beforeEach(() => {
  const data = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear(),
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test('crea la historia desde los datos mínimos sin pedir contexto académico duplicado', () => {
  const onCreated = vi.fn();
  render(<NuevaHistoriaApp onCreated={onCreated} />);

  expect(screen.getByRole('heading', { name: 'Datos mínimos del paciente', level: 3 })).toBeInTheDocument();
  expect(screen.queryByLabelText('Semestre')).not.toBeInTheDocument();
  expect(screen.queryByText('Confirmar')).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '70000001' } });
  fireEvent.change(screen.getByLabelText('Apellidos y nombres'), { target: { value: 'Andrea Salazar Huamán' } });
  fireEvent.click(screen.getByRole('button', { name: 'Crear historia' }));

  expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({
    dni: '70000001',
    nombres: 'Andrea Salazar Huamán',
    pacienteId: expect.any(String),
    estado: 'Borrador',
  }));
  const historias = JSON.parse(localStorage.getItem('undac:historias:frontend:v1'));
  expect(historias).toEqual([expect.objectContaining({ id: onCreated.mock.calls[0][0].id, pacienteId: expect.any(String) })]);
});

test('precarga los datos del paciente recibido al abrir una nueva historia', () => {
  render(<NuevaHistoriaApp pacienteInicial={{
    dni: '71234567',
    nombres: 'Lucía Ramos Vega',
    fechaNacimiento: '2001-03-12',
    sexo: 'F',
    telefono: '999 111 222',
    correo: 'lucia@undac.edu.pe',
  }} />);

  expect(screen.getByLabelText('DNI')).toHaveValue('71234567');
  expect(screen.getByLabelText('Apellidos y nombres')).toHaveValue('Lucía Ramos Vega');
  expect(screen.getByLabelText('Fecha de nacimiento')).toHaveValue('2001-03-12');
  expect(screen.getByLabelText('Sexo')).toHaveValue('F');
  expect(screen.getByLabelText('N.º de celular')).toHaveValue('999 111 222');
  expect(screen.getByLabelText('Correo electrónico')).toHaveValue('lucia@undac.edu.pe');
});
