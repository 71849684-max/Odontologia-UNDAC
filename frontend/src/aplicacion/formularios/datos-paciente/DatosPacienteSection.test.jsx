import React, { useState } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import DatosPacienteSection from './DatosPacienteSection.jsx';

afterEach(() => { cleanup(); vi.useRealTimers(); });

function Formulario({ initial = {} }) {
  const [values, setValues] = useState(initial);
  return <><DatosPacienteSection values={values} onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))} /><output data-testid="values">{JSON.stringify(values)}</output></>;
}

test('inicializa la fecha local del registro y conserva una fecha existente', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 8, 12, 23, 30));
  render(<Formulario />);
  expect(screen.getByLabelText('Fecha de registro')).toHaveValue('2026-09-12');
  expect(screen.getByLabelText('Fecha de registro')).toHaveAttribute('readonly');
  expect(JSON.parse(screen.getByTestId('values').textContent).fechaPaciente).toBe('2026-09-12');
  cleanup();
  render(<Formulario initial={{ fechaPaciente: '2026-09-01' }} />);
  expect(screen.getByLabelText('Fecha de registro')).toHaveValue('2026-09-01');
});

test('la cascada filtra ubicaciones y limpia selecciones dependientes', () => {
  render(<Formulario />);
  fireEvent.click(screen.getByRole('button', { name: /Ubicación y residencia/ }));
  expect(screen.getByLabelText('Provincia')).toBeDisabled();
  expect(screen.getByLabelText('Distrito')).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Departamento'), { target: { value: 'Pasco' } });
  fireEvent.change(screen.getByLabelText('Provincia'), { target: { value: 'Pasco' } });
  fireEvent.change(screen.getByLabelText('Distrito'), { target: { value: 'Chaupimarca' } });
  expect(screen.getByLabelText('Distrito')).toHaveValue('Chaupimarca');
  fireEvent.change(screen.getByLabelText('Provincia'), { target: { value: 'Oxapampa' } });
  expect(screen.getByLabelText('Distrito')).toHaveValue('');
  expect(screen.queryByRole('option', { name: 'Chaupimarca' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Departamento'), { target: { value: 'Lima' } });
  expect(screen.getByLabelText('Provincia')).toHaveValue('');
  expect(screen.getByLabelText('Distrito')).toBeDisabled();
});

test('calcula la edad al cambiar la fecha de nacimiento', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 8, 12, 12));
  render(<Formulario />);
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2000-09-13' } });
  expect(screen.getByLabelText('Edad actual')).toHaveValue('25');
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2000-09-12' } });
  expect(screen.getByLabelText('Edad actual')).toHaveValue('26');
  expect(JSON.parse(screen.getByTestId('values').textContent).edad).toBe(26);
});

test('al cambiar la modalidad conserva los datos del acompañante', () => {
  render(<Formulario />);
  fireEvent.click(screen.getByRole('button', { name: /Acompañante, informante o tutor/ }));
  fireEvent.change(screen.getByLabelText('Nombre completo del informante'), { target: { value: 'Rosa' } });
  fireEvent.click(screen.getByRole('radio', { name: 'Solo (paciente autovalente)' }));
  expect(screen.queryByLabelText('Nombre completo del informante')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('radio', { name: 'Con acompañante / tutor' }));
  expect(screen.getByLabelText('Nombre completo del informante')).toHaveValue('Rosa');
});

