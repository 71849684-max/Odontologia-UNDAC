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

test('la entrevista comienza directamente en el formulario sin resumen duplicado', () => {
  render(<HistoriaClinica historiaId="1" initialSection="anamnesis" />);

  expect(screen.queryByRole('region', { name: 'Resumen de entrevista' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Motivo de consulta'), { target: { value: 'Control dental' } });
  expect(screen.getByLabelText('Motivo de consulta')).toHaveValue('Control dental');
});

test('el cuestionario comienza en las preguntas y conserva el detalle al cambiar la respuesta', () => {
  render(<HistoriaClinica historiaId="1" initialSection="cuestionario-salud" />);

  expect(screen.queryByText('Cuestionario de salud · 24 preguntas institucionales')).not.toBeInTheDocument();
  expect(screen.queryByRole('list', { name: 'Estado de las 24 preguntas' })).not.toBeInTheDocument();
  const answer = screen.getByRole('group', { name: 'Respuesta de la pregunta 1' });
  fireEvent.click(within(answer).getByRole('radio', { name: 'Sí', exact: true }));
  expect(answer.closest('.undac-clinical-question')).toHaveClass('is-positive');
  fireEvent.change(screen.getByLabelText(/¿Hace qué tiempo/), { target: { value: 'Dos semanas' } });
  fireEvent.click(within(answer).getByRole('radio', { name: 'No', exact: true }));
  expect(screen.queryByLabelText(/¿Hace qué tiempo/)).not.toBeInTheDocument();
  fireEvent.click(within(answer).getByRole('radio', { name: 'Sí', exact: true }));
  expect(screen.getByLabelText(/¿Hace qué tiempo/)).toHaveValue('Dos semanas');
});

test.each(clinicalSections)('abre la sección $id con sus dependencias independientes', ({ id, label }) => {
  expect(componentesSeccion[id]).toBeTypeOf('function');
  render(<HistoriaClinica historiaId="1" initialSection={id} />);
  expect(screen.getByRole('heading', { name: label, level: 2 })).toBeInTheDocument();
  expect(screen.queryByText('Sección preparada para implementación.')).not.toBeInTheDocument();
});

test('muestra y oculta el navegador de los seis momentos con el botón hamburguesa', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  const hide = screen.getByRole('button', { name: 'Ocultar momentos clínicos' });
  expect(hide).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('complementary', { name: 'Momentos de Historia Clínica' })).toBeInTheDocument();

  fireEvent.click(hide);
  expect(screen.getByRole('button', { name: 'Mostrar momentos clínicos' })).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('complementary', { name: 'Momentos de Historia Clínica' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Mostrar momentos clínicos' }));
  const navigation = within(screen.getByRole('complementary', { name: 'Momentos de Historia Clínica' }));
  expect(navigation.getAllByRole('button')).toHaveLength(6);
});

test('el drawer móvil se cierra con Escape o al seleccionar un momento y devuelve el foco', () => {
  vi.stubGlobal('matchMedia', vi.fn((query) => ({
    matches: query.includes('max-width'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })));
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  const trigger = screen.getByRole('button', { name: 'Mostrar momentos clínicos' });
  fireEvent.click(trigger);
  expect(screen.getByRole('button', { name: 'Cerrar momentos clínicos' })).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByRole('complementary', { name: 'Momentos de Historia Clínica' })).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();

  fireEvent.click(trigger);
  const navigation = within(screen.getByRole('complementary', { name: 'Momentos de Historia Clínica' }));
  fireEvent.click(navigation.getByRole('button', { name: /Evaluación estomatológica/i }));
  expect(screen.queryByRole('complementary', { name: 'Momentos de Historia Clínica' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Examen clínico general', level: 2 })).toBeInTheDocument();
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

test.each(clinicalMoments)('omite el encabezado redundante del momento $number', (moment) => {
  render(<HistoriaClinica historiaId="1" initialSection={moment.sections[0]} />);

  expect(screen.queryByText(new RegExp(`Momento clínico\\s+${moment.number}\\s+de\\s+6`, 'i'))).not.toBeInTheDocument();
  expect(screen.queryByRole('status', { name: `Estado de ${moment.label}` })).not.toBeInTheDocument();
});

test('la cabecera clínica conserva paciente y operador sin indicadores redundantes', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  const header = screen.getByRole('banner');
  expect(within(header).getByRole('heading', { name: /Andrea Salazar Huamán/i, level: 1 })).toBeInTheDocument();
  expect(within(header).getByText(/DNI 70000001/i)).toBeInTheDocument();
  expect(within(header).getByText('María Fernández')).toBeInTheDocument();
  expect(within(header).queryByLabelText('Alertas clínicas activas')).not.toBeInTheDocument();
  expect(within(header).queryByLabelText('Progreso de la historia clínica')).not.toBeInTheDocument();
  expect(within(header).queryByLabelText('Autoguardado')).not.toBeInTheDocument();
  expect(within(header).queryByText('Semestre')).not.toBeInTheDocument();
  expect(within(header).queryByText('Estado')).not.toBeInTheDocument();
});

test('cambia el operador desde la cabecera y no repite su ficha al final del formulario', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  const header = screen.getByRole('banner');
  fireEvent.click(within(header).getByRole('button', { name: 'Cambiar asignación' }));
  const search = screen.getByRole('searchbox');
  fireEvent.change(search, { target: { value: '71000002' } });
  fireEvent.click(screen.getByRole('button', { name: /Carlos Rojas/ }));

  expect(within(header).getByText('Carlos Rojas')).toBeInTheDocument();
  expect(within(screen.getByRole('main')).queryByText('Operador responsable')).not.toBeInTheDocument();
});

test('mantiene fijo el contexto de escritorio y desplaza únicamente el contenido clínico', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  expect(screen.getByRole('banner')).toHaveStyle({ position: 'sticky' });
  expect(screen.getByRole('main')).toHaveStyle({ overflowY: 'auto' });
});

test('inicia los datos del paciente directamente en el formulario de identificación', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  expect(screen.queryByLabelText('Ruta de ingreso del paciente')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Identificación del paciente/i })).toBeInTheDocument();
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
