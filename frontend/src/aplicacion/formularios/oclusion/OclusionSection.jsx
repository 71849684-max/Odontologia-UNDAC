import React from 'react';
import { CollapsibleSection, Field, TextAreaField, ChoiceGroup, CheckboxGroup } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';

export default function OclusionSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  const motivos = get('motivosPerdida', []);
  const protesis = get('protesisTipos', []);
  return <div className="undac-section-stack clinical-occlusion-flow">
    <CollapsibleSection title="Oclusión y pérdida dentaria" subtitle="Relaciones oclusales y antecedentes de pérdida de piezas" defaultOpen status={Object.keys(values ?? {}).length ? 'progress' : 'pending'}>
      <div className="undac-form-grid">
        <Field label="Posterior: clase" value={get('oclusionPosterior')} onChange={set('oclusionPosterior')} /><Field label="Anterior: clase" value={get('oclusionAnterior')} onChange={set('oclusionAnterior')} />
        <TextAreaField label="¿Cuándo fue la última exodoncia o cuál fue el motivo de pérdida dentaria?" value={get('ultimaExodoncia')} onChange={set('ultimaExodoncia')} className="undac-col-2" rows={3} />
        <CheckboxGroup label="Motivo por el cual perdió las piezas dentarias" values={motivos} onChange={set('motivosPerdida')} options={['Caries','Traumatismos','Genético','Atrición','Otros']} className="undac-col-2" />
        {motivos.includes('Otros') ? <Field label="Motivo de pérdida — otros" value={get('motivosPerdidaOtros')} onChange={set('motivosPerdidaOtros')} className="undac-col-2" /> : null}
      </div>
    </CollapsibleSection>
    <CollapsibleSection title="Antecedentes protésicos" subtitle="Tipo de prótesis y responsable de su confección" status={protesis.length ? 'progress' : 'pending'}>
      <div className="undac-form-grid">
        <CheckboxGroup label="¿Fue portador de algún tipo de prótesis bucal?" values={protesis} onChange={set('protesisTipos')} options={['Total','Parcial','Fija','Otros']} className="undac-col-2" />
        {protesis.length ? <ChoiceGroup label="La prótesis fue confeccionada e instalada por" value={get('protesisProfesional')} onChange={set('protesisProfesional')} options={['Odontólogo','Técnico dental']} className="undac-col-2" /> : null}
        <TextAreaField label="Diagnóstico presuntivo" value={get('diagnosticoPresuntivoOclusion')} onChange={set('diagnosticoPresuntivoOclusion')} className="undac-col-2" rows={4} />
      </div>
    </CollapsibleSection>
  </div>;
}
