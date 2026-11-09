import React, { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useModalDialog from '../../interfaz/useModalDialog.js';
import { TextAreaField } from '../../../formularios/compartidos/ControlesClinicos.jsx';

export default function DialogoRectificacion({ onCancel, onConfirm }) {
  const titulo = useId();
  const disparador = useRef(document.activeElement);
  const dialogo = useModalDialog(true, onCancel, disparador);
  const [motivo, setMotivo] = useState('');
  return createPortal(<div className="admin-dialogo-fondo">
    <section ref={dialogo} className="admin-dialogo" role="dialog" aria-modal="true" aria-labelledby={titulo}>
      <h2 id={titulo}>Reabrir sección para corregir</h2>
      <p>La versión aprobada se conserva en el historial. Indique por qué necesita corregirla.</p>
      <TextAreaField label="Motivo de la rectificación" value={motivo} onChange={setMotivo} rows={3} />
      <div className="admin-dialogo__acciones"><button type="button" className="undac-btn undac-btn--ghost" onClick={onCancel}>Cancelar</button><button type="button" className="undac-btn undac-btn--primary" disabled={motivo.trim().length < 10} onClick={() => onConfirm(motivo.trim())}>Reabrir y conservar el original</button></div>
    </section>
  </div>, document.body);
}
