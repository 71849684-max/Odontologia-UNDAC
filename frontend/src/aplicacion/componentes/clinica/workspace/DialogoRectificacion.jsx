import React, { useCallback, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useModalDialog from '../../interfaz/useModalDialog.js';
import { TextAreaField } from '../../../formularios/compartidos/ControlesClinicos.jsx';

export default function DialogoRectificacion({ onCancel, onConfirm, detalleError = '' }) {
  const titulo = useId();
  const disparador = useRef(document.activeElement);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const cancelar = useCallback(() => { if (!guardando) onCancel(); }, [guardando, onCancel]);
  const dialogo = useModalDialog(true, cancelar, disparador);
  const [motivo, setMotivo] = useState('');
  async function confirmar() {
    if (guardando) return;
    setGuardando(true);
    setError('');
    try {
      if (!await onConfirm(motivo.trim())) setError('No se pudo reabrir la sección. Revise el error de guardado e inténtelo nuevamente.');
    } catch {
      setError('No se pudo reabrir la sección. Inténtelo nuevamente.');
    } finally { setGuardando(false); }
  }
  return createPortal(<div className="admin-dialogo-fondo">
    <section ref={dialogo} className="admin-dialogo" role="dialog" aria-modal="true" aria-labelledby={titulo}>
      <h2 id={titulo}>Reabrir sección para corregir</h2>
      <p>La versión aprobada se conserva en el historial. Indique por qué necesita corregirla.</p>
      <TextAreaField label="Motivo de la rectificación" value={motivo} onChange={setMotivo} rows={3} readOnly={guardando} />
      {error ? <p className="hc-form-error" role="alert">{detalleError || error}</p> : null}
      <div className="admin-dialogo__acciones"><button type="button" className="undac-btn undac-btn--ghost" disabled={guardando} onClick={cancelar}>Cancelar</button><button type="button" className="undac-btn undac-btn--primary" disabled={guardando || motivo.trim().length < 10} onClick={confirmar}>{guardando ? 'Guardando reapertura…' : 'Reabrir y conservar el original'}</button></div>
    </section>
  </div>, document.body);
}
