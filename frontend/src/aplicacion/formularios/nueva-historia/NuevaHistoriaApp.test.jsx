import React from 'react';
import { expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import NuevaHistoriaApp from './NuevaHistoriaApp.jsx';

test('no crea una historia local cuando el módulo clínico todavía no está conectado a la base de datos', () => {
  const onCreated = vi.fn();
  render(<NuevaHistoriaApp onCreated={onCreated} />);

  expect(screen.getByRole('heading', { name: 'Datos mínimos del paciente', level: 3 })).toBeInTheDocument();
  expect(screen.queryByLabelText('Semestre')).not.toBeInTheDocument();
  expect(screen.queryByText('Confirmar')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Crear historia' }));

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
});
