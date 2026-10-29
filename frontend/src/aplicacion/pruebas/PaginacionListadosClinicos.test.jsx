import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import HistoriasApp from '../formularios/busqueda-historias/HistoriasApp.jsx';
import PacientesApp from '../formularios/busqueda-pacientes/PacientesApp.jsx';

function pacientes(cantidad) {
    return Array.from({ length: cantidad }, (_, indice) => {
        const numero = String(indice + 1).padStart(2, '0');
        return {
            id: `p-${numero}`,
            nombres: `Paciente ${numero}`,
            dni: `700000${numero}`,
            edad: 30,
            sexo: 'F',
            telefono: '999000000',
            estado: 'Registrado',
            hc: '',
            historias: 0,
            ultimaAtencion: 'Sin atención',
        };
    });
}

function historias(cantidad) {
    return Array.from({ length: cantidad }, (_, indice) => {
        const numero = String(indice + 1).padStart(2, '0');
        return {
            id: `hc-${numero}`,
            codigo: `HC-2026-${numero}`,
            paciente: `Paciente ${numero}`,
            dni: `700000${numero}`,
            operador: 'Asistente',
            docente: 'Docente',
            progreso: 10,
            estado: 'Borrador',
            fecha: '2026-10-01',
        };
    });
}

beforeEach(() => {
    const data = new Map();
    vi.stubGlobal('localStorage', {
        getItem: (key) => data.get(key) ?? null,
        setItem: (key, value) => data.set(key, String(value)),
        removeItem: (key) => data.delete(key),
    });
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

test('el listado de pacientes muestra 10 registros y pasa a la página siguiente', async () => {
    const usuario = userEvent.setup();
    window.localStorage.setItem('undac:pacientes:frontend:v2', JSON.stringify(pacientes(12)));
    render(<PacientesApp />);

    await screen.findByText(/Sin conexión al servidor/);
    expect(screen.getByRole('navigation', { name: 'Paginación de pacientes' })).toBeInTheDocument();
    expect(screen.getByText('Mostrando 1–10 de 12 pacientes')).toBeInTheDocument();
    expect(screen.getByText('Paciente 01')).toBeInTheDocument();
    expect(screen.getByText('Paciente 10')).toBeInTheDocument();
    expect(screen.queryByText('Paciente 11')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Registros por página')).not.toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(screen.getByText('Mostrando 11–12 de 12 pacientes')).toBeInTheDocument();
    expect(screen.getByText('Paciente 11')).toBeInTheDocument();
    expect(screen.getByText('Paciente 12')).toBeInTheDocument();
    expect(screen.queryByText('Paciente 01')).not.toBeInTheDocument();
});

test('el listado de historias clínicas muestra 10 registros y pasa a la página siguiente', async () => {
    const usuario = userEvent.setup();
    window.localStorage.setItem('undac:historias:frontend:v1', JSON.stringify(historias(12)));
    render(<HistoriasApp rol="alumno" />);

    expect(await screen.findByRole('navigation', { name: 'Paginación de historias' })).toBeInTheDocument();
    expect(screen.getByText('Mostrando 1–10 de 12 historias')).toBeInTheDocument();
    expect(screen.getByText('HC-2026-01')).toBeInTheDocument();
    expect(screen.getByText('HC-2026-10')).toBeInTheDocument();
    expect(screen.queryByText('HC-2026-11')).not.toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(screen.getByText('Mostrando 11–12 de 12 historias')).toBeInTheDocument();
    expect(screen.getByText('HC-2026-11')).toBeInTheDocument();
    expect(screen.getByText('HC-2026-12')).toBeInTheDocument();
    expect(screen.queryByText('HC-2026-01')).not.toBeInTheDocument();
});
