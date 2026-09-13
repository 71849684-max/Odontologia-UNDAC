import React from 'react';
import { SectionCard, TextAreaField } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';

export default function DiagnosticoSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <SectionCard title="Diagnóstico y pronóstico" subtitle="Consolida los hallazgos clínicos y radiográficos de la Historia Clínica.">
    <div className="undac-form-grid">
      <TextAreaField label="DX. clínico radiográfico" value={get('dxClinicoRadiografico')} onChange={set('dxClinicoRadiografico')} className="undac-col-2" rows={5} />
      <TextAreaField label="DX presuntivo" value={get('dxPresuntivo')} onChange={set('dxPresuntivo')} className="undac-col-2" rows={5} />
      <TextAreaField label="DX definitivo" value={get('dxDefinitivo')} onChange={set('dxDefinitivo')} className="undac-col-2" rows={5} />
      <TextAreaField label="Pronóstico" value={get('pronostico')} onChange={set('pronostico')} className="undac-col-2" rows={7} />
    </div>
  </SectionCard>;
}
