import { vistaPermitida } from '../configuracion/permisosVista.js';

/**
 * Vistas que forman el módulo de administración. El bloqueo real vive en el
 * middleware rol:ADMINISTRADOR del backend; esto evita además que la vista se
 * renderice en el navegador.
 */
export const RUTAS_ADMIN = ['usuarios', 'permisos-usuarios', 'auditoria', 'grupos-academicos', 'cursos', 'configuracion'];

export function esRutaAdmin(ruta) {
    return RUTAS_ADMIN.includes(ruta);
}

export function puedeVerRuta(ruta, sesion) {
    if (Array.isArray(sesion?.permisos) && !vistaPermitida(ruta, sesion.permisos)) return false;
    if (!esRutaAdmin(ruta)) return true;

    return Boolean(sesion?.esAdministrador);
}
