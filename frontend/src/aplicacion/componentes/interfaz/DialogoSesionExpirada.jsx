import { useEffect, useRef } from 'react';
import { ClockAlert } from 'lucide-react';

export default function DialogoSesionExpirada({ alVolver }) {
    const referenciaDialogo = useRef(null);

    useEffect(() => {
        const dialogo = referenciaDialogo.current;
        if (dialogo && !dialogo.open) dialogo.showModal();
        return () => dialogo?.close();
    }, []);

    return (
        <dialog ref={referenciaDialogo} className="dialogo-sesion" aria-labelledby="titulo-sesion-expirada" onCancel={alVolver}>
            <span className="dialogo-sesion__icono" aria-hidden="true">
                <ClockAlert size={25} />
            </span>
            <p className="rotulo-seccion">Seguridad institucional</p>
            <h2 id="titulo-sesion-expirada">Sesión expirada</h2>
            <p>Tu sesión demostrativa finalizó. Vuelve al acceso para continuar.</p>
            <button type="button" onClick={alVolver}>Volver al inicio de sesión</button>
        </dialog>
    );
}
