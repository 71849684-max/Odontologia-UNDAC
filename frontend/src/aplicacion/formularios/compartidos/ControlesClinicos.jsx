import React from 'react';
import { BloqueCarga } from './ControlesCarga.jsx';
import { aIsoFecha, aIsoFechaHora, dentroDeRangoIso, enmascararFecha, fechaCompleta, formatearFecha, formatearFechaHora } from '../../utilidades/fechas.mjs';

export { BloqueCarga, SlotConstancia } from './ControlesCarga.jsx';

export function StatusBadge({ status = 'Borrador' }) {
  const slug = String(status).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
  return <span className={`undac-status undac-status--${slug}`}><span className="undac-status__dot" aria-hidden="true" />{status}</span>;
}

export function ProgressBar({ value = 0, label = 'Progreso de historia' }) {
  const safe = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="undac-progress" aria-label={`${label}: ${safe}%`}>
      <div className="undac-progress__track"><span style={{ width: `${safe}%` }} /></div>
      <strong>{safe}%</strong>
    </div>
  );
}

export function SectionCard({ title, subtitle, children, actions, className = '' }) {
  const titleId = React.useId();
  return (
    <section className={`undac-card undac-section-card hc-clinical-card ${className}`} aria-labelledby={titleId}>
      <div className="undac-section-card__header">
        <div>
          <h3 id={titleId}>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="undac-section-card__actions">{actions}</div> : null}
      </div>
      <div className="undac-section-card__body">{children}</div>
    </section>
  );
}


export function CollapsibleSection({ title, subtitle, summary, children, defaultOpen = false, status, className = '', actions, open: openControlado, onToggle }) {
  const [interno, setInterno] = React.useState(defaultOpen);
  const controlado = openControlado !== undefined;
  const open = controlado ? openControlado : interno;
  const contentId = React.useId();
  const triggerId = React.useId();
  const alternar = () => {
    const siguiente = !open;
    if (controlado) onToggle?.(siguiente);
    else setInterno(siguiente);
  };
  const disparador = (
    <button id={triggerId} type="button" className="clinical-collapsible__trigger" aria-expanded={open} aria-controls={contentId} onClick={alternar}>
      <span className="clinical-collapsible__copy"><strong>{title}</strong>{subtitle ? <small>{subtitle}</small> : null}</span>
      {!open && summary ? <span className="clinical-collapsible__summary">{summary}</span> : null}
      {status ? <span className={`clinical-collapsible__status is-${status}`}>{status === 'complete' ? 'Completo' : status === 'progress' ? 'En progreso' : 'Pendiente'}</span> : null}
      <span className="clinical-collapsible__chevron" aria-hidden="true">⌄</span>
    </button>
  );
  return (
    <section className={`clinical-collapsible ${open ? 'is-open' : ''} ${className}`}>
      {actions ? <div className="clinical-collapsible__bar">{disparador}<div className="clinical-collapsible__actions">{actions}</div></div> : disparador}
      {open ? <div id={contentId} className="clinical-collapsible__body" role="region" aria-labelledby={triggerId}>{children}</div> : null}
    </section>
  );
}

/** Entrada de fecha en dd/mm/aaaa (valor interno ISO). */
export function InputFecha({ id, value, onChange, min, max, required, readOnly, disabled, conHora = false, placeholder, className = '' }) {
  return <CampoFechaTexto id={id} value={value} onChange={onChange} min={min} max={max} required={required} readOnly={readOnly || disabled} conHora={conHora} placeholder={placeholder} className={className} />;
}

function CampoFechaTexto({ id, value, onChange, min, max, required, readOnly, conHora = false, placeholder, className = '' }) {
  const aIso = conHora ? aIsoFechaHora : aIsoFecha;
  const textoDe = (valor) => (conHora ? formatearFechaHora(valor) : formatearFecha(valor));
  const [texto, setTexto] = React.useState(() => textoDe(value));
  React.useEffect(() => { setTexto(textoDe(value)); }, [value, conHora]);

  const confirmar = (raw) => {
    if (readOnly) return;
    const limpio = String(raw ?? '').trim();
    if (!limpio) {
      onChange?.('');
      setTexto('');
      return;
    }
    const iso = aIso(limpio);
    const isoFecha = iso ? iso.slice(0, 10) : null;
    if (!fechaCompleta(limpio, conHora) || !iso || !dentroDeRangoIso(isoFecha, min, max)) {
      setTexto(textoDe(value));
      return;
    }
    onChange?.(iso);
    setTexto(textoDe(iso));
  };

  const alEscribir = (event) => {
    if (readOnly) return;
    const enmascarado = enmascararFecha(event.target.value, { conHora, anterior: texto });
    setTexto(enmascarado);
    if (!enmascarado) {
      onChange?.('');
      return;
    }
    if (!fechaCompleta(enmascarado, conHora)) return;
    const iso = aIso(enmascarado);
    const isoFecha = iso ? iso.slice(0, 10) : null;
    if (iso && dentroDeRangoIso(isoFecha, min, max)) onChange?.(iso);
  };

  return (
    <input
      id={id}
      type="text"
      className={className}
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder || (conHora ? 'dd/mm/aaaa hh:mm' : 'dd/mm/aaaa')}
      value={texto}
      required={required}
      readOnly={readOnly}
      onChange={alEscribir}
      onBlur={(event) => confirmar(event.target.value)}
      onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); confirmar(event.currentTarget.value); } }}
    />
  );
}

