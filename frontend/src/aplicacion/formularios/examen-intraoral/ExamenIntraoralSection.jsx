import React from 'react';
import { SectionCard, Field, ChoiceGroup, PhotoPlaceholder } from '../compartidos/ControlesClinicos.jsx';
import { intraoralTissues } from './examen-intraoral.config.mjs';
import { normalAltered } from '../compartidos/opcionesClinicas.js';
import useSection from '../compartidos/useSection.js';

export default function ExamenIntraoralSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Examen clínico estomatológico intraoral — Tejidos blandos" subtitle="Para cada tejido se registra condición anatómica/color y la descripción cuando está alterado.">
      <div className="undac-tissue-list">
        {intraoralTissues.map((tissue, index) => {
          const key = `tissue${index}`;
          const status = get(`${key}Status`);
          return <div className="undac-tissue-row" key={tissue}><div><strong>{tissue}</strong><span>Anatomía y color</span></div><ChoiceGroup label="Condición" value={status} onChange={set(`${key}Status`)} options={normalAltered} />{status === 'Alterada' ? <Field label="Si es alterada, describir" value={get(`${key}Detail`)} onChange={set(`${key}Detail`)} /> : <div className="undac-tissue-ok">Sin descripción adicional</div>}</div>;
        })}
      </div>
    </SectionCard>
    <SectionCard title="Fotografías intraorales"><PhotoPlaceholder title="Fotografías intraorales" count={6} /></SectionCard>
  </div>;
}
