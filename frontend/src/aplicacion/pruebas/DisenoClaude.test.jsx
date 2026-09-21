import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import AppLayout from '../disenos/AppLayout.jsx';
import SidebarHC from '../componentes/interfaz/SidebarHC.jsx';
import HeaderBar from '../componentes/interfaz/HeaderBar.jsx';
import { MENU_POR_ROL } from '../configuracion/menuPorRol.js';

afterEach(cleanup);

test('conserva la navegación general y el menú móvil dentro de una historia clínica', () => {
  render(<AppLayout menu={MENU_POR_ROL.administrador} usuario={{ nombre: 'Usuario de prueba' }} rol="administrador" activo="historia-clinica" modoClinico><p>Contenido clínico</p></AppLayout>);
  expect(screen.getByRole('complementary', { name: 'Navegación principal' })).toBeInTheDocument();
  const trigger = screen.getByRole('button', { name: 'Abrir menú' });
  expect(trigger).toHaveAttribute('aria-controls');
  fireEvent.click(trigger);
  expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú lateral' }));
  expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
});

test('muestra todos los grupos del diseño y permite contraerlos independientemente', () => {
  render(<SidebarHC menu={MENU_POR_ROL.administrador} activo="inicio" onSelect={vi.fn()} />);
  const gestion = screen.getByRole('button', { name: 'Gestión clínica' });
  const administracion = screen.getByRole('button', { name: 'Administración' });
  expect(gestion).toHaveAttribute('aria-expanded', 'true');
  expect(administracion).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(gestion);
  expect(gestion).toHaveAttribute('aria-expanded', 'false');
  expect(administracion).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('button', { name: 'Usuarios' })).toBeInTheDocument();
});

test('la búsqueda de cabecera abre la historia encontrada y distingue resultados vacíos', () => {
  const onNavigate = vi.fn();
  render(<HeaderBar usuario={{ nombre: 'Usuario de prueba' }} onNavigate={onNavigate} />);
  const search = screen.getByRole('searchbox', { name: 'Buscar paciente o historia' });
  fireEvent.change(search, { target: { value: '70000001' } });
  const results = screen.getByRole('region', { name: 'Resultados de búsqueda' });
  fireEvent.click(within(results).getByRole('button', { name: /Andrea Salazar/ }));
  expect(onNavigate).toHaveBeenCalledWith({ view: 'historia', historiaId: 1 });
  fireEvent.change(search, { target: { value: 'sin coincidencias' } });
  expect(screen.getByRole('region', { name: 'Resultados de búsqueda' })).toHaveTextContent('Sin resultados');
});
