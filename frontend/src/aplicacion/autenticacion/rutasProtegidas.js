/**
 * Vistas que forman el módulo de administración. El bloqueo real vive en el
 * middleware rol:ADMINISTRADOR del backend; esto evita además que la vista se
 * renderice en el navegador.
 */
export const RUTAS_ADMIN = ['usuarios', 'permisos-usuarios', 'auditoria', 'configuracion'];

export function esRutaAdmin(ruta) {
    return RUTAS_ADMIN.includes(ruta);
}

export function puedeVerRuta(ruta, sesion) {
    if (!esRutaAdmin(ruta)) return true;

    return Boolean(sesion?.esAdministrador);
}
