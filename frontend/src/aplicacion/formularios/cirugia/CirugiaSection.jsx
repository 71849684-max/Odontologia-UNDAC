import React from 'react';
import { CollapsibleSection, TextAreaField } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';

export default function CirugiaSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack clinical-surgery-flow">
    <CollapsibleSection title="Preoperatorio" subtitle="Preparación del paciente y condiciones previas" defaultOpen status={get('preoperatorio') ? 'progress' : 'pending'}><TextAreaField label="Preoperatorio" value={get('preoperatorio')} onChange={set('preoperatorio')} rows={7} /></CollapsibleSection>
    <CollapsibleSection title="Intraoperatorio" subtitle="Descripción del procedimiento realizado" status={get('intraoperatorio') ? 'progress' : 'pending'}><TextAreaField label="Intraoperatorio" value={get('intraoperatorio')} onChange={set('intraoperatorio')} rows={8} /></CollapsibleSection>
    <CollapsibleSection title="Postoperatorio" subtitle="Indicaciones, evolución inmediata y cuidados" status={get('postoperatorio') ? 'progress' : 'pending'}><TextAreaField label="Postoperatorio" value={get('postoperatorio')} onChange={set('postoperatorio')} rows={7} /></CollapsibleSection>
  </div>;
}
