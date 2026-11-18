import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import HistoriaClinica from '../componentes/clinica/HistoriaClinica.jsx';
import * as servicio from '../servicios/servicioClinico.js';

let expediente;
let guardar;
beforeEach(() => {
    expediente = {
        historia: { id: 777, codigo: 'HC-SINTETICA', fecha: '2026-11-09T10:00' },
        paciente: { nombres: 'Paciente sintético', dni: '70000777' },
        revision: 'revision-inicial',
        formData: { 'datos-paciente': {}, anamnesis: { motivoConsulta: 'Control', historiaEnfermedad: 'Sin molestias' } },
        sectionStatus: { anamnesis: 'in-progress' },
    };
    vi.spyOn(servicio, 'obtenerExpediente').mockImplementation(async () => expediente);
    guardar = vi.spyOn(servicio, 'guardarExpediente').mockImplementation(async (_id, formData, sectionStatus) => {
        expediente = { ...expediente, formData, sectionStatus, revision: `${expediente.revision}-nueva` };
        return expediente;
    });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

async function abrir() {
    render(<HistoriaClinica historiaId="777" initialSection="anamnesis" rol="docente" />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Motivo de consulta', exact: true })).toHaveValue('Control'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Aprobar sección', exact: true })).toBeEnabled());
}

test('un guardado fallido bloquea la aprobación y permite recuperar el cambio al reintentar', async () => {
    await abrir();
    guardar.mockRejectedValueOnce(new Error('Conexión interrumpida'));
    fireEvent.change(screen.getByLabelText('Motivo de consulta'), { target: { value: 'Control corregido' } });
    expect(screen.getByRole('button', { name: 'Aprobar sección', exact: true })).toBeDisabled();
    expect(await screen.findByText('No se pudo guardar: Conexión interrumpida')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aprobar sección', exact: true })).toBeDisabled();
    expect(expediente.sectionStatus.anamnesis).toBe('in-progress');
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar guardado' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Aprobar sección', exact: true })).toBeEnabled());
    expect(expediente.formData.anamnesis.motivoConsulta).toBe('Control corregido');
});

test('no presenta la sección como aprobada hasta confirmar y conserva la edición si falla', async () => {
    await abrir();
    let rechazar;
    guardar.mockImplementationOnce(() => new Promise((_resolver, fallo) => { rechazar = fallo; }));
    fireEvent.click(screen.getByRole('button', { name: 'Aprobar sección', exact: true }));
    await waitFor(() => expect(rechazar).toBeTypeOf('function'));
    expect(screen.queryByRole('button', { name: 'Reabrir sección' })).not.toBeInTheDocument();
    expect(screen.getByText('En progreso', { selector: '.clinical-active-section__state' })).toBeInTheDocument();
    await act(async () => { rechazar(new Error('El profesional necesita registrar su COP')); });
    expect(await screen.findByText('No se pudo guardar: El profesional necesita registrar su COP')).toBeInTheDocument();
    expect(screen.getByLabelText('Motivo de consulta')).not.toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: 'Reabrir sección' })).not.toBeInTheDocument();
});

test('reabrir conserva el motivo al fallar, confirma antes de editar y permite consultar lo aprobado', async () => {
    await abrir();
    fireEvent.click(screen.getByRole('button', { name: 'Aprobar sección', exact: true }));
    await screen.findByRole('button', { name: 'Reabrir sección', exact: true });
    const campo = screen.getByLabelText('Motivo de consulta');
    expect(campo).toHaveAttribute('readonly');
    campo.focus();
    expect(campo).toHaveFocus();
    const desplegar = screen.getByRole('button', { name: /Motivo de consulta y enfermedad actual/ });
    expect(desplegar).toBeEnabled();
    fireEvent.click(desplegar);
    fireEvent.click(desplegar);
    fireEvent.click(screen.getByRole('button', { name: 'Reabrir sección', exact: true }));
    fireEvent.change(screen.getByLabelText('Motivo de la rectificación'), { target: { value: 'Rectificar información de la consulta' } });
    guardar.mockRejectedValueOnce(new Error('Servidor no disponible'));
    fireEvent.click(screen.getByRole('button', { name: 'Reabrir y conservar el original' }));
    await screen.findByText('Servidor no disponible');
    expect(screen.getByRole('dialog', { name: 'Reabrir sección para corregir' })).toBeInTheDocument();
    expect(campo).toHaveAttribute('readonly');
    expect(expediente.sectionStatus.anamnesis).toBe('approved');
    fireEvent.click(screen.getByRole('button', { name: 'Reabrir y conservar el original' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Reabrir sección para corregir' })).not.toBeInTheDocument());
    expect(screen.getByLabelText('Motivo de consulta')).not.toHaveAttribute('readonly');
    expect(guardar).toHaveBeenLastCalledWith(777, expect.any(Object), expect.objectContaining({ anamnesis: 'in-progress' }), expect.any(String), 'Rectificar información de la consulta');
});
