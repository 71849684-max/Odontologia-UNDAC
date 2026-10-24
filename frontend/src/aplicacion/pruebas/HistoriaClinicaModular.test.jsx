import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  const answer = screen.getByRole('group', { name: '¿Fue atendido por un médico últimamente?' });
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

test('ubica la hamburguesa en el sidebar de escritorio y la mueve a la cabecera cuando se pliega', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  const header = screen.getByRole('banner');
  const sidebar = screen.getByRole('complementary', { name: 'Momentos de Historia Clínica' });
  const hide = within(sidebar).getByRole('button', { name: 'Ocultar momentos clínicos' });
  expect(hide).toHaveAttribute('aria-expanded', 'true');
  expect(within(header).queryByRole('button', { name: 'Ocultar momentos clínicos' })).not.toBeInTheDocument();

  fireEvent.click(hide);
  const show = within(header).getByRole('button', { name: 'Mostrar momentos clínicos' });
  expect(show).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('complementary', { name: 'Momentos de Historia Clínica' })).not.toBeInTheDocument();

  fireEvent.click(show);
  const navigation = within(screen.getByRole('complementary', { name: 'Momentos de Historia Clínica' }));
  expect(within(navigation.getByRole('navigation', { name: 'Secciones de Historia Clínica' })).getAllByRole('button')).toHaveLength(6);
  expect(navigation.getByRole('button', { name: 'Ocultar momentos clínicos' })).toBeInTheDocument();
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

test('la cabecera clínica no inventa datos de paciente u operador cuando no existe una historia cargada', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  const header = screen.getByRole('banner');
  expect(within(header).getByRole('heading', { name: 'Paciente sin datos', level: 1 })).toBeInTheDocument();
  expect(within(header).getByText(/DNI —/i)).toBeInTheDocument();
  expect(within(header).getByText('Sin asignar')).toBeInTheDocument();
  expect(within(header).queryByLabelText('Alertas clínicas activas')).not.toBeInTheDocument();
  expect(within(header).queryByLabelText('Progreso de la historia clínica')).not.toBeInTheDocument();
  expect(within(header).queryByLabelText('Autoguardado')).not.toBeInTheDocument();
  expect(within(header).queryByText('Semestre')).not.toBeInTheDocument();
  expect(within(header).queryByText('Estado')).not.toBeInTheDocument();
});

test('el selector de operador cierra con Escape y devuelve el foco al botón que lo abrió', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  const trigger = screen.getByRole('button', { name: 'Cambiar asignación' });
  trigger.focus();
  fireEvent.click(trigger);
  expect(screen.getByRole('dialog', { name: 'Cambiar asistente responsable' })).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });

  expect(screen.queryByRole('dialog', { name: 'Cambiar asistente responsable' })).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test('el selector de operador se monta fuera de la cabecera fija', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  fireEvent.click(screen.getByRole('button', { name: 'Cambiar asignación' }));
  const dialog = screen.getByRole('dialog', { name: 'Cambiar asistente responsable' });

  expect(dialog.parentElement).toHaveClass('clinical-operator-modal-overlay');
  expect(dialog.parentElement?.parentElement).toBe(document.body);
});

