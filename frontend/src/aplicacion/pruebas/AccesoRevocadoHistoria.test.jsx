import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import HistoriaClinica from '../componentes/clinica/HistoriaClinica.jsx';
import * as servicio from '../servicios/servicioClinico.js';
import { ErrorHttp } from '../servicios/clienteHttp.js';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

test.each([401, 403, 404])('bloquea el expediente y elimina el borrador local cuando el servidor devuelve %s', async (estado) => {
    const borrar = vi.fn();
    vi.stubGlobal('localStorage', {
        getItem: () => JSON.stringify({ formData: { anamnesis: { motivoConsulta: 'Dato guardado antes del cambio de asistente' } } }),
        setItem: vi.fn(), removeItem: borrar,
    });
    vi.spyOn(servicio, 'obtenerExpediente').mockRejectedValue(new ErrorHttp('Sin acceso', { estado }));
    const guardar = vi.spyOn(servicio, 'guardarExpediente');
    render(<HistoriaClinica historiaId="7" initialSection="anamnesis" rol="alumno" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya no tiene acceso');
    expect(screen.queryByLabelText('Motivo de consulta')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver a historias clínicas' })).toHaveAttribute('href', '#/historias');
    expect(borrar).toHaveBeenCalledWith('undac:hc:workspace:v3:7');
    expect(guardar).not.toHaveBeenCalled();
});
