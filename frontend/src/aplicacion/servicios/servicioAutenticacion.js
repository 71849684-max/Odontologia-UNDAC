import { clienteHttp, ErrorHttp } from './clienteHttp';

/**
 * @param {{ nombreUsuario: string, contrasena: string }} credenciales
 */
export function iniciarSesion({ nombreUsuario, contrasena }) {
    return clienteHttp.enviar('/auth/login', {
        nombre_usuario: nombreUsuario,
        contrasena,
    });
}

export function cerrarSesion() {
    return clienteHttp.enviar('/auth/logout');
}

/**
 * Recupera la sesion vigente al recargar la pagina. Devuelve null si no hay una.
 */
export async function obtenerSesion() {
    try {
        return await clienteHttp.obtener('/auth/yo');
    } catch (error) {
        if (error instanceof ErrorHttp && error.esNoAutenticado) return null;
        throw error;
    }
}
