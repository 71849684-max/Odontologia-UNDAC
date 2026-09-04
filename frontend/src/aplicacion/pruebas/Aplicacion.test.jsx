import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { ingresar, renderizarAplicacion, SESIONES } from './ayudas/sesionDePrueba';
import { cerrarSesion, iniciarSesion, obtenerSesion } from '../servicios/servicioAutenticacion';
import * as admin from '../servicios/servicioAdministracion';

vi.mock('../servicios/servicioAutenticacion', () => ({
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
    obtenerSesion: vi.fn(),
}));

vi.mock('../servicios/servicioAdministracion', () => ({
    listarRoles: vi.fn(async () => ({ data: [] })),
    listarUsuarios: vi.fn(async () => ({ data: [], indicadores: {} })),
    crearUsuario: vi.fn(),
    actualizarUsuario: vi.fn(),
    cambiarEstadoUsuario: vi.fn(),
    obtenerPermisosUsuario: vi.fn(async () => ({
        usuario: { id: 1, nombre: 'Admin', roles: ['ADMINISTRADOR'], estado: true },
        catalogo: [],
        del_rol: [],
        efectivos: [],
        adicionales: 0,
    })),
    guardarPermisosUsuario: vi.fn(),
    restaurarPermisosUsuario: vi.fn(),
    listarAuditoria: vi.fn(async () => ({ data: [], accesos_recientes: [], acciones: [], indicadores: {} })),
    listarConfiguracion: vi.fn(async () => ({ data: [] })),
    guardarConfiguracion: vi.fn(),
}));

beforeEach(() => {
    vi.clearAllMocks();
    obtenerSesion.mockResolvedValue(null);
    cerrarSesion.mockResolvedValue({ mensaje: 'Sesion finalizada.' });
    admin.listarRoles.mockResolvedValue({ data: [] });
    admin.listarUsuarios.mockResolvedValue({ data: [], indicadores: {} });
    admin.obtenerPermisosUsuario.mockResolvedValue({
        usuario: { id: 1, nombre: 'Admin', roles: ['ADMINISTRADOR'], estado: true },
        catalogo: [],
        del_rol: [],
        efectivos: [],
        adicionales: 0,
    });
    admin.listarAuditoria.mockResolvedValue({ data: [], accesos_recientes: [], acciones: [], indicadores: {} });
    admin.listarConfiguracion.mockResolvedValue({ data: [] });
});

test('muestra primero el acceso sin selector manual de perfil', async () => {
    await renderizarAplicacion();

    expect(screen.getByRole('heading', { name: /historia clínica digital/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/perfil de demostración/i)).not.toBeInTheDocument();
    expect(screen.getByText(/perfil institucional/i)).toBeInTheDocument();
});

test('el rol lo entrega el backend y permite cerrar sesión', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue(SESIONES.docente);
    await renderizarAplicacion();

    await ingresar(usuario, { nombreUsuario: 'esalazar' });

    expect(iniciarSesion).toHaveBeenCalledWith({
        nombreUsuario: 'esalazar',
        contrasena: 'clave-de-prueba',
    });
    expect(await screen.findByRole('heading', { name: /elena/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /actividad reciente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver pendientes/i })).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(cerrarSesion).toHaveBeenCalled();
    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /historia clínica digital/i })).toBeInTheDocument();
    });
});

test('el sidebar despliega grupos y todas las vistas administrativas muestran contenido', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue(SESIONES.administrador);
    await renderizarAplicacion();

    await ingresar(usuario);
    await screen.findByRole('button', { name: 'Gestión clínica' });

    const gestion = screen.getByRole('button', { name: 'Gestión clínica' });
    expect(gestion).toHaveAttribute('aria-expanded', 'false');
    await usuario.click(gestion);
    expect(gestion).toHaveAttribute('aria-expanded', 'true');
    await usuario.click(screen.getByRole('button', { name: 'Pacientes' }));
    expect(screen.getByRole('heading', { name: 'Pacientes' })).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Administración' }));
    await usuario.click(screen.getByRole('button', { name: 'Usuarios' }));
    expect(screen.getByRole('heading', { name: 'Usuarios' })).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Permisos por usuario' }));
    expect(screen.getByRole('heading', { name: 'Permisos por usuario' })).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Auditoría' }));
    expect(screen.getByRole('heading', { name: 'Auditoría del sistema' })).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Sistema' }));
    await usuario.click(screen.getByRole('button', { name: 'Configuración' }));
    expect(screen.getByRole('heading', { name: 'Configuración' })).toBeInTheDocument();
});
