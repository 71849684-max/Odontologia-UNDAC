import React from 'react';
import { CollapsibleSection, Field, TextAreaField, ChoiceGroup, PhotoPlaceholder } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';

export default function ExamenExtraoralSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack clinical-extraoral-flow">
    <CollapsibleSection title="Evaluación facial y funcional" subtitle="Tipo facial, simetría, perfil y funciones peribucales" defaultOpen status={Object.keys(values ?? {}).length ? 'progress' : 'pending'}>
      <div className="undac-form-grid">
        <ChoiceGroup label="Tipo facial" value={get('tipoFacial')} onChange={set('tipoFacial')} options={['Dolicocéfalo','Mesocéfalo','Braquicéfalo']} className="undac-col-2" />
        <ChoiceGroup label="Simetría facial" value={get('simetriaFacial')} onChange={set('simetriaFacial')} options={['Simétrica','Asimétrica']} />
        <ChoiceGroup label="Perfil anteroposterior" value={get('perfil')} onChange={set('perfil')} options={['Convexo','Recto','Cóncavo']} />
        <ChoiceGroup label="Labios" value={get('competenciaLabial')} onChange={set('competenciaLabial')} options={['Competencia labial','Incompetencia labial','Cortos']} className="undac-col-2" />
        <ChoiceGroup label="Tonicidad de músculos peribucales" value={get('tonicidad')} onChange={set('tonicidad')} options={['Hipertónico','Normotónico','Hipotónico']} className="undac-col-2" />
        <ChoiceGroup label="Ángulo nasolabial" value={get('anguloNasolabial')} onChange={set('anguloNasolabial')} options={['Cerrado','Normal','Abierto']} />
        <ChoiceGroup label="Fonación" value={get('fonacion')} onChange={set('fonacion')} options={['Normal','Paranormal','Otros']} />
        {get('fonacion') === 'Otros' ? <Field label="Fonación — otros" value={get('fonacionOtros')} onChange={set('fonacionOtros')} /> : null}
        <Field label="¿Cuándo fue la última visita al dentista?" value={get('ultimaVisitaDentista')} onChange={set('ultimaVisitaDentista')} />
        <TextAreaField label="Motivo de la visita al dentista" value={get('motivoVisitaDentista')} onChange={set('motivoVisitaDentista')} className="undac-col-2" rows={3} />
      </div>
    </CollapsibleSection>
    <CollapsibleSection title="Fotografías extraorales" subtitle="Registro visual de apoyo" summary="5 vistas previstas" status="pending">
      <PhotoPlaceholder title="Fotografías extraorales" count={5} />
    </CollapsibleSection>
  </div>;
}
