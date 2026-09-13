import React from 'react';
import { SectionCard, Field, TextAreaField } from '../compartidos/ControlesClinicos.jsx';
import { followupColumns } from './seguimiento.config.mjs';
import useSection from '../compartidos/useSection.js';

export default function SeguimientoSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  const rows = get('procedimientos', Array.from({ length: 10 }, () => ({ fecha: '', procedimiento: '', firmaOperador: '', firmaSupervisor: '' })));
  const updateRow = (index, key, value) => set('procedimientos')(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  return <div className="undac-section-stack">
    <SectionCard title="Seguimiento quirúrgico">
      <div className="undac-form-grid">
        <Field label="Apellidos y nombres del paciente" value={get('paciente')} onChange={set('paciente')} className="undac-col-2" /><Field label="Operador" value={get('operador')} onChange={set('operador')} /><Field label="Fecha" type="date" value={get('fecha')} onChange={set('fecha')} />
        <TextAreaField label="Evolución / seguimiento" value={get('evolucion')} onChange={set('evolucion')} className="undac-col-2" rows={14} />
      </div>
    </SectionCard>
    <SectionCard title="Ficha de seguimiento de los procedimientos" subtitle="La tabla reproduce los cuatro campos definidos por la ficha institucional.">
      <div className="undac-table-wrap"><table className="undac-table undac-followup-table"><thead><tr>{followupColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row,index) => <tr key={index}><td><input type="date" value={row.fecha} onChange={(event) => updateRow(index,'fecha',event.target.value)} aria-label={`Fecha procedimiento ${index + 1}`} /></td><td><input value={row.procedimiento} onChange={(event) => updateRow(index,'procedimiento',event.target.value)} aria-label={`Procedimiento ${index + 1}`} /></td><td><input value={row.firmaOperador} onChange={(event) => updateRow(index,'firmaOperador',event.target.value)} aria-label={`Firma operador ${index + 1}`} /></td><td><input value={row.firmaSupervisor} onChange={(event) => updateRow(index,'firmaSupervisor',event.target.value)} aria-label={`Firma supervisor ${index + 1}`} /></td></tr>)}</tbody></table></div>
    </SectionCard>
  </div>;
}
