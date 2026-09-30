import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import NuevaHistoriaApp from './NuevaHistoriaApp.jsx';

<<<<<<< HEAD
afterEach(() => {
  cleanup();
  localStorage.clear();
});

test('crea la historia desde los datos mínimos sin pedir contexto académico duplicado', () => {
=======
test('no crea una historia local cuando el módulo clínico todavía no está conectado a la base de datos', () => {
>>>>>>> 68f9ee0cdb3126a8a4cedcd77484ffa134ac8628
  const onCreated = vi.fn();
  render(<NuevaHistoriaApp onCreated={onCreated} />);

  expect(screen.getByRole('heading', { name: 'Datos mínimos del paciente', level: 3 })).toBeInTheDocument();
  expect(screen.queryByLabelText('Semestre')).not.toBeInTheDocument();
  expect(screen.queryByText('Confirmar')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Crear historia' }));

<<<<<<< HEAD
  expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({
    dni: '70000001',
    nombres: 'Andrea Salazar Huamán',
    pacienteId: 1,
    estado: 'Borrador',
  }));
  const historias = JSON.parse(localStorage.getItem('undac:historias:frontend:v1'));
  expect(historias).toEqual([expect.objectContaining({ id: onCreated.mock.calls[0][0].id, pacienteId: 1 })]);
=======
  expect(onCreated).not.toHaveBeenCalled();
  expect(screen.getByRole('status')).toHaveTextContent('estará disponible cuando el módulo clínico se conecte a la base de datos');
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
>>>>>>> 68f9ee0cdb3126a8a4cedcd77484ffa134ac8628
});
