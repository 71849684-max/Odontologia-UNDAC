import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { ingresar, renderizarAplicacion, SESIONES } from './ayudas/sesionDePrueba';
import { cerrarSesion, iniciarSesion, obtenerSesion } from '../servicios/servicioAutenticacion';
import { ErrorHttp } from '../servicios/clienteHttp';
import { puedeVerRuta, RUTAS_ADMIN } from '../autenticacion/rutasProtegidas';
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
    admin.listarAuditoria.mockResolvedValue({ data: [], accesos_recientes: [], acciones: [], indicadores: {} });
});

test('las credenciales invalidas muestran el error del backend y no abren el panel', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockRejectedValue(
        new ErrorHttp('Los datos proporcionados no son validos.', {
            estado: 422,
            errores: { nombre_usuario: ['Las credenciales no son validas.'] },
        }),
    );
    await renderizarAplicacion();

    await ingresar(usuario, { nombreUsuario: 'admin', contrasena: 'incorrecta' });

    expect(await screen.findByRole('alert')).toHaveTextContent(/credenciales no son validas/i);
    expect(screen.getByRole('heading', { name: /historia clínica digital/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cerrar sesión/i })).not.toBeInTheDocument();
});

test('el bloqueo por intentos fallidos se muestra tal como lo informa el backend', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockRejectedValue(
        new ErrorHttp('Cuenta bloqueada.', {
            estado: 423,
            errores: { nombre_usuario: ['La cuenta esta bloqueada temporalmente por intentos fallidos.'] },
        }),
    );
    await renderizarAplicacion();

    await ingresar(usuario, { contrasena: 'incorrecta' });

    expect(await screen.findByRole('alert')).toHaveTextContent(/bloqueada temporalmente/i);
});

test('una sesion vigente se recupera al recargar sin volver a pedir credenciales', async () => {
    obtenerSesion.mockResolvedValue(SESIONES.administrador);
    await renderizarAplicacion();

    expect(await screen.findByRole('button', { name: 'Administración' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ingresar al sistema/i })).not.toBeInTheDocument();
});

test('un usuario sin rol administrador no puede renderizar las vistas de administracion', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue(SESIONES.alumno);
    await renderizarAplicacion();

    await ingresar(usuario, { nombreUsuario: 'mquispe' });
    await screen.findByRole('button', { name: 'Gestión clínica' });

    // El menu del alumno no ofrece administracion, pero la ruta se puede forzar.
    expect(screen.queryByRole('button', { name: 'Administración' })).not.toBeInTheDocument();

    for (const ruta of RUTAS_ADMIN) {
        await act(async () => {
            window.onNavigate(ruta);
        });

        expect(await screen.findByText(/acceso denegado/i)).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Usuarios' })).not.toBeInTheDocument();
    }
});

test('el administrador si alcanza una vista de administracion forzada por ruta', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue(SESIONES.administrador);
    await renderizarAplicacion();

    await ingresar(usuario);
    await screen.findByRole('button', { name: 'Administración' });

    await act(async () => {
        window.onNavigate('auditoria');
    });

    expect(await screen.findByRole('heading', { name: 'Auditoría del sistema' })).toBeInTheDocument();
    expect(screen.queryByText(/acceso denegado/i)).not.toBeInTheDocument();
});

test('al cerrar sesion se vuelve al acceso aunque el backend falle', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue(SESIONES.administrador);
    cerrarSesion.mockRejectedValue(new ErrorHttp('Sin conexion.', { estado: 500 }));
    await renderizarAplicacion();

    await ingresar(usuario);
    await screen.findByRole('button', { name: /cerrar sesión/i });

    await act(async () => {
        screen.getByRole('button', { name: /cerrar sesión/i }).click();
    });

    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /historia clínica digital/i })).toBeInTheDocument();
    });
});

test('puedeVerRuta solo restringe las rutas del modulo de administracion', () => {
    const administrador = { esAdministrador: true };
    const alumno = { esAdministrador: false };

    expect(puedeVerRuta('inicio', alumno)).toBe(true);
    expect(puedeVerRuta('historias', alumno)).toBe(true);
    expect(puedeVerRuta('usuarios', alumno)).toBe(false);
    expect(puedeVerRuta('usuarios', administrador)).toBe(true);
    expect(puedeVerRuta('usuarios', null)).toBe(false);
});
