export function solicitarSalidaClinica(continuar, cancelar = () => {}) {
    return window.dispatchEvent(new CustomEvent('hc:solicitar-salida', {
        cancelable: true, detail: { continuar, cancelar },
    }));
}
