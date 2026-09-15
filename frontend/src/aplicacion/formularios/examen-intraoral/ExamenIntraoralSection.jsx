import React from 'react';
import { CollapsibleSection, Field, ChoiceGroup, PhotoPlaceholder } from '../compartidos/ControlesClinicos.jsx';
import { intraoralTissues } from './examen-intraoral.config.mjs';
import { normalAltered } from '../compartidos/opcionesClinicas.js';
import useSection from '../compartidos/useSection.js';

export default function ExamenIntraoralSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  const answered = intraoralTissues.filter((_, index) => get(`tissue${index}Status`)).length;
  const altered = intraoralTissues.filter((_, index) => get(`tissue${index}Status`) === 'Alterada').length;
  return <div className="undac-section-stack clinical-intraoral-flow">
    <CollapsibleSection title="Tejidos blandos intraorales" subtitle="Condición anatómica/color y descripción solo cuando está alterada" summary={`${answered}/${intraoralTissues.length} tejidos evaluados${altered ? ` · ${altered} alterados` : ''}`} defaultOpen status={answered === intraoralTissues.length ? 'complete' : answered ? 'progress' : 'pending'}>
      <div className="undac-tissue-list">
        {intraoralTissues.map((tissue, index) => {
          const key = `tissue${index}`;
          const status = get(`${key}Status`);
          return <div className={`undac-tissue-row${status === 'Alterada' ? ' is-altered' : ''}`} key={tissue}><div><strong>{tissue}</strong><span>Anatomía y color</span></div><ChoiceGroup label={`Condición de ${tissue}`} value={status} onChange={set(`${key}Status`)} options={normalAltered} />{status === 'Alterada' ? <Field label="Si es alterada, describir" value={get(`${key}Detail`)} onChange={set(`${key}Detail`)} required /> : <div className="undac-tissue-ok">Sin descripción adicional</div>}</div>;
        })}
      </div>
    </CollapsibleSection>
    <CollapsibleSection title="Fotografías intraorales" subtitle="Registro visual de apoyo" summary="6 vistas previstas" status="pending"><PhotoPlaceholder title="Fotografías intraorales" count={6} /></CollapsibleSection>
  </div>;
}
