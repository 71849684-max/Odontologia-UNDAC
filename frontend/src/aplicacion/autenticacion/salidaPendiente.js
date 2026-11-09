const CLAVE = 'undac:sesion:salida-pendiente';
const PARAMETRO = 'salida_pendiente';

export function haySalidaPendiente() {
    if (new URL(window.location.href).searchParams.get(PARAMETRO) === '1') return true;
    try { return localStorage.getItem(CLAVE) === '1'; } catch { return false; }
}

export function marcarSalidaPendiente(pendiente) {
    // La URL conserva el bloqueo durante una recarga aunque el navegador deniegue almacenamiento.
    try {
        const direccion = new URL(window.location.href);
        if (pendiente) direccion.searchParams.set(PARAMETRO, '1');
        else direccion.searchParams.delete(PARAMETRO);
        if (direccion.href !== window.location.href) window.history.replaceState(window.history.state, '', direccion);
    } catch { /* El indicador de almacenamiento sigue protegiendo la recuperación de sesión. */ }
    try {
        if (pendiente) localStorage.setItem(CLAVE, '1');
        else localStorage.removeItem(CLAVE);
    } catch { /* La interfaz permanece bloqueada aunque el almacenamiento no esté disponible. */ }
}

export const claveSalidaPendiente = CLAVE;
