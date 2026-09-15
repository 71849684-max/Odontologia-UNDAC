import React from 'react';
import { AlertTriangle, CheckCircle2, LoaderCircle } from 'lucide-react';

export default function AutoSaveIndicator({ status = 'saved', lastSavedAt }) {
  const config = status === 'saving'
    ? { Icon: LoaderCircle, label: 'Guardando cambios…', className: 'is-saving' }
    : status === 'error'
      ? { Icon: AlertTriangle, label: 'No se pudo guardar localmente', className: 'is-error' }
      : { Icon: CheckCircle2, label: 'Guardado automáticamente', className: 'is-saved' };
  const time = lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : 'en esta sesión';
  return <div className={`clinical-autosave ${config.className}`} role="status"><config.Icon size={17} aria-hidden="true" /><span><strong>{config.label}</strong><small>{status === 'saved' ? time : 'Historia clínica en edición'}</small></span></div>;
}
