import { act, screen, waitFor, within } from '@testing-library/react';
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
    listarRoles: vi.fn(),
    listarUsuarios: vi.fn(),
    crearUsuario: vi.fn(),
    actualizarUsuario: vi.fn(),
    cambiarEstadoUsuario: vi.fn(),
    obtenerUsuario: vi.fn(),
    restablecerContrasenaUsuario: vi.fn(),
    obtenerPermisosUsuario: vi.fn(),
    guardarPermisosUsuario: vi.fn(),
    restaurarPermisosUsuario: vi.fn(),
    obtenerPermisosRol: vi.fn(),
    guardarPermisosRol: vi.fn(),
    listarAuditoria: vi.fn(),
    listarConfiguracion: vi.fn(),
    guardarConfiguracion: vi.fn(),
}));

const USUARIO_DEMO = {
    id: 3,
    nombre_usuario: 'admin',
    nombre: 'Carlos Mendoza',
    nombres: 'Carlos',
    apellidos: 'Mendoza',
    tipo_documento: 'DNI',
    numero_documento: '00000001',
    correo: 'admin@undac.edu.pe',
    telefono: null,
    estado: true,
    bloqueado: false,
    codigo_rol: 'ADMINISTRADOR',
    rol: 'Administrador',
    roles: ['ADMINISTRADOR'],
    ultimo_inicio_sesion: null,
};

beforeEach(() => {
    vi.clearAllMocks();
    obtenerSesion.mockResolvedValue(null);
    cerrarSesion.mockResolvedValue({ mensaje: 'Sesion finalizada.' });
    admin.listarRoles.mockResolvedValue({
        data: [
            { codigo: 'ADMINISTRADOR', nombre: 'Administrador' },
            { codigo: 'DOCENTE', nombre: 'Docente' },
            { codigo: 'ALUMNO_OPERADOR', nombre: 'Alumno operador' },
        ],
    });
    admin.listarUsuarios.mockResolvedValue({
        data: [USUARIO_DEMO],
        indicadores: { total: 1, activos: 1, alumnos: 0, docentes: 0, administradores: 1, administrativos: 0 },
    });
    admin.obtenerPermisosUsuario.mockResolvedValue({
        usuario: { id: 3, nombre: 'Carlos Mendoza', nombre_usuario: 'admin', roles: ['ADMINISTRADOR'], estado: true },
        catalogo: [
            { id: 1, codigo: 'INICIO.VER', nombre: 'Ver modulo', accion: 'VER', modulo: 'Inicio', seccion: 'Inicio' },
            { id: 2, codigo: 'AUDITORIA.VER', nombre: 'Ver modulo', accion: 'VER', modulo: 'Auditoria', seccion: 'Auditoria' },
        ],
        del_rol: [1, 2],
        efectivos: [1, 2],
        adicionales: 0,
    });
    admin.listarAuditoria.mockResolvedValue({
        data: [{ id: 1, fecha: '2026-09-04 10:00:00', usuario: 'admin', accion: 'INACTIVAR', modulo: 'historia_clinica', registro: '3', ip: '127.0.0.1' }],
        accesos_recientes: [{ id: 'docente-1', fecha: '2026-09-04 09:00:00', usuario: 'admin', accion: 'INICIAR SESIÓN', ip: '127.0.0.1' }],
        acciones: ['INACTIVAR'],
        acciones_acceso: ['INICIAR SESIÓN', 'ACCESO FALLIDO'],
        indicadores: { eventos: 1, accesos_exitosos: 0, accesos_fallidos: 0, modificaciones: 1 },
    });
    admin.listarConfiguracion.mockResolvedValue({
        data: [
            { id: 1, codigo: 'NOMBRE_INSTITUCION', nombre: 'Nombre de la institucion', valor: 'UNDAC', tipo: 'TEXTO', descripcion: 'Nombre institucional.' },
        ],
    });
    admin.guardarConfiguracion.mockResolvedValue({
        data: [
            { id: 1, codigo: 'NOMBRE_INSTITUCION', nombre: 'Nombre de la institucion', valor: 'Clinica UNDAC', tipo: 'TEXTO', descripcion: 'Nombre institucional.' },
        ],
    });
});

test('el administrador gestiona usuarios desde la API de administracion', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue(SESIONES.administrador);
    await renderizarAplicacion();
    await ingresar(usuario);

    expect(await screen.findByRole('button', { name: 'Administración' })).toHaveAttribute('aria-expanded', 'true');
    await usuario.click(screen.getByRole('button', { name: 'Usuarios' }));

    expect(await screen.findByRole('heading', { name: 'Usuarios' })).toBeInTheDocument();
    await waitFor(() => expect(admin.listarUsuarios).toHaveBeenCalled());
    expect(await screen.findByText('admin')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Registrar usuario' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
});

