import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Field, SectionCard, TextAreaField } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function SeguimientoSection({ values, onChange, patient, history }) {
  const { get, set } = useSection(values, onChange);
  const rows = get('procedimientos', []);
  const updateRow = (index, key, value) => set('procedimientos')(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  const addRow = () => set('procedimientos')([...rows, { fecha: today(), procedimiento: '', evolucion: '', firmaOperador: history?.operador || '', firmaSupervisor: history?.docente || '' }]);
  const removeRow = (index) => set('procedimientos')(rows.filter((_, rowIndex) => rowIndex !== index));

  return <div className="undac-section-stack clinical-followup-flow">
    <SectionCard title="Seguimiento clínico" subtitle="Registre la evolución global y añada controles únicamente cuando ocurran.">
      <div className="undac-form-grid">
        <Field label="Apellidos y nombres del paciente" value={patient?.nombres || get('paciente')} readOnly className="undac-col-2" />
        <Field label="Operador" value={history?.operador || get('operador')} readOnly />
        <Field label="Fecha de referencia" type="date" value={get('fecha')} onChange={set('fecha')} />
        <TextAreaField label="Evolución / seguimiento" value={get('evolucion')} onChange={set('evolucion')} className="undac-col-2" rows={6} />
      </div>
    </SectionCard>

    <SectionCard title="Ficha de seguimiento de los procedimientos" subtitle="Cada control se registra como un evento clínico; no se crean filas vacías por anticipado." actions={<button type="button" className="undac-btn undac-btn--primary undac-btn--sm" onClick={addRow}><Plus size={16} />Registrar control</button>}>
      {rows.length === 0 ? <div className="clinical-empty-inline"><strong>Sin controles registrados.</strong><span>Cuando el paciente retorne, añada un evento de seguimiento.</span></div> : null}
      <div className="clinical-followup-timeline">
        {rows.map((row, index) => <article className="clinical-followup-event" key={`followup-${index}`}>
          <span className="clinical-followup-event__dot" aria-hidden="true" />
          <div className="clinical-followup-event__card">
            <header><strong>Control {index + 1}</strong><button type="button" className="clinical-icon-action is-danger" onClick={() => removeRow(index)} aria-label={`Eliminar control ${index + 1}`}><Trash2 size={16} /></button></header>
            <div className="undac-form-grid">
              <Field label={`Fecha procedimiento ${index + 1}`} type="date" value={row.fecha} onChange={(value) => updateRow(index, 'fecha', value)} />
              <Field label={`Procedimiento ${index + 1}`} value={row.procedimiento} onChange={(value) => updateRow(index, 'procedimiento', value)} />
              <TextAreaField label={`Evolución del control ${index + 1}`} value={row.evolucion || ''} onChange={(value) => updateRow(index, 'evolucion', value)} className="undac-col-2" rows={3} />
              <Field label={`Firma operador ${index + 1}`} value={row.firmaOperador} onChange={(value) => updateRow(index, 'firmaOperador', value)} />
              <Field label={`Firma supervisor ${index + 1}`} value={row.firmaSupervisor} onChange={(value) => updateRow(index, 'firmaSupervisor', value)} />
            </div>
          </div>
        </article>)}
      </div>
    </SectionCard>
  </div>;
}
