import React from 'react';
import { SectionCard, Field, TextAreaField, PhotoPlaceholder } from '../compartidos/ControlesClinicos.jsx';
import { labFields } from './examenes-auxiliares.config.mjs';
import useSection from '../compartidos/useSection.js';

export default function ExamenesAuxiliaresSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Análisis de laboratorio clínico" subtitle="Valores solicitados por la ficha institucional.">
      <div className="undac-lab-grid">{labFields.map(([key, label], index) => <div className="undac-lab-row" key={key}><span>{index + 1}</span><Field label={label} value={get(key)} onChange={set(key)} /></div>)}</div>
      <PhotoPlaceholder title="Resultados de laboratorio" description="Área de visualización mock para resultados de laboratorio." />
      <TextAreaField label="Diagnóstico de análisis de laboratorio clínico" value={get('diagnosticoLaboratorio')} onChange={set('diagnosticoLaboratorio')} rows={5} />
    </SectionCard>
    <SectionCard title="Exámenes radiográficos">
      <div className="undac-form-grid">
        <TextAreaField label="Informe RX panorámico" value={get('rxPanoramico')} onChange={set('rxPanoramico')} className="undac-col-2" rows={7} />
        <TextAreaField label="Informe RX oclusales (ambos maxilar y mandíbula)" value={get('rxOclusales')} onChange={set('rxOclusales')} className="undac-col-2" rows={6} />
        <TextAreaField label="Informe RX periapicales" value={get('rxPeriapicales')} onChange={set('rxPeriapicales')} className="undac-col-2" rows={6} />
      </div>
      <PhotoPlaceholder title="Radiografías" description="Espacio preparado para radiografías. No realiza carga real." count={4} />
    </SectionCard>
  </div>;
}