test('el administrador ve permisos, auditoria y configuracion reales', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue(SESIONES.administrador);
    await renderizarAplicacion();
    await ingresar(usuario);

    await act(async () => { window.onNavigate('permisos-usuarios'); });
    expect(await screen.findByRole('heading', { name: 'Permisos por usuario' })).toBeInTheDocument();
    await waitFor(() => expect(admin.obtenerPermisosUsuario).toHaveBeenCalled());

    await act(async () => { window.onNavigate('auditoria'); });
    expect(await screen.findByRole('heading', { name: 'Auditoría del sistema' })).toBeInTheDocument();
    await waitFor(() => expect(admin.listarAuditoria).toHaveBeenCalled());

    await act(async () => { window.onNavigate('configuracion'); });
    expect(await screen.findByRole('heading', { name: 'Configuración' })).toBeInTheDocument();
    await waitFor(() => expect(admin.listarConfiguracion).toHaveBeenCalled());
    expect(await screen.findByDisplayValue('UNDAC')).toBeInTheDocument();
});

test('los permisos usan maestro detalle paginado y despliegan módulos en línea', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue(SESIONES.administrador);
    await renderizarAplicacion();
    await ingresar(usuario);
    await act(async () => { window.onNavigate('permisos-usuarios'); });

    expect(await screen.findByRole('navigation', { name: 'Paginación de usuarios' })).toBeInTheDocument();
    const botonesInicio = screen.getAllByRole('button', { name: /Inicio/ });
    await usuario.click(botonesInicio.at(-1));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Inicio/ })).toBeInTheDocument();
});

test('permite elegir un usuario y guardar sus permisos desde módulos con progreso', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue(SESIONES.administrador);
    admin.listarUsuarios.mockResolvedValueOnce({
        data: [
            USUARIO_DEMO,
            { ...USUARIO_DEMO, id: 4, nombre: 'Elena Vargas', nombre_usuario: 'elena', rol: 'Docente', roles: ['DOCENTE'], correo: 'elena@undac.edu.pe' },
        ],
        indicadores: { total: 2, activos: 2 },
    });
    admin.obtenerPermisosUsuario.mockImplementation(async (id) => ({
        usuario: id === 4
            ? { id: 4, nombre: 'Elena Vargas', nombre_usuario: 'elena', roles: ['DOCENTE'], estado: true, correo: 'elena@undac.edu.pe' }
            : { id: 3, nombre: 'Carlos Mendoza', nombre_usuario: 'admin', roles: ['ADMINISTRADOR'], estado: true, correo: 'admin@undac.edu.pe' },
        catalogo: [
            { id: 1, codigo: 'PACIENTES.VER', nombre: 'Ver pacientes', accion: 'VER', modulo: 'Pacientes', seccion: 'Ver pacientes' },
            { id: 2, codigo: 'PACIENTES.EDITAR', nombre: 'Editar pacientes', accion: 'EDITAR', modulo: 'Pacientes', seccion: 'Editar pacientes' },
        ],
        del_rol: [1, 2],
        efectivos: [1, 2],
    }));
    admin.guardarPermisosUsuario.mockResolvedValue({ del_rol: [1, 2], efectivos: [2] });

    await renderizarAplicacion();
    await ingresar(usuario);
    await act(async () => { window.onNavigate('permisos-usuarios'); });

    const lista = await screen.findByRole('complementary', { name: 'Usuarios con permisos' });
    await usuario.click(within(lista).getByRole('button', { name: /Elena Vargas/ }));
    expect(await screen.findByRole('heading', { name: 'Elena Vargas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver perfil' })).toBeInTheDocument();

    expect(screen.getAllByRole('main')).toHaveLength(1);
    const editor = screen.getByRole('region', { name: 'Editor de permisos' });
    await usuario.click(within(editor).getByRole('button', { name: /Pacientes/ }));
    expect(within(editor).getByRole('progressbar', { name: 'Permisos activos de Pacientes' })).toHaveAttribute('aria-valuenow', '2');
    await usuario.click(within(editor).getByRole('checkbox', { name: 'Ver pacientes' }));
    await usuario.click(within(editor).getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(admin.guardarPermisosUsuario).toHaveBeenCalledWith(4, [2]));
});

