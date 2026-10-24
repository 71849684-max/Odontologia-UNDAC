import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import HistoriaClinica from '../componentes/clinica/HistoriaClinica.jsx';
import { datosImpresion, marcar, texto } from '../componentes/clinica/impresion/documentoClinico.mjs';
import { plantillasImpresion } from '../componentes/clinica/impresion/registroImpresion.js';
import { clinicalSections } from '../configuracion/historiaClinica.config.mjs';

const PACIENTE = {
  id: 'p1',
  nombres: 'Ana',
  apellidoPaterno: 'Torres',
  apellidoMaterno: 'Ríos',
  dni: '70000001',
  edad: 30,
  sexo: 'F',
  fechaNacimiento: '1996-01-15',
  telefono: '999888777',
  correo: 'ana@example.com',
};

const HISTORIA = {
  id: 'h1',
  pacienteId: 'p1',
  codigo: 'HC-2026-001',
  operador: 'Luis Asistente',
  docente: 'Elena Profesional',
  fecha: '2026-10-23T10:00',
  estado: 'Borrador',
};

const DATOS = datosImpresion({
  patient: PACIENTE,
  history: HISTORIA,
  meta: { docente: 'Elena Profesional' },
  formData: {
    'datos-paciente': {
      nombres: 'Ana',
      apellidos: 'Torres Ríos',
      dni: '70000001',
      edad: '30',
      sexo: 'F',
      fechaNacimiento: '1996-01-15',
      celular: '999888777',
      correo: 'ana@example.com',
      operador: 'Luis Asistente',
    },
  },
});

beforeEach(() => {
  const data = new Map();
  vi.stubGlobal('localStorage', { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)) });
  localStorage.setItem('undac:pacientes:frontend:v2', JSON.stringify([PACIENTE]));
  localStorage.setItem('undac:historias:frontend:v1', JSON.stringify([HISTORIA]));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test('adapta los datos del paciente y del personal al documento', () => {
  expect(DATOS.paciente.nombreCompleto).toBe('Torres Ríos, Ana');
  expect(DATOS.paciente.dni).toBe('70000001');
  expect(DATOS.paciente.sexo).toBe('Femenino');
  expect(DATOS.operador.nombre).toBe('Luis Asistente');
  expect(DATOS.operador.docente).toBe('Elena Profesional');
  expect(texto('')).toBe('—');
  expect(marcar('Sí', ['Sí', 'No'])).toEqual([
    { etiqueta: 'Sí', marcado: true },
    { etiqueta: 'No', marcado: false },
  ]);
});

test('abre la vista previa con el paciente seleccionado y no imprime hasta confirmar', async () => {
  const imprimir = vi.fn();
  vi.stubGlobal('print', imprimir);
  render(<HistoriaClinica historiaId="h1" initialSection="datos-paciente" />);

  fireEvent.click(screen.getByRole('button', { name: 'Imprimir' }));
  const dialogo = screen.getByRole('dialog', { name: /Vista previa de impresión/ });
  expect(within(dialogo).getAllByText('Torres Ríos, Ana').length).toBeGreaterThan(0);
  expect(within(dialogo).getAllByText('HC-2026-001').length).toBeGreaterThan(0);
  expect(within(dialogo).getAllByText('Luis Asistente').length).toBeGreaterThan(0);
  expect(within(dialogo).getAllByText('Elena Profesional').length).toBeGreaterThan(0);
  expect(imprimir).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'Imprimir documento' }));
  await waitFor(() => expect(imprimir).toHaveBeenCalledTimes(1));
});

test('cierra la vista previa con Escape y devuelve el foco al botón', () => {
  render(<HistoriaClinica historiaId="h1" initialSection="datos-paciente" />);
  const boton = screen.getByRole('button', { name: 'Imprimir' });
  boton.focus();
  fireEvent.click(boton);
  expect(screen.getByRole('dialog', { name: /Vista previa de impresión/ })).toBeInTheDocument();

  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByRole('dialog', { name: /Vista previa de impresión/ })).not.toBeInTheDocument();
  expect(boton).toHaveFocus();
});

test.each(clinicalSections)('la plantilla de $id se renderiza sin errores', ({ id }) => {
  const Plantilla = plantillasImpresion[id];
  expect(Plantilla).toBeTypeOf('function');
  const { container } = render(<Plantilla
    values={{}}
    allFormData={{}}
    patient={PACIENTE}
    history={HISTORIA}
    meta={{ docente: 'Elena Profesional' }}
    datos={DATOS}
    formData={{}}
  />);
  expect(container.querySelector('.doc-hoja')).toBeInTheDocument();
  expect(container.textContent).not.toContain('undefined');
});

test('el consentimiento imprime las nueve cláusulas y el estado de aceptación', () => {
  const Plantilla = plantillasImpresion.consentimiento;
  const { container } = render(<Plantilla
    values={{ consent1: true, consent2: false }}
    allFormData={{}}
    patient={PACIENTE}
    history={HISTORIA}
    meta={{ docente: 'Elena Profesional' }}
    datos={DATOS}
    formData={{}}
  />);
  expect(container.querySelectorAll('.doc-clausulas li')).toHaveLength(9);
  expect(container.querySelectorAll('.doc-clausulas .is-marcado')).toHaveLength(1);
  expect(container.textContent).toContain('Firma del profesional encargado');
  expect(container.textContent).toContain('Firma del acompañante');
});
