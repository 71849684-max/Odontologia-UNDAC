import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import HistoriasApp from '../formularios/busqueda-historias/HistoriasApp.jsx';
import * as servicioClinico from '../servicios/servicioClinico.js';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

test('consulta una sola vez al abrir y agrupa la escritura del buscador', async () => {
    vi.useFakeTimers();
    const listar = vi.spyOn(servicioClinico, 'listarHistoriasRemotas').mockResolvedValue([]);
    render(<HistoriasApp rol="alumno" />);
    await act(async () => {});
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(listar).toHaveBeenCalledTimes(1);
    const buscador = screen.getByRole('textbox', { name: 'Buscar historia clínica' });
    fireEvent.change(buscador, { target: { value: 'Car' } });
    fireEvent.change(buscador, { target: { value: 'Carlos' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(250); });
    expect(listar).toHaveBeenCalledTimes(2);
    expect(listar).toHaveBeenLastCalledWith({ q: 'Carlos', estado: undefined });
});

test('descarta respuestas antiguas y distingue los fallos de un listado vacío', async () => {
    vi.useFakeTimers();
    let resolverAnterior;
    const listar = vi.spyOn(servicioClinico, 'listarHistoriasRemotas')
        .mockImplementationOnce(() => new Promise((resolver) => { resolverAnterior = resolver; }))
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error('Conexión interrumpida'))
        .mockResolvedValueOnce([]);
    render(<HistoriasApp rol="alumno" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar historia clínica' }), { target: { value: 'Otro' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(250); });
    await act(async () => { resolverAnterior([{ id: 'antigua', paciente: 'Otro paciente', codigo: 'ANTIGUA' }]); });
    expect(screen.queryByText('ANTIGUA')).not.toBeInTheDocument();
    expect(screen.getByText('No hay historias para mostrar')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar historia clínica' }), { target: { value: '' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(250); });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('No hay historias para mostrar')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar carga' }));
    await act(async () => { await vi.advanceTimersByTimeAsync(250); });
    expect(listar).toHaveBeenCalledTimes(4);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
