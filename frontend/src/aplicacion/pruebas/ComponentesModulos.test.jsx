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

test('historias mantiene datos y acción al transformarse visualmente en tarjetas', () => {
    const onNavigate = vi.fn();
    const { container } = render(<HistoriasApp rol="administrador" onNavigate={onNavigate} />);
    for (const label of ['N.º historia', 'Paciente', 'Operador', 'Docente', 'Progreso', 'Estado', 'Fecha', 'Acciones']) {
        expect(container.querySelector(`td[data-label="${label}"]`)).toBeInTheDocument();
    }
    fireEvent.click(screen.getAllByRole('button', { name: 'Abrir' })[0]);
    expect(onNavigate).toHaveBeenCalledWith({ view: 'historia', historiaId: 1, section: 'datos-paciente' });
});

test('registra un paciente independiente, sin crear historia, y lo recupera del almacenamiento local', () => {
    window.localStorage.setItem('undac:pacientes:frontend:v1', '[]');
    const { unmount } = render(<PacientesApp />);
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo paciente' }));

    const dialog = screen.getByRole('dialog', { name: 'Registrar nuevo paciente' });
    fireEvent.change(screen.getByLabelText('Nombres'), { target: { value: 'Lucía' } });
    fireEvent.change(screen.getByLabelText('Apellido paterno'), { target: { value: 'Ramos' } });
    fireEvent.change(screen.getByLabelText('Apellido materno'), { target: { value: 'Vega' } });
    fireEvent.change(screen.getByLabelText('Número documento'), { target: { value: '71234567' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '999 111 222' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar paciente' }));

    expect(dialog).not.toBeInTheDocument();
    const row = screen.getByRole('cell', { name: /Lucía Ramos Vega/ }).closest('tr');
    expect(row).toHaveTextContent('71234567');
    expect(row).toHaveTextContent('Sin historia');
    expect(row).toHaveTextContent('Sin atención');
    expect(row).not.toHaveTextContent('HC-');
    expect(JSON.parse(window.localStorage.getItem('undac:pacientes:frontend:v1'))).toHaveLength(1);

    unmount();
    render(<PacientesApp />);
    expect(screen.getByRole('cell', { name: /Lucía Ramos Vega/ })).toBeInTheDocument();
});

test('las vistas principales aprovechan todo el ancho disponible', () => {
    const { container } = render(<PacientesApp />);
    expect(window.getComputedStyle(container.firstElementChild).width).toBe('100%');
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
