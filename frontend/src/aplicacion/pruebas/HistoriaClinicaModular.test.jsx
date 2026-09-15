import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import HistoriaClinica from '../componentes/clinica/HistoriaClinica.jsx';
import { clinicalMoments, clinicalSections } from '../configuracion/historiaClinica.config.mjs';
import { componentesSeccion } from '../formularios/registroFormularios.js';

beforeEach(() => {
  const data = new Map();
  vi.stubGlobal('localStorage', { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)) });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test.each(clinicalSections)('abre la sección $id con sus dependencias independientes', ({ id, label }) => {
  expect(componentesSeccion[id]).toBeTypeOf('function');
  render(<HistoriaClinica historiaId="1" initialSection={id} />);
  expect(screen.getByRole('heading', { name: label, level: 2 })).toBeInTheDocument();
  expect(screen.queryByText('Sección preparada para implementación.')).not.toBeInTheDocument();
});

test('la navegación primaria se reduce a seis momentos clínicos', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);
  const navigation = within(screen.getByRole('complementary', { name: 'Momentos de Historia Clínica' }));
  for (const moment of clinicalMoments) expect(navigation.getByRole('button', { name: new RegExp(moment.label, 'i') })).toBeInTheDocument();
  expect(clinicalMoments).toHaveLength(6);
});

test('al navegar entre momentos conserva los datos de cada sección y no los mezcla', () => {
  render(<HistoriaClinica historiaId="1" initialSection="anamnesis" />);
  fireEvent.change(screen.getByLabelText('Motivo de consulta'), { target: { value: 'Consulta de prueba' } });
  const moments = within(screen.getByRole('complementary', { name: 'Momentos de Historia Clínica' }));
  fireEvent.click(moments.getByRole('button', { name: /Evolución y seguimiento/i }));
  fireEvent.change(screen.getByLabelText('Evolución / seguimiento'), { target: { value: 'Seguimiento de prueba' } });
  fireEvent.click(moments.getByRole('button', { name: /Entrevista y antecedentes/i }));
  expect(screen.getByLabelText('Motivo de consulta')).toHaveValue('Consulta de prueba');
  fireEvent.click(moments.getByRole('button', { name: /Evolución y seguimiento/i }));
  expect(screen.getByLabelText('Evolución / seguimiento')).toHaveValue('Seguimiento de prueba');
});
