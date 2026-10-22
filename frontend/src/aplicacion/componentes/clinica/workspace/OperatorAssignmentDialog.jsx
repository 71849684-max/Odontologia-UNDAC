import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import BusquedaPersonal from '../../../formularios/datos-paciente/BusquedaPersonal.jsx';
import useModalDialog from '../../interfaz/useModalDialog.js';

export default function OperatorAssignmentDialog({ open, value, meta, fecha, triggerRef, onSelect, onClose, error = '' }) {
  const dialogRef = useModalDialog(open, onClose, triggerRef);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="clinical-operator-modal-overlay" role="presentation" onClick={onClose}>
      <section
        ref={dialogRef}
        className="clinical-operator-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-cambiar-responsable"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="clinical-operator-modal__header">
          <div>
            <h3 id="titulo-cambiar-responsable">Cambiar cirujano dentista responsable</h3>
            <p>Busque y seleccione al cirujano dentista responsable de esta historia clínica.</p>
          </div>
          <button type="button" className="hc-mini-button" onClick={onClose} aria-label="Cerrar"><X size={16} /></button>
        </header>
        {error ? <p className="hc-form-error" role="alert">{error}</p> : null}
        <BusquedaPersonal value={value} meta={meta} fecha={fecha} onChange={onSelect} />
      </section>
    </div>,
    document.body,
  );
}
