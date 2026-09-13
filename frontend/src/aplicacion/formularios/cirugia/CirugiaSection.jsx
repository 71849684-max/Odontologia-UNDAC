import React from 'react';
import { SectionCard, TextAreaField } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';

export default function CirugiaSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <SectionCard title="Plan de tratamiento quirúrgico" subtitle="Planificación preoperatoria, intraoperatoria y postoperatoria.">
    <div className="undac-form-grid">
      <TextAreaField label="Preoperatorio" value={get('preoperatorio')} onChange={set('preoperatorio')} className="undac-col-2" rows={8} />
      <TextAreaField label="Intraoperatorio" value={get('intraoperatorio')} onChange={set('intraoperatorio')} className="undac-col-2" rows={10} />
      <TextAreaField label="Postoperatorio" value={get('postoperatorio')} onChange={set('postoperatorio')} className="undac-col-2" rows={9} />
    </div>
  </SectionCard>;
}
