import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import NuevaHistoriaApp from './NuevaHistoriaApp.jsx';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

test('crea la historia desde los datos mínimos sin pedir contexto académico duplicado', () => {
  const onCreated = vi.fn();
  render(<NuevaHistoriaApp onCreated={onCreated} />);

  expect(screen.getByRole('heading', { name: 'Datos mínimos del paciente', level: 3 })).toBeInTheDocument();
  expect(screen.queryByLabelText('Semestre')).not.toBeInTheDocument();
  expect(screen.queryByText('Confirmar')).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '70000001' } });
  fireEvent.change(screen.getByLabelText('Apellidos y nombres'), { target: { value: 'Andrea Salazar Huamán' } });
  fireEvent.click(screen.getByRole('button', { name: /Crear y abrir historia/i }));

  expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({
    dni: '70000001',
    nombres: 'Andrea Salazar Huamán',
    pacienteId: 1,
    estado: 'Borrador',
  }));
  const historias = JSON.parse(localStorage.getItem('undac:historias:frontend:v1'));
  expect(historias).toEqual([expect.objectContaining({ id: onCreated.mock.calls[0][0].id, pacienteId: 1 })]);
});
