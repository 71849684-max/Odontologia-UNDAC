import React from 'react';

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
  return (
    <section className={`undac-card undac-section-card hc-clinical-card ${className}`}>
      <div className="undac-section-card__header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="undac-section-card__actions">{actions}</div> : null}
      </div>
      <div className="undac-section-card__body">{children}</div>
    </section>
  );
}

export function Field({ label, value = '', onChange, type = 'text', placeholder = '', required = false, min, max, step, className = '', help, readOnly = false, maxLength, inputMode }) {
  const id = React.useId();
  return (
    <label className={`undac-field ${className}`} htmlFor={id}>
      <span>{label}{required ? <em> *</em> : null}</span>
      <input id={id} type={type} value={value ?? ''} placeholder={placeholder} min={min} max={max} step={step} required={required} readOnly={readOnly} maxLength={maxLength} inputMode={inputMode} onChange={(event) => onChange?.(event.target.value)} />
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

export function ChoiceGroup({ label, value = '', onChange, options = ['Sí', 'No'], inline = true, className = '' }) {
  const name = React.useId();
  return (
    <fieldset className={`undac-choice ${inline ? 'undac-choice--inline' : ''} ${className}`}>
      <legend>{label}</legend>
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

export function PhotoPlaceholder({ title, description = 'Espacio visual preparado. La carga real se habilitará al integrar el backend.', count = 1 }) {
  return (
    <div className="undac-photo-block">
      <div className="undac-photo-block__head">
        <div><strong>{title}</strong><span>{description}</span></div>
        <span className="undac-tag">Mock</span>
      </div>
      <div className={`undac-photo-grid undac-photo-grid--${Math.min(count, 6)}`}>
        {Array.from({ length: count }, (_, index) => (
          <div className="undac-photo-slot" key={index}>
            <span aria-hidden="true">＋</span>
            <strong>{count > 1 ? `Vista ${index + 1}` : 'Área de imagen'}</strong>
            <small>Sin almacenamiento real</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SaveBar({ sectionLabel, onSave, onPrevious, onNext, isFirst, isLast }) {
  return (
    <div className="undac-savebar">
      <div><strong>{sectionLabel}</strong><span>Los cambios se conservan localmente en esta demostración.</span></div>
      <div className="undac-savebar__actions">
        {!isFirst ? <button type="button" className="undac-btn undac-btn--ghost" onClick={onPrevious}>Anterior</button> : null}
        <button type="button" className="undac-btn undac-btn--secondary" onClick={onSave}>Guardar borrador</button>
        {!isLast ? <button type="button" className="undac-btn undac-btn--primary" onClick={onNext}>Guardar y continuar</button> : null}
      </div>
    </div>
  );
}
