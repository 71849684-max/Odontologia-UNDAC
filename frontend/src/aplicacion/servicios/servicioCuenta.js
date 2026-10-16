import { clienteHttp } from './clienteHttp.js';
import { sinRedEnPrueba } from './servicioClinico.js';

export async function obtenerMiPerfil() {
    sinRedEnPrueba();
    return clienteHttp.obtener('/perfil');
}

export async function guardarMiPerfil({ nombres, apellidos, correo, telefono }) {
    sinRedEnPrueba();
    return clienteHttp.actualizar('/perfil', {
        nombres,
        apellidos,
        correo: correo || null,
        telefono: telefono || null,
    });
}

export async function cambiarMiContrasena({ actual, nueva, confirmacion }) {
    sinRedEnPrueba();
    return clienteHttp.actualizar('/auth/clave', {
        contrasena_actual: actual,
        contrasena: nueva,
        contrasena_confirmation: confirmacion,
    });
}

/** Mismo criterio que la política del backend: 8+ caracteres con letras y números. */
export function problemaContrasena(clave) {
    const texto = String(clave ?? '');
    if (texto.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (texto.length > 255) return 'La contraseña no puede superar 255 caracteres.';
    if (!/\p{L}/u.test(texto) || !/\d/.test(texto)) return 'La contraseña debe combinar letras y números.';
    return '';
}
