import { createPortal } from 'react-dom';
import { useRef } from 'react';
import useModalDialog from '../../interfaz/useModalDialog.js';

export default function DialogoSalidaClinica({ guardando, error, onPermanecer, onGuardar, onDescartar }) {
    const disparador = useRef(document.activeElement);
    const dialogo = useModalDialog(true, onPermanecer, disparador);
    return createPortal(<div className="admin-dialogo-fondo">
        <section ref={dialogo} className="admin-dialogo" role="dialog" aria-modal="true" aria-labelledby="titulo-salida-clinica" aria-describedby="descripcion-salida-clinica">
            <h2 id="titulo-salida-clinica">Hay cambios sin guardar</h2>
            <p id="descripcion-salida-clinica">Los cambios pendientes están en esta pantalla. Guárdelos antes de salir o confirme que desea descartarlos.</p>
            {error ? <p role="alert">{error}</p> : null}
            <div className="admin-dialogo__acciones">
                <button type="button" className="hc-button hc-button--ghost" onClick={onPermanecer}>Permanecer</button>
                <button type="button" className="hc-button hc-button--ghost" onClick={onDescartar} disabled={guardando}>Descartar y salir</button>
                <button type="button" className="hc-button hc-button--primary" onClick={onGuardar} disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar y salir'}</button>
            </div>
        </section>
    </div>, document.body);
}
