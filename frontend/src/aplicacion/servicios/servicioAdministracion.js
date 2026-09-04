import { clienteHttp } from './clienteHttp';

function consulta(params = {}) {
    const entradas = Object.entries(params).filter(([, valor]) => valor !== undefined && valor !== null && valor !== '');
    if (!entradas.length) return '';
    return `?${new URLSearchParams(entradas).toString()}`;
}

export function obtenerResumenAdmin() {
    return clienteHttp.obtener('/admin/resumen');
}

export function listarRoles() {
    return clienteHttp.obtener('/admin/roles');
}

export function listarUsuarios(filtros = {}) {
    return clienteHttp.obtener(`/admin/usuarios${consulta(filtros)}`);
}

export function obtenerUsuario(id) {
    return clienteHttp.obtener(`/admin/usuarios/${id}`);
}

export function crearUsuario(datos) {
    return clienteHttp.enviar('/admin/usuarios', datos);
}

export function actualizarUsuario(id, datos) {
    return clienteHttp.actualizar(`/admin/usuarios/${id}`, datos);
}

export function cambiarEstadoUsuario(id, estado) {
    return clienteHttp.parchear(`/admin/usuarios/${id}/estado`, { estado });
}

export function obtenerPermisosUsuario(id) {
    return clienteHttp.obtener(`/admin/usuarios/${id}/permisos`);
}

export function guardarPermisosUsuario(id, permisos) {
    return clienteHttp.actualizar(`/admin/usuarios/${id}/permisos`, { permisos });
}

export function restaurarPermisosUsuario(id) {
    return clienteHttp.eliminar(`/admin/usuarios/${id}/permisos`);
}

export function listarAuditoria(filtros = {}) {
    return clienteHttp.obtener(`/admin/auditoria${consulta(filtros)}`);
}

export function listarConfiguracion() {
    return clienteHttp.obtener('/admin/configuracion');
}

export function guardarConfiguracion(valores) {
    return clienteHttp.actualizar('/admin/configuracion', { valores });
}
