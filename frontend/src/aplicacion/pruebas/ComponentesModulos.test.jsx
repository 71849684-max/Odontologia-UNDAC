import { render, screen } from '@testing-library/react';
import AgendaSeguimientos from '../componentes/modulos/AgendaSeguimientos';
import BibliotecaRecursos from '../componentes/modulos/BibliotecaRecursos';
import CronologiaEventos from '../componentes/modulos/CronologiaEventos';
import PanelConfiguracion from '../componentes/modulos/PanelConfiguracion';
import TablaRegistros from '../componentes/modulos/TablaRegistros';

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