test('mantiene fijo el contexto de escritorio y desplaza únicamente el contenido clínico', () => {
  const { container } = render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  expect(screen.getByRole('banner')).toHaveStyle({ position: 'sticky' });
  expect(screen.getByRole('main')).toHaveStyle({ overflowY: 'auto' });
  expect(container.querySelector('.clinical-workspace-shell')).toHaveStyle({ display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)' });
  expect(container.querySelector('.clinical-workspace-layout')).not.toHaveStyle({ height: 'calc(100dvh - 73px)' });
});

test('al cambiar de sección reinicia el scroll del contenido clínico', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);
  const main = screen.getByRole('main');
  main.scrollTop = 480;

  fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

  expect(main.scrollTop).toBe(0);
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

test('guarda el diagnóstico desde su ficha y pliega la síntesis y el pronóstico', () => {
  render(<HistoriaClinica historiaId="1" initialSection="diagnostico" />);

  const sintesis = screen.getByRole('button', { name: /Síntesis diagnóstica estructurada/i });
  const pronostico = screen.getByRole('button', { name: /Pronóstico clínico/i });
  expect(sintesis).toHaveAttribute('aria-expanded', 'true');
  expect(pronostico).toHaveAttribute('aria-expanded', 'true');

  fireEvent.click(screen.getByRole('button', { name: 'Registrar diagnóstico' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar diagnóstico' }));
  expect(screen.getByRole('alert')).toHaveTextContent('código CIE-10');

  fireEvent.change(screen.getByLabelText('Código CIE-10 / estomatológico'), { target: { value: 'K02.1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar diagnóstico' }));
  expect(screen.getByText('Diagnóstico guardado')).toBeInTheDocument();

  fireEvent.click(sintesis);
  expect(sintesis).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByLabelText('Código CIE-10 / estomatológico')).not.toBeInTheDocument();
  fireEvent.click(pronostico);
  expect(pronostico).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByLabelText('Pronóstico')).not.toBeInTheDocument();
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

test('no marca la sección completa mientras falten datos obligatorios', () => {
  render(<HistoriaClinica historiaId="1" initialSection="anamnesis" />);
  fireEvent.click(screen.getByRole('button', { name: /Marcar sección completa/ }));
  const resumen = screen.getByRole('alert');
  expect(resumen).toHaveTextContent('El motivo de consulta es obligatorio.');
  expect(screen.getByText('Pendiente', { selector: '.clinical-active-section__state' })).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Motivo de consulta'), { target: { value: 'Dolor en molar' } });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/Historia de la enfermedad/i), { target: { value: 'Dolor de tres días' } });
  fireEvent.click(screen.getByRole('button', { name: /Marcar sección completa/ }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByText('Completo', { selector: '.clinical-active-section__state' })).toBeInTheDocument();
});

test('la pregunta 21 solo aparece cuando el paciente refiere diabetes', () => {
  render(<HistoriaClinica historiaId="1" initialSection="cuestionario-salud" />);
  fireEvent.click(screen.getByRole('button', { name: /Neurológico, endocrino/ }));
  expect(screen.queryByRole('group', { name: 'Si tiene Ud. diabetes, ¿está compensado?' })).not.toBeInTheDocument();
  const q20 = screen.getByRole('group', { name: '¿Ud. sufre o tiene diabetes?' });
  fireEvent.click(within(q20).getByRole('radio', { name: 'Sí', exact: true }));
  expect(screen.getByRole('group', { name: 'Si tiene Ud. diabetes, ¿está compensado?' })).toBeInTheDocument();
  expect(within(screen.getByRole('list', { name: 'Alertas clínicas' })).getByText('Diabetes')).toBeInTheDocument();
});

test('calcula el IMC a partir del peso y la talla', () => {
  render(<HistoriaClinica historiaId="1" initialSection="examen-clinico" />);
  fireEvent.change(screen.getByLabelText('Peso (kg)'), { target: { value: '70' } });
  fireEvent.change(screen.getByLabelText('Talla (m o cm)'), { target: { value: '175' } });
  expect(screen.getByText('22.9 · Normal')).toBeInTheDocument();
});

test('el alumno envía la sección a revisión y el docente la aprueba', async () => {
  const { unmount } = render(<HistoriaClinica historiaId="1" initialSection="anamnesis" rol="alumno" />);
  fireEvent.change(screen.getByLabelText('Motivo de consulta'), { target: { value: 'Control' } });
  fireEvent.change(screen.getByLabelText(/Historia de la enfermedad/i), { target: { value: 'Sin molestias' } });
  expect(screen.queryByRole('button', { name: /Aprobar sección/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Enviar a revisión/ }));
  expect(screen.getByText('En revisión', { selector: '.clinical-active-section__state' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Retomar edición/ })).toBeInTheDocument();
  expect(await screen.findByText(/Sección marcada para revisión|sin servidor no se notifica/i)).toBeInTheDocument();
  await screen.findByText('Guardado solo en este equipo', {}, { timeout: 2000 });
  unmount();

  render(<HistoriaClinica historiaId="1" initialSection="anamnesis" rol="docente" />);
  expect(screen.getByText('En revisión', { selector: '.clinical-active-section__state' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Aprobar sección/ }));
  expect(screen.getByText('Aprobado', { selector: '.clinical-active-section__state' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Reabrir sección/ })).toBeInTheDocument();
  expect(screen.getByLabelText('Motivo de consulta')).toBeEnabled();
  await screen.findByText('Guardado solo en este equipo', {}, { timeout: 2000 });
  cleanup();

  render(<HistoriaClinica historiaId="1" initialSection="anamnesis" rol="alumno" />);
  expect(screen.getByRole('note')).toHaveTextContent('solo lectura');
  expect(screen.getByLabelText('Motivo de consulta')).toBeDisabled();
  expect(screen.queryByRole('button', { name: /Marcar sección completa/ })).not.toBeInTheDocument();
});

test('muestra el estado real del autoguardado y permite imprimir', async () => {
  const imprimir = vi.fn();
  vi.stubGlobal('print', imprimir);
  render(<HistoriaClinica historiaId="1" initialSection="anamnesis" />);
  fireEvent.change(screen.getByLabelText('Motivo de consulta'), { target: { value: 'Control' } });
  expect(await screen.findByText('Guardado solo en este equipo', {}, { timeout: 2000 })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Imprimir' }));
  expect(screen.getByRole('dialog', { name: /Vista previa de impresión/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Imprimir documento' }));
  await waitFor(() => expect(imprimir).toHaveBeenCalled());
});

test('al continuar enfoca y muestra el inicio de la nueva sección', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);
  const main = screen.getByRole('main');
  main.scrollTop = 320;
  fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(main.scrollTop).toBe(0);
  expect(main).toHaveFocus();
  expect(screen.getByRole('heading', { name: 'Anamnesis y enfermedad actual', level: 2 })).toBeInTheDocument();
});
