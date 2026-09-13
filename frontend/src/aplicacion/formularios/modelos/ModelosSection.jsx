import React from 'react';
import { SectionCard, TextAreaField, PhotoPlaceholder } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';

export default function ModelosSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Estudio de modelos" subtitle="Análisis de modelos de estudio y planificación.">
      <div className="undac-form-grid">
        <TextAreaField label="Informe del maxilar" value={get('informeMaxilar')} onChange={set('informeMaxilar')} className="undac-col-2" rows={6} />
        <TextAreaField label="Informe de la mandíbula" value={get('informeMandibula')} onChange={set('informeMandibula')} className="undac-col-2" rows={6} />
        <TextAreaField label="Planificación en modelos" value={get('planificacionModelos')} onChange={set('planificacionModelos')} className="undac-col-2" rows={6} />
      </div>
    </SectionCard>
    <SectionCard title="Fotografías de modelos"><PhotoPlaceholder title="Fotografías de modelos" count={4} /></SectionCard>
  </div>;
}
