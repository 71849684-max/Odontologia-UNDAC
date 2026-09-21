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

test('el resumen de entrevista refleja el motivo editado sin sustituir el formulario', () => {
  render(<HistoriaClinica historiaId="1" initialSection="anamnesis" />);
  const summary = screen.getByRole('region', { name: 'Resumen de entrevista' });
  expect(summary).toHaveTextContent('Motivo pendiente de registrar');
  fireEvent.change(screen.getByLabelText('Motivo de consulta'), { target: { value: 'Control dental' } });
  expect(summary).toHaveTextContent('Control dental');
  expect(summary).toHaveTextContent('0 de 24 respondidas');
});

test('la matriz refleja Sí y No y conserva el detalle al cambiar la respuesta', () => {
  render(<HistoriaClinica historiaId="1" initialSection="cuestionario-salud" />);
  const matrix = screen.getByRole('list', { name: 'Estado de las 24 preguntas' });
  expect(within(matrix).getAllByRole('listitem')).toHaveLength(24);
  const answer = screen.getByRole('group', { name: 'Respuesta de la pregunta 1' });
  fireEvent.click(within(answer).getByRole('radio', { name: 'Sí', exact: true }));
  expect(answer.closest('.undac-clinical-question')).toHaveClass('is-positive');
  fireEvent.change(screen.getByLabelText(/¿Hace qué tiempo/), { target: { value: 'Dos semanas' } });
  expect(within(matrix).getAllByRole('listitem')[0]).toHaveTextContent('Sí');
  expect(screen.getByRole('region', { name: 'Resumen de entrevista' })).toHaveTextContent('1 de 24 respondidas');
  fireEvent.click(within(answer).getByRole('radio', { name: 'No', exact: true }));
  expect(screen.queryByLabelText(/¿Hace qué tiempo/)).not.toBeInTheDocument();
  expect(within(matrix).getAllByRole('listitem')[0]).toHaveTextContent('No');
  fireEvent.click(within(answer).getByRole('radio', { name: 'Sí', exact: true }));
  expect(screen.getByLabelText(/¿Hace qué tiempo/)).toHaveValue('Dos semanas');
});

test.each(clinicalSections)('abre la sección $id con sus dependencias independientes', ({ id, label }) => {
  expect(componentesSeccion[id]).toBeTypeOf('function');
  render(<HistoriaClinica historiaId="1" initialSection={id} />);
  expect(screen.getByRole('heading', { name: label, level: 2 })).toBeInTheDocument();
  expect(screen.queryByText('Sección preparada para implementación.')).not.toBeInTheDocument();
});

test('el selector compacto de momentos reutiliza la navegación clínica', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);
  const trigger = screen.getByRole('button', { name: /1 de 6.*Ingreso y filiación/i });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(trigger);
  const mobileNav = screen.getByRole('region', { name: 'Cambiar momento clínico' });
  expect(within(mobileNav).getAllByRole('button')).toHaveLength(6);
  fireEvent.click(within(mobileNav).getByRole('button', { name: /Evaluación estomatológica/i }));
  expect(screen.getByRole('heading', { name: 'Evaluación estomatológica', level: 2 })).toBeInTheDocument();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('el selector compacto de secciones cambia la sección sin duplicar estado', () => {
  render(<HistoriaClinica historiaId="1" initialSection="examen-intraoral" />);
  const trigger = screen.getByRole('button', { name: /Intraoral.*3 de 5/i });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(trigger);
  const selector = screen.getByRole('region', { name: 'Cambiar sección clínica' });
  fireEvent.click(within(selector).getByRole('button', { name: /Odontograma/i }));
  expect(screen.getByRole('heading', { name: 'Odontograma digital', level: 2 })).toBeInTheDocument();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('la navegación primaria se reduce a seis momentos clínicos', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);
  const navigation = within(screen.getByRole('complementary', { name: 'Momentos de Historia Clínica' }));
  for (const moment of clinicalMoments) expect(navigation.getByRole('button', { name: new RegExp(moment.label, 'i') })).toBeInTheDocument();
  expect(clinicalMoments).toHaveLength(6);
});

test('conserva contexto, alertas, progreso y autoguardado del paciente', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);
  expect(screen.getByRole('heading', { name: /Andrea Salazar Huamán/i, level: 1 })).toBeInTheDocument();
  expect(screen.getByText(/HC-2026-001/i)).toBeInTheDocument();
  expect(screen.getByLabelText('Alertas clínicas activas')).toBeInTheDocument();
  expect(screen.getByLabelText('Progreso de la historia clínica')).toHaveAttribute('aria-valuemin', '0');
  expect(screen.getByLabelText('Autoguardado')).toBeInTheDocument();
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

test('el resumen terapéutico distingue pendiente, respuesta negativa y detalle registrado', () => {
  render(<HistoriaClinica historiaId="1" initialSection="antecedentes" />);
  const summary = screen.getByRole('region', { name: 'Resumen de antecedentes terapéuticos' });
  expect(within(summary).getAllByText('Pendiente de preguntar')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: /Antecedentes terapéuticos/i }));
  const answer = screen.getByRole('group', { name: '¿Es alérgico a algún medicamento?' });
  fireEvent.click(within(answer).getByRole('radio', { name: 'No', exact: true }));
  expect(summary).toHaveTextContent('No refiere');
  fireEvent.click(within(answer).getByRole('radio', { name: 'Sí', exact: true }));
  expect(summary).toHaveTextContent('Sí · detalle pendiente');
  fireEvent.change(screen.getByLabelText(/Medicamento \/ detalle/), { target: { value: 'Detalle de prueba' } });
  expect(summary).toHaveTextContent('Detalle de prueba');
  expect(summary).not.toHaveTextContent('No refiere');
});

test('al continuar enfoca y muestra el inicio de la nueva sección', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);
  const main = screen.getByRole('main');
  main.scrollIntoView = vi.fn();
  fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(main.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' });
  expect(main).toHaveFocus();
  expect(screen.getByRole('heading', { name: 'Anamnesis y enfermedad actual', level: 2 })).toBeInTheDocument();
});
