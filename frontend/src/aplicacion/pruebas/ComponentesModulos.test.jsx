import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import AgendaSeguimientos from '../componentes/modulos/AgendaSeguimientos';
import BibliotecaRecursos from '../componentes/modulos/BibliotecaRecursos';
import CronologiaEventos from '../componentes/modulos/CronologiaEventos';
import PanelConfiguracion from '../formularios/configuracion-panel/PanelConfiguracion.jsx';
import TablaRegistros from '../componentes/modulos/TablaRegistros';
import HistoriasApp from '../formularios/busqueda-historias/HistoriasApp.jsx';
import PacientesApp from '../formularios/busqueda-pacientes/PacientesApp.jsx';
import '../../css/app.css';

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

test('presenta registros con encabezados semánticos', () => {
    render(
        <TablaRegistros
            columnas={[
                { clave: 'paciente', etiqueta: 'Paciente' },
                { clave: 'estado', etiqueta: 'Estado' },
            ]}
            filas={[{ id: 'r1', paciente: 'Rosa Huamán', estado: 'Activa' }]}
        />,
    );

    expect(screen.getByRole('columnheader', { name: 'Paciente' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Rosa Huamán' })).toBeInTheDocument();
});

test('conserva etiquetas móviles en tablas genéricas', () => {
    const { container } = render(
        <TablaRegistros
            columnas={[
                { clave: 'paciente', etiqueta: 'Paciente' },
                { clave: 'estado', etiqueta: 'Estado' },
            ]}
            filas={[{ id: 'r1', paciente: 'Rosa Huamán', estado: 'Activa' }]}
        />,
    );
    expect(container.querySelector('td[data-label="Paciente"]')).toBeInTheDocument();
    expect(container.querySelector('td[data-label="Estado"]')).toBeInTheDocument();
});

test('las vistas principales aprovechan todo el ancho disponible', () => {
    const { container } = render(<PacientesApp />);
    expect(window.getComputedStyle(container.firstElementChild).width).toBe('100%');
});

test('registra un paciente y continúa con una historia clínica desde el formulario', () => {
    const onNavigate = vi.fn();
    render(<PacientesApp onNavigate={onNavigate} />);

    expect(screen.queryByRole('button', { name: 'Nueva historia' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nueva HC' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo paciente' }));
    expect(screen.getByRole('dialog', { name: 'Registrar nuevo paciente' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nombres'), { target: { value: 'Lucía' } });
    fireEvent.change(screen.getByLabelText('Apellido paterno'), { target: { value: 'Ramos' } });
    fireEvent.change(screen.getByLabelText('Apellido materno'), { target: { value: 'Vega' } });
    fireEvent.change(screen.getByLabelText('Número documento'), { target: { value: '71234567' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '999 111 222' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar paciente y crear historia clínica' }));

    expect(screen.getByRole('cell', { name: /Lucía Ramos Vega/ })).toBeInTheDocument();
    expect(onNavigate).toHaveBeenCalledWith({
        view: 'nueva-historia',
        paciente: expect.objectContaining({
            dni: '71234567',
            nombres: 'Lucía Ramos Vega',
            telefono: '999 111 222',
        }),
    });
});

test('presenta una cronología de auditoría', () => {
    render(
        <CronologiaEventos
            eventos={[{ id: 'e1', titulo: 'Historia actualizada', detalle: 'HC-2026-0048', fecha: 'Hoy, 09:30', tono: 'clinico' }]}
        />,
    );
    expect(screen.getByText('Historia actualizada')).toBeInTheDocument();
});

test('presenta opciones visuales de configuración', () => {
    render(
        <PanelConfiguracion
            grupos={[{ id: 'g1', titulo: 'Notificaciones', opciones: [{ id: 'o1', etiqueta: 'Avisos por correo', activa: true }] }]}
        />,
    );
    expect(screen.getByRole('checkbox', { name: 'Avisos por correo' })).toBeChecked();
});

test('presenta agenda y biblioteca de recursos', () => {
    const { rerender } = render(
        <AgendaSeguimientos
            citas={[{ id: 'c1', hora: '09:30', paciente: 'Ana Salazar', detalle: 'Control periodontal' }]}
        />,
    );
    expect(screen.getByText('Control periodontal')).toBeInTheDocument();

    rerender(
        <BibliotecaRecursos
            recursos={[{ id: 'b1', titulo: 'Protocolo de bioseguridad', categoria: 'Protocolos', formato: 'PDF' }]}
        />,
    );
    expect(screen.getByText('Protocolo de bioseguridad')).toBeInTheDocument();
});
