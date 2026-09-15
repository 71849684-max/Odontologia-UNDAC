import React from 'react';
import { CollapsibleSection, TextAreaField, PhotoPlaceholder } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';

export default function ModelosSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack clinical-models-flow">
    <CollapsibleSection title="Estudio de modelos" subtitle="Análisis del maxilar, mandíbula y planificación" defaultOpen status={get('informeMaxilar') || get('informeMandibula') || get('planificacionModelos') ? 'progress' : 'pending'}>
      <div className="undac-form-grid">
        <TextAreaField label="Informe del maxilar" value={get('informeMaxilar')} onChange={set('informeMaxilar')} className="undac-col-2" rows={5} />
        <TextAreaField label="Informe de la mandíbula" value={get('informeMandibula')} onChange={set('informeMandibula')} className="undac-col-2" rows={5} />
        <TextAreaField label="Planificación en modelos" value={get('planificacionModelos')} onChange={set('planificacionModelos')} className="undac-col-2" rows={5} />
      </div>
    </CollapsibleSection>
    <CollapsibleSection title="Fotografías de modelos" subtitle="Registro visual de apoyo" summary="4 vistas previstas" status="pending"><PhotoPlaceholder title="Fotografías de modelos" count={4} /></CollapsibleSection>
  </div>;
}