export function Field({ label, value = '', onChange, type = 'text', placeholder = '', required = false, min, max, step, className = '', help, readOnly = false, maxLength, inputMode }) {
  const id = React.useId();
  const esFecha = type === 'date' || type === 'datetime-local';
  return (
    <label className={`undac-field ${className}`} htmlFor={id}>
      <span>{label}{required ? <em> *</em> : null}</span>
      {esFecha ? (
        <CampoFechaTexto id={id} value={value} onChange={onChange} min={min} max={max} required={required} readOnly={readOnly} conHora={type === 'datetime-local'} placeholder={placeholder} />
      ) : (
        <input id={id} type={type} value={value ?? ''} placeholder={placeholder} min={min} max={max} step={step} required={required} readOnly={readOnly} maxLength={maxLength} inputMode={inputMode} onChange={(event) => onChange?.(event.target.value)} />
      )}
      {help ? <small>{help}</small> : null}
    </label>
  );
}

export function TextAreaField({ label, value = '', onChange, placeholder = '', rows = 4, className = '', help }) {
  const id = React.useId();
  return (
    <label className={`undac-field ${className}`} htmlFor={id}>
      <span>{label}</span>
      <textarea id={id} value={value ?? ''} placeholder={placeholder} rows={rows} onChange={(event) => onChange?.(event.target.value)} />
      {help ? <small>{help}</small> : null}
    </label>
  );
}

export function SelectField({ label, value = '', onChange, options = [], placeholder = 'Seleccione', className = '', disabled = false }) {
  const id = React.useId();
  return (
    <label className={`undac-field ${className}`} htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value ?? ''} disabled={disabled} onChange={(event) => onChange?.(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const normalized = typeof option === 'string' ? { value: option, label: option } : option;
          return <option key={normalized.value} value={normalized.value}>{normalized.label}</option>;
        })}
      </select>
    </label>
  );
}

export function ChoiceGroup({ label, value = '', onChange, options = ['Sí', 'No'], inline = true, className = '', hideLabel = false }) {
  const name = React.useId();
  return (
    <fieldset className={`undac-choice ${inline ? 'undac-choice--inline' : ''} ${className}`}>
      {label ? <legend className={hideLabel ? 'solo-lectores' : undefined}>{label}</legend> : null}
      <div className="undac-choice__options">
        {options.map((option) => {
          const normalized = typeof option === 'string' ? { value: option, label: option } : option;
          return (
            <label key={normalized.value}>
              <input type="radio" name={name} value={normalized.value} checked={value === normalized.value} onChange={() => onChange?.(normalized.value)} />
              <span>{normalized.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function CheckboxGroup({ label, values = [], onChange, options = [], className = '' }) {
  const toggle = (option) => {
    const next = values.includes(option) ? values.filter((item) => item !== option) : [...values, option];
    onChange?.(next);
  };
  return (
    <fieldset className={`undac-choice ${className}`}>
      <legend>{label}</legend>
      <div className="undac-check-grid">
        {options.map((option) => (
          <label key={option}>
            <input type="checkbox" checked={values.includes(option)} onChange={() => toggle(option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Bloque de evidencia visual.
 * tipo="imagen" abre el selector de imágenes al hacer clic y muestra las vistas ya cargadas.
 * tipo="archivo" abre el selector de documentos al hacer clic y lista los adjuntos.
 */
/** Estado del bloque de fotografías según las vistas adjuntas frente a las previstas. */
export function estadoFotos(adjuntos, previstas) {
  const total = Array.isArray(adjuntos) ? adjuntos.length : 0;
  if (!total) return 'pending';
  return total >= previstas ? 'complete' : 'progress';
}

export function PhotoPlaceholder({ title, description, count = 1, tipo = 'imagen', value, onChange, accept, maximoArchivos, multiple, nota, campo }) {
  return (
    <BloqueCarga
      campo={campo}
      title={title}
      description={description}
      count={count}
      tipo={tipo}
      value={value}
      onChange={onChange}
      accept={accept}
      maximoArchivos={maximoArchivos}
      multiple={multiple}
      nota={nota}
    />
  );
}
