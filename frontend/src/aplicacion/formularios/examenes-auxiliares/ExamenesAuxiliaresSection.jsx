import React from 'react';
import { CollapsibleSection, Field, TextAreaField, PhotoPlaceholder } from '../compartidos/ControlesClinicos.jsx';
import { labFields } from './examenes-auxiliares.config.mjs';
import useSection from '../compartidos/useSection.js';

export default function ExamenesAuxiliaresSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  const labCount = labFields.filter(([key]) => get(key)).length;
  return <div className="undac-section-stack clinical-auxiliary-flow">
    <CollapsibleSection title="Análisis de laboratorio clínico" subtitle="Valores solicitados por la ficha institucional" summary={`${labCount}/${labFields.length} valores registrados`} defaultOpen status={labCount === labFields.length ? 'complete' : labCount ? 'progress' : 'pending'}>
      <div className="undac-lab-grid">{labFields.map(([key, label], index) => <div className="undac-lab-row" key={key}><span>{index + 1}</span><Field label={label} value={get(key)} onChange={set(key)} /></div>)}</div>
      <PhotoPlaceholder title="Resultados de laboratorio" description="Vista prevista para respaldos y resultados solicitados durante la evaluación." />
      <TextAreaField label="Diagnóstico de análisis de laboratorio clínico" value={get('diagnosticoLaboratorio')} onChange={set('diagnosticoLaboratorio')} rows={5} />
    </CollapsibleSection>
    <CollapsibleSection title="Exámenes radiográficos" subtitle="Informes y soportes radiográficos" summary={get('rxPanoramico') || get('rxOclusales') || get('rxPeriapicales') ? 'Informes registrados' : 'Sin informes'} status={get('rxPanoramico') || get('rxOclusales') || get('rxPeriapicales') ? 'progress' : 'pending'}>
      <div className="undac-form-grid">
        <TextAreaField label="Informe RX panorámico" value={get('rxPanoramico')} onChange={set('rxPanoramico')} className="undac-col-2" rows={6} />
        <TextAreaField label="Informe RX oclusales (ambos maxilar y mandíbula)" value={get('rxOclusales')} onChange={set('rxOclusales')} className="undac-col-2" rows={5} />
        <TextAreaField label="Informe RX periapicales" value={get('rxPeriapicales')} onChange={set('rxPeriapicales')} className="undac-col-2" rows={5} />
      </div>
      <PhotoPlaceholder title="Radiografías" description="Vistas destinadas al respaldo radiográfico y a la revisión clínica." count={4} />
    </CollapsibleSection>
  </div>;
}
