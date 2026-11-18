import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import NotificationMenu from './NotificationMenu.jsx';
import { listarNotificaciones, marcarNotificacionLeida, marcarTodasNotificacionesLeidas } from '../../servicios/servicioClinico.js';

vi.mock('../../servicios/servicioClinico.js', () => ({
    listarNotificaciones: vi.fn(), marcarNotificacionLeida: vi.fn(), marcarTodasNotificacionesLeidas: vi.fn(),
}));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

test('abre la historia de la notificación después de marcarla como leída', async () => {
    listarNotificaciones.mockResolvedValue([{ id: 7, historiaId: 2, seccion: 'anamnesis', titulo: 'Sección clínica validada', leida: false }]);
    marcarNotificacionLeida.mockResolvedValue({});
    const navegar = vi.fn();
    render(<NotificationMenu onNavigate={navegar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Notificaciones' }));
    fireEvent.click(await screen.findByRole('button', { name: /Sección clínica validada/ }));
    await waitFor(() => expect(navegar).toHaveBeenCalledWith({ view: 'historia', historiaId: 2, section: 'anamnesis' }));
    expect(marcarNotificacionLeida).toHaveBeenCalledWith(7);
});

test('informa del fallo al cargar en lugar de aparentar que no hay avisos', async () => {
    listarNotificaciones.mockRejectedValue(new Error('Sin red'));
    render(<NotificationMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'Notificaciones' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron actualizar');
});

test('un aviso antiguo sin acceso se puede leer sin abrir la historia', async () => {
    listarNotificaciones.mockResolvedValue([{ id: 9, historiaId: null, titulo: 'Cambio de responsable', leida: false }]);
    marcarNotificacionLeida.mockResolvedValue({});
    const navegar = vi.fn();
    render(<NotificationMenu onNavigate={navegar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Notificaciones' }));
    fireEvent.click(await screen.findByRole('button', { name: /Cambio de responsable/ }));
    await waitFor(() => expect(marcarNotificacionLeida).toHaveBeenCalledWith(9));
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Lista de notificaciones' })).not.toBeInTheDocument());
    expect(navegar).not.toHaveBeenCalled();
});

test('marca todos los avisos como leídos', async () => {
    listarNotificaciones.mockResolvedValue([{ id: 7, titulo: 'Historia asignada', leida: false }]);
    marcarTodasNotificacionesLeidas.mockResolvedValue({});
    render(<NotificationMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'Notificaciones' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Marcar todas' }));
    await waitFor(() => expect(screen.getByText('Todo al día')).toBeInTheDocument());
    expect(marcarTodasNotificacionesLeidas).toHaveBeenCalledOnce();
});
