import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import AppLayout from '../disenos/AppLayout.jsx';
import SidebarHC from '../componentes/interfaz/SidebarHC.jsx';
import HeaderBar from '../componentes/interfaz/HeaderBar.jsx';
import HistoriasApp from '../formularios/busqueda-historias/HistoriasApp.jsx';
import { MENU_POR_ROL } from '../configuracion/menuPorRol.js';

afterEach(cleanup);

test('aísla la historia clínica de la navegación y cabecera generales', () => {
  render(
    <AppLayout
      menu={MENU_POR_ROL.administrador}
      usuario={{ nombre: 'Usuario de prueba' }}
      rol="administrador"
      activo="historia-clinica"
      modoClinico
    >
      <p>Contenido clínico</p>
    </AppLayout>,
  );

  expect(screen.queryByRole('complementary', { name: 'Navegación principal' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Abrir menú' })).not.toBeInTheDocument();
  expect(screen.queryByRole('searchbox', { name: 'Buscar paciente o historia' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument();
  expect(screen.getByText('Contenido clínico')).toBeInTheDocument();
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

test('la cabecera conserva la identidad y deja las acciones globales fuera del encabezado', () => {
  render(<HeaderBar usuario={{ nombre: 'Usuario de prueba' }} rol="administrador" />);

  const header = screen.getByRole('banner', { name: 'Cabecera de la aplicación' });
  expect(within(header).getByText('Usuario de prueba')).toBeInTheDocument();
  expect(within(header).queryByRole('searchbox')).not.toBeInTheDocument();
  expect(within(header).queryByRole('button', { name: 'Notificaciones' })).not.toBeInTheDocument();
  expect(within(header).queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument();
});

test('el sidebar principal contiene el cierre de sesión y conserva el acceso a crear desde la página', () => {
  const onLogout = vi.fn();
  const onNavigate = vi.fn();
  render(
    <AppLayout
      menu={MENU_POR_ROL.administrador}
      usuario={{ nombre: 'Usuario de prueba' }}
      rol="administrador"
      activo="historias"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <HistoriasApp rol="administrador" onNavigate={onNavigate} />
    </AppLayout>,
  );

  const sidebar = screen.getByRole('complementary', { name: 'Navegación principal' });
  expect(within(sidebar).queryByRole('button', { name: 'Nueva historia clínica' })).not.toBeInTheDocument();
  fireEvent.click(within(sidebar).getByRole('button', { name: 'Cerrar sesión' }));
  expect(onLogout).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByRole('button', { name: 'Nueva historia clínica' }));
  expect(onNavigate).toHaveBeenCalledWith('nueva-historia');
});
