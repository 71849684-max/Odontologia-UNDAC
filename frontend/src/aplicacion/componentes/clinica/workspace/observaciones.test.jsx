import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import DialogoObservaciones from './DialogoObservaciones.jsx';
import { obtenerHistoria } from '../../../servicios/servicioClinico.js';

vi.mock('../../../servicios/servicioClinico.js', async importar => ({
    ...await importar(), obtenerHistoria: vi.fn(),
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const propiedades = { historia: { id: 9, codigo: 'HC-2026-009', observacion: 'Observación antigua' }, alCerrar: vi.fn() };

test('consulta observaciones actuales y muestra autor y texto', async () => {
    obtenerHistoria.mockResolvedValue({ observaciones: [{ id: 1, docente: 'Ana Rojas', texto: 'Corregir antecedentes', fecha: '2026-11-08 16:00:00' }] });
    render(<DialogoObservaciones {...propiedades} />);
    expect(await screen.findByText('Corregir antecedentes')).toBeInTheDocument();
    expect(screen.getByText('Ana Rojas')).toBeInTheDocument();
    expect(obtenerHistoria).toHaveBeenCalledWith(9);
});
test('muestra el estado vacío si no existen observaciones', async () => {
    obtenerHistoria.mockResolvedValue({ observaciones: [] });
    render(<DialogoObservaciones {...propiedades} />);
    expect(await screen.findByText('No hay observaciones registradas en esta historia clínica.')).toBeInTheDocument();
});
test('no muestra datos locales si el servidor rechaza la consulta', async () => {
    obtenerHistoria.mockRejectedValue(new Error('Sin acceso'));
    render(<DialogoObservaciones {...propiedades} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron consultar');
    expect(screen.queryByText('Observación antigua')).not.toBeInTheDocument();
});
