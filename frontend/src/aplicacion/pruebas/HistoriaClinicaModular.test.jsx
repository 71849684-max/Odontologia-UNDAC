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

test('muestra un resumen visible de la atención actual junto al paciente', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  const summary = screen.getByLabelText('Resumen de atención actual');
  expect(summary).toHaveTextContent('Operador');
  expect(summary).toHaveTextContent('María Fernández');
  expect(summary).toHaveTextContent('En registro');
});

test('resume visualmente la ruta de ingreso del paciente', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  const overview = screen.getByLabelText('Ruta de ingreso del paciente');
  expect(overview).toHaveTextContent('Identificación');
  expect(overview).toHaveTextContent('Contacto');
  expect(overview).toHaveTextContent('Residencia');
  expect(overview).toHaveTextContent('Acompañante');
});

test('expone el progreso accesible del momento clínico activo', () => {
  render(<HistoriaClinica historiaId="1" initialSection="anamnesis" />);

  const progress = screen.getByRole('progressbar', {
    name: 'Progreso de Entrevista y antecedentes',
  });

  expect(progress).toHaveAttribute('aria-valuemin', '0');
  expect(progress).toHaveAttribute('aria-valuemax', '100');
  expect(progress).toHaveAttribute('aria-valuenow', '0');
  expect(screen.getByRole('status', { name: 'Estado de Entrevista y antecedentes' }))
    .toHaveTextContent('3 secciones por revisar');
});

test('muestra las evidencias visuales como vistas clínicas pendientes de adjuntar', () => {
  render(<HistoriaClinica historiaId="1" initialSection="examen-intraoral" />);

  fireEvent.click(screen.getByRole('button', { name: /Fotografías intraorales/i }));

  const evidence = screen.getByRole('group', { name: 'Fotografías intraorales' });
  expect(within(evidence).getByText('6 vistas sugeridas')).toBeInTheDocument();
  expect(within(evidence).getAllByText('Pendiente de adjuntar')).toHaveLength(6);
});

test('vincula cada bloque desplegable con su contenido clínico', () => {
  render(<HistoriaClinica historiaId="1" initialSection="anamnesis" />);

  const block = screen.getByRole('button', { name: /Datos psicológicos/i });
  fireEvent.click(block);

  const content = screen.getByRole('region', { name: /Datos psicológicos/i });
  expect(content).toHaveAttribute('id', block.getAttribute('aria-controls'));
});

test('identifica las tarjetas clínicas mediante su encabezado', () => {
  render(<HistoriaClinica historiaId="1" initialSection="diagnostico" />);

  const title = screen.getByRole('heading', { name: 'Síntesis diagnóstica estructurada', level: 3 });
  const card = title.closest('section');
  expect(card).toHaveAttribute('aria-labelledby', title.id);
});

test('presenta las constancias del consentimiento como estados pendientes', () => {
  render(<HistoriaClinica historiaId="1" initialSection="consentimiento" />);

  expect(screen.getAllByText('Constancia pendiente')).toHaveLength(4);
  expect(screen.queryByText('Área reservada')).not.toBeInTheDocument();
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
