import React, { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import useModalDialog from '../../interfaz/useModalDialog.js';
import { idHistoria, obtenerHistoria } from '../../../servicios/servicioClinico.js';
import { formatearFechaHora } from '../../../utilidades/fechas.mjs';

export default function DialogoObservaciones({ historia, triggerRef, alCerrar }) {
    const tituloId = useId();
    const dialogoRef = useModalDialog(true, alCerrar, triggerRef);
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        let vigente = true;
        const id = idHistoria(historia.id);
        if (!id) { setDatos(historia); return undefined; }
        obtenerHistoria(id).then(valor => { if (vigente) setDatos(valor); })
            .catch(() => { if (vigente) setError('No se pudieron consultar las observaciones. Verifique que aún tenga acceso a la historia e intente nuevamente.'); });
        return () => { vigente = false; };
    }, [historia.id]);
    const observaciones = datos?.observaciones?.length ? datos.observaciones
        : datos?.observacion ? [{ id: 'unica', texto: datos.observacion }] : [];

    return createPortal(<div className="clinical-operator-modal-overlay" role="presentation" onClick={alCerrar}>
        <section ref={dialogoRef} className="clinical-operator-modal" role="dialog" aria-modal="true" aria-labelledby={tituloId} onClick={evento => evento.stopPropagation()}>
            <header className="clinical-operator-modal__header">
                <h2 id={tituloId}>Observaciones · {historia.codigo}</h2>
                <button type="button" className="hc-mini-button" aria-label="Cerrar observaciones" onClick={alCerrar}><X size={16} /></button>
            </header>
            {error ? <p role="alert">{error}</p> : !datos ? <p role="status">Cargando observaciones…</p> : observaciones.length ? <ul className="hc-obs-dialogo__lista">
                {observaciones.map((observacion, indice) => <li key={observacion.id ?? indice} className="hc-obs-dialogo__item">
                    <div className="hc-obs-dialogo__meta"><span>{observacion.docente || 'Profesional encargado'}</span>
                        {observacion.fecha ? <time dateTime={observacion.fecha}>{formatearFechaHora(observacion.fecha)}</time> : null}</div>
                    <p>{observacion.texto}</p>
                </li>)}
            </ul> : <p>No hay observaciones registradas en esta historia clínica.</p>}
        </section>
    </div>, document.body);
}