test('ver perfil desde permisos muestra la ficha del usuario seleccionado, no la propia', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue(SESIONES.administrador);
    admin.obtenerUsuario.mockResolvedValue({
        ...USUARIO_DEMO,
        nombre: 'Carlos Mendoza',
        telefono: '999 000 111',
        ultimo_inicio_sesion: null,
    });

    await renderizarAplicacion();
    await ingresar(usuario);
    await act(async () => { window.onNavigate('permisos-usuarios'); });

    await usuario.click(await screen.findByRole('button', { name: 'Ver perfil' }));

    const ficha = await screen.findByRole('dialog', { name: 'Carlos Mendoza' });
    expect(admin.obtenerUsuario).toHaveBeenCalledWith(3);
    expect(within(ficha).getByRole('heading', { name: 'Carlos Mendoza' })).toBeInTheDocument();
    expect(within(ficha).queryByText(/Perfil de/)).not.toBeInTheDocument();
    expect(within(ficha).getByText('999 000 111')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Mi perfil' })).not.toBeInTheDocument();

    await usuario.click(within(ficha).getByRole('button', { name: 'Cerrar perfil' }));
    expect(screen.queryByRole('dialog', { name: 'Carlos Mendoza' })).not.toBeInTheDocument();
});

test('el administrador restablece la contraseña de un usuario', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue(SESIONES.administrador);
    admin.restablecerContrasenaUsuario.mockResolvedValue(USUARIO_DEMO);

    await renderizarAplicacion();
    await ingresar(usuario);
    await usuario.click(await screen.findByRole('button', { name: 'Usuarios' }));
    await usuario.click(await screen.findByRole('button', { name: 'Restablecer contraseña de admin' }));

    const dialogo = await screen.findByRole('dialog', { name: 'Restablecer contraseña' });
    await usuario.type(within(dialogo).getByLabelText('Contraseña temporal'), 'corta');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Restablecer' }));
    expect(within(dialogo).getByRole('alert')).toHaveTextContent('al menos 8 caracteres');
    expect(admin.restablecerContrasenaUsuario).not.toHaveBeenCalled();

    await usuario.clear(within(dialogo).getByLabelText('Contraseña temporal'));
    await usuario.type(within(dialogo).getByLabelText('Contraseña temporal'), 'Temporal2026');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Restablecer' }));

    await waitFor(() => expect(admin.restablecerContrasenaUsuario).toHaveBeenCalledWith(3, 'Temporal2026'));
    expect(await screen.findByText(/Contraseña restablecida para admin/)).toBeInTheDocument();
});

test('guarda la plantilla de permisos del rol docente', async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue(SESIONES.administrador);
    admin.obtenerPermisosRol.mockResolvedValue({
        rol: { codigo: 'DOCENTE', nombre: 'Docente', descripcion: 'Docente de la clínica' },
        catalogo: [
            { id: 2, codigo: 'PACIENTES', nombre: 'Pacientes', accion: 'Acceder', modulo: 'Pacientes', seccion: 'Pacientes' },
            { id: 3, codigo: 'HISTORIAS', nombre: 'Historias clínicas', accion: 'Acceder', modulo: 'Historia clínica', seccion: 'Historias clínicas' },
        ],
        efectivos: [2, 3],
    });
    admin.guardarPermisosRol.mockResolvedValue({
        rol: { codigo: 'DOCENTE', nombre: 'Docente', descripcion: 'Docente de la clínica' },
        catalogo: [
            { id: 2, codigo: 'PACIENTES', nombre: 'Pacientes', accion: 'Acceder', modulo: 'Pacientes', seccion: 'Pacientes' },
            { id: 3, codigo: 'HISTORIAS', nombre: 'Historias clínicas', accion: 'Acceder', modulo: 'Historia clínica', seccion: 'Historias clínicas' },
        ],
        efectivos: [3],
    });

    await renderizarAplicacion();
    await ingresar(usuario);
    await act(async () => { window.onNavigate('permisos-usuarios'); });
    await usuario.click(await screen.findByRole('tab', { name: 'Por rol' }));
    await usuario.click(await screen.findByRole('button', { name: /Docente/ }));

    const editor = await screen.findByRole('region', { name: 'Editor de permisos' });
    expect(within(editor).getByRole('heading', { name: 'Docente' })).toBeInTheDocument();
    await usuario.click(within(editor).getByRole('button', { name: /Pacientes/ }));
    await usuario.click(within(editor).getByRole('checkbox', { name: 'Pacientes' }));
    await usuario.click(within(editor).getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(admin.guardarPermisosRol).toHaveBeenCalledWith('DOCENTE', [3]));
    expect(admin.guardarPermisosUsuario).not.toHaveBeenCalled();
});
