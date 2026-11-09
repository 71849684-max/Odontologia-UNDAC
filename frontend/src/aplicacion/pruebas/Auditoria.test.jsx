import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { ProveedorSesion } from '../autenticacion/ContextoSesion.jsx';
import AuditoriaApp from '../formularios/auditoria/AuditoriaApp.jsx';
import * as admin from '../servicios/servicioAdministracion';
import { SESIONES } from './ayudas/sesionDePrueba';

function sesionDe(datos) {
    return {
        usuario: datos.usuario,
        roles: datos.roles ?? [],
        esAdministrador: Boolean(datos.es_administrador),
        permisos: ['BITACORA'],
    };
}

function renderizarAuditoria(sesion = SESIONES.administrador) {
    return render(
        <ProveedorSesion sesionInicial={sesionDe(sesion)}>
            <AuditoriaApp />
        </ProveedorSesion>,
    );
}

vi.mock('../servicios/servicioAdministracion', () => ({
    listarAuditoria: vi.fn(),
}));

beforeEach(() => {
    vi.clearAllMocks();
    admin.listarAuditoria.mockImplementation(async (filtros = {}) => {
        if (filtros.origen === 'acciones') {
            return {
                data: [{
                    id: 12,
                    fecha: '2026-10-19 09:15:00',
                    usuario: 'mquispe',
                    accion: 'INACTIVAR',
                    modulo: 'historia_clinica',
                    registro: '48',
                    historia: 'HC-2026-048',
                    historiaId: 48,
                    ip: '10.0.0.8',
                    tipo_usuario: 'ALUMNO',
                    agente: 'Vitest',
                    valores_anteriores: { estado: 'activa' },
                    valores_nuevos: { estado: 'inactiva' },
                    origen: 'auditoria',
                }],
                accesos_recientes: [],
                acciones: ['INACTIVAR'],
                acciones_acceso: ['INICIAR SESIÓN', 'ACCESO FALLIDO'],
                indicadores: { eventos: 1, modificaciones: 1, accesos_exitosos: 1, accesos_fallidos: 0 },
            };
        }

        return {
            data: [],
            accesos_recientes: [{
                id: 'docente-1',
                fecha: '2026-10-19 08:00:00',
                usuario: 'admin',
                accion: 'INICIAR SESIÓN',
                ip: '127.0.0.1',
                tipo_usuario: 'DOCENTE',
                agente: 'Vitest',
                motivo: null,
                origen: 'login',
            }],
            acciones: ['INACTIVAR'],
            acciones_acceso: ['INICIAR SESIÓN', 'ACCESO FALLIDO'],
            indicadores: { eventos: 1, modificaciones: 1, accesos_exitosos: 1, accesos_fallidos: 0 },
        };
    });
});

test('separa inicios de sesión y acciones, y muestra el detalle al ver más', async () => {
    const usuario = userEvent.setup();
    renderizarAuditoria();

    expect(await screen.findByRole('heading', { name: 'Auditoría del sistema' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Inicios de sesión' })).toHaveAttribute('aria-selected', 'true');
    const tablaSesiones = await screen.findByRole('table');
    expect(within(tablaSesiones).getByText('admin')).toBeInTheDocument();
    expect(within(tablaSesiones).getByText('INICIAR SESIÓN')).toBeInTheDocument();
    expect(screen.queryByText('10.0.0.8')).not.toBeInTheDocument();
    expect(screen.queryByText('INACTIVAR')).not.toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Ver más' }));
    const acceso = await screen.findByRole('dialog', { name: 'Detalle del acceso' });
    expect(within(acceso).getByText('127.0.0.1')).toBeInTheDocument();
    expect(within(acceso).getByText('Navegador no identificado')).toBeInTheDocument();
    await usuario.click(within(acceso).getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await usuario.click(screen.getByRole('tab', { name: 'Acciones en historias' }));
    await waitFor(() => expect(admin.listarAuditoria).toHaveBeenCalledWith(expect.objectContaining({ origen: 'acciones' })));
    const tablaAcciones = await screen.findByRole('table');
    expect(within(tablaAcciones).getByText('mquispe')).toBeInTheDocument();
    expect(within(tablaAcciones).getByText('Eliminar historia clínica (inactivar)')).toBeInTheDocument();
    expect(within(tablaAcciones).getByText('HC-2026-048')).toBeInTheDocument();
    expect(screen.queryByText('admin')).not.toBeInTheDocument();
    expect(within(tablaAcciones).getByRole('columnheader', { name: 'Historia clínica' })).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Ver más' }));
    const accion = await screen.findByRole('dialog', { name: 'Detalle de la acción' });
    expect(within(accion).getAllByText('Historia clínica').length).toBeGreaterThan(0);
    expect(within(accion).getByText('HC-2026-048')).toBeInTheDocument();
    expect(within(accion).getByText('48')).toBeInTheDocument();
    expect(within(accion).getByText(/Inactiva/)).toBeInTheDocument();
});

test('oculta Ver más si la sesión no es de administrador', async () => {
    renderizarAuditoria(SESIONES.docente);

    expect(await screen.findByRole('heading', { name: 'Auditoría del sistema' })).toBeInTheDocument();
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver más' })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Detalle' })).not.toBeInTheDocument();
});

test('muestra quién aprobó o reabrió y la sección en la tabla y el detalle', async () => {
    admin.listarAuditoria.mockImplementation(async (filtros = {}) => ({
        data: filtros.origen === 'acciones' ? [
            { id: 101, usuario: 'profesional.aprobador', accion: 'APROBAR_SECCION', historia: 'HC-2026-001', modulo: 'historia_seccion_estado', valores_anteriores: { anamnesis: 'review' }, valores_nuevos: { anamnesis: 'approved' } },
            { id: 102, usuario: 'administrador.reapertura', accion: 'REABRIR_SECCION', historia: 'HC-2026-001', modulo: 'historia_seccion_estado', valores_anteriores: { odontograma: 'approved' }, valores_nuevos: { odontograma: 'in-progress' } },
        ] : [],
        accesos_recientes: [], acciones: ['APROBAR_SECCION', 'REABRIR_SECCION'],
    }));
    const usuario = userEvent.setup();
    renderizarAuditoria();
    await usuario.click(screen.getByRole('tab', { name: 'Acciones en historias' }));
    const tabla = await screen.findByRole('table');
    expect(within(tabla).getByRole('columnheader', { name: 'Sección / submódulo' })).toBeInTheDocument();
    const aprobacion = within(tabla).getByRole('row', { name: /profesional.aprobador/ });
    expect(within(aprobacion).getByText('Aprobar sección')).toBeInTheDocument();
    expect(within(aprobacion).getByText('Anamnesis y enfermedad actual')).toBeInTheDocument();
    const reapertura = within(tabla).getByRole('row', { name: /administrador.reapertura/ });
    expect(within(reapertura).getByText('Reabrir sección para corregirla')).toBeInTheDocument();
    expect(within(reapertura).getByText('Odontograma digital')).toBeInTheDocument();
    await usuario.click(within(reapertura).getByRole('button', { name: 'Ver más' }));
    const detalle = await screen.findByRole('dialog', { name: 'Detalle de la acción' });
    expect(within(detalle).getByText('administrador.reapertura')).toBeInTheDocument();
    expect(within(detalle).getByText('Sección / submódulo')).toBeInTheDocument();
    expect(within(detalle).getAllByText('Odontograma digital').length).toBeGreaterThan(0);
});
