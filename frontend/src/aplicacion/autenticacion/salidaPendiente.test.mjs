import { expect, test, vi } from 'vitest';
import { haySalidaPendiente, marcarSalidaPendiente } from './salidaPendiente.js';

test('conserva el bloqueo de recarga aunque el navegador deniegue localStorage', () => {
    const lectura = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Almacenamiento denegado'); });
    const escritura = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Almacenamiento denegado'); });
    try {
        marcarSalidaPendiente(true);
        expect(new URL(window.location.href).searchParams.get('salida_pendiente')).toBe('1');
        expect(haySalidaPendiente()).toBe(true);
        marcarSalidaPendiente(false);
        expect(haySalidaPendiente()).toBe(false);
    } finally {
        lectura.mockRestore();
        escritura.mockRestore();
        marcarSalidaPendiente(false);
    }
});
