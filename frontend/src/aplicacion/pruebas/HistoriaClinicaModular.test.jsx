import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import HistoriaClinica from '../componentes/clinica/HistoriaClinica.jsx';
import { clinicalSections } from '../configuracion/historiaClinica.config.mjs';
import { componentesSeccion } from '../formularios/registroFormularios.js';

beforeEach(() => {
  const data = new Map();
  vi.stubGlobal('localStorage', { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)) });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test.each(clinicalSections)('abre la sección $id con sus dependencias independientes', ({ id, label }) => {
  // Renderizar el contenedor detecta imports, ayudas y componentes que no viajaron con la sección.
  expect(componentesSeccion[id]).toBeTypeOf('function');
  render(<HistoriaClinica historiaId="1" initialSection={id} />);
  expect(screen.getByRole('heading', { name: label, level: 2 })).toBeInTheDocument();
  expect(screen.queryByText('Sección preparada para implementación.')).not.toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0);
});

test('al navegar conserva los datos de cada sección y el cambio de módulo no los mezcla', () => {
  render(<HistoriaClinica historiaId="1" initialSection="anamnesis" />);
  fireEvent.change(screen.getByLabelText('Motivo de consulta'), { target: { value: 'Consulta de prueba' } });
  const navigation = within(screen.getByRole('complementary', { name: 'Secciones de Historia Clínica' }));
  fireEvent.click(navigation.getByRole('button', { name: /Seguimiento/ }));
  fireEvent.change(screen.getByLabelText('Evolución / seguimiento'), { target: { value: 'Seguimiento de prueba' } });
  fireEvent.click(navigation.getByRole('button', { name: /Anamnesis/ }));
  expect(screen.getByLabelText('Motivo de consulta')).toHaveValue('Consulta de prueba');
  fireEvent.click(navigation.getByRole('button', { name: /Seguimiento/ }));
  expect(screen.getByLabelText('Evolución / seguimiento')).toHaveValue('Seguimiento de prueba');
});
