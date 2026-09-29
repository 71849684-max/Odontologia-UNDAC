import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import DashboardApp from '../paginas/DashboardApp.jsx';
import PacientesApp from '../formularios/busqueda-pacientes/PacientesApp.jsx';
import HistoriasApp from '../formularios/busqueda-historias/HistoriasApp.jsx';
import NotificationMenu from '../componentes/interfaz/NotificationMenu.jsx';
import { obtenerEstadoAcademico } from '../servicios/repositorioAcademicoLocal.js';

beforeEach(() => {
  const storage = new Map([
    ['undac:pacientes:frontend:v1', JSON.stringify([{ id: 1, nombres: 'Andrea Salazar Huamán', dni: '70000001' }])],
    ['undac:academico:frontend:v1', JSON.stringify({ version: 1, personas: [{ nombre: 'María Fernández' }] })],
  ]);
  vi.stubGlobal('localStorage', {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test('las vistas clínicas no muestran registros ficticios ni los conservados en el almacenamiento anterior', () => {
  render(<PacientesApp />);

  expect(screen.getByText('No se encontraron pacientes')).toBeInTheDocument();
  expect(screen.queryByText('Andrea Salazar Huamán')).not.toBeInTheDocument();
  expect(screen.getByText('0 pacientes')).toBeInTheDocument();
  expect(localStorage.getItem('undac:pacientes:frontend:v1')).toBeNull();

  cleanup();
  render(<HistoriasApp rol="administrador" />);

  expect(screen.getByText('No hay historias para mostrar')).toBeInTheDocument();
  expect(screen.queryByText('HC-2026-001')).not.toBeInTheDocument();
});

test('el panel y las notificaciones comienzan sin actividad clínica ficticia', () => {
  render(<DashboardApp rol="administrador" usuario={{ nombre: 'Administrador' }} />);

  expect(within(screen.getByLabelText('Indicadores principales')).getAllByText('0')).toHaveLength(4);
  expect(screen.getByText('No hay actividad clínica registrada.')).toBeInTheDocument();
  expect(screen.getByText('No hay historias clínicas recientes.')).toBeInTheDocument();

  cleanup();
  render(<NotificationMenu />);
  expect(screen.getByLabelText('Notificaciones')).toHaveTextContent('0');
});

test('el repositorio local académico se reinicia vacío en lugar de sembrar cursos, grupos y personas de demostración', () => {
  const estado = obtenerEstadoAcademico();

  expect(estado.personas).toEqual([]);
  expect(estado.cursos).toEqual([]);
  expect(estado.periodos).toEqual([]);
  expect(estado.grupos).toEqual([]);
});
