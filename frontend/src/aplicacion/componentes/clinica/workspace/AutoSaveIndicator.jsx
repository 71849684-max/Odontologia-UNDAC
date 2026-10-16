import React from 'react';
import { AlertTriangle, CheckCircle2, HardDrive, LoaderCircle } from 'lucide-react';

const ESTADOS = {
  saving: { Icon: LoaderCircle, label: 'Guardando cambios…', detalle: 'Enviando al servidor', className: 'is-saving' },
  error: { Icon: AlertTriangle, label: 'No se pudo guardar', detalle: 'Se reintentará con el próximo cambio', className: 'is-error' },
  local: { Icon: HardDrive, label: 'Guardado solo en este equipo', detalle: 'Sin conexión con el servidor', className: 'is-local' },
  saved: { Icon: CheckCircle2, label: 'Guardado en el servidor', detalle: null, className: 'is-saved' },
};

export default function AutoSaveIndicator({ status = 'saved', lastSavedAt }) {
  const config = ESTADOS[status] ?? ESTADOS.saved;
  const time = lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : 'en esta sesión';
  const detalle = status === 'saved' || status === 'local' ? `${config.detalle ? `${config.detalle} · ` : ''}${time}` : config.detalle;
  return <div className={`clinical-autosave ${config.className}`} role="status" aria-live="polite" aria-label="Autoguardado"><config.Icon size={17} aria-hidden="true" /><span><strong>{config.label}</strong><small>{detalle}</small></span></div>;
}
