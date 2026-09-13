import React from 'react';
import { SectionCard, Field, TextAreaField, ChoiceGroup, CheckboxGroup } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';

export default function OclusionSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Oclusión">
      <div className="undac-form-grid">
        <Field label="Posterior: clase" value={get('oclusionPosterior')} onChange={set('oclusionPosterior')} /><Field label="Anterior: clase" value={get('oclusionAnterior')} onChange={set('oclusionAnterior')} />
        <TextAreaField label="¿Cuándo fue la última exodoncia o cuál fue el motivo de pérdida dentaria?" value={get('ultimaExodoncia')} onChange={set('ultimaExodoncia')} className="undac-col-2" rows={3} />
        <CheckboxGroup label="Motivo por el cual perdió las piezas dentarias" values={get('motivosPerdida', [])} onChange={set('motivosPerdida')} options={['Caries','Traumatismos','Genético','Atrición','Otros']} className="undac-col-2" />
        <Field label="Motivo de pérdida — otros" value={get('motivosPerdidaOtros')} onChange={set('motivosPerdidaOtros')} className="undac-col-2" />
        <CheckboxGroup label="¿Fue portador de algún tipo de prótesis bucal?" values={get('protesisTipos', [])} onChange={set('protesisTipos')} options={['Total','Parcial','Fija','Otros']} className="undac-col-2" />
        <ChoiceGroup label="La prótesis fue confeccionada e instalada por" value={get('protesisProfesional')} onChange={set('protesisProfesional')} options={['Odontólogo','Técnico dental']} className="undac-col-2" />
        <TextAreaField label="Diagnóstico presuntivo" value={get('diagnosticoPresuntivoOclusion')} onChange={set('diagnosticoPresuntivoOclusion')} className="undac-col-2" rows={4} />
      </div>
    </SectionCard>
  </div>;
}
