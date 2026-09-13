import React from 'react';
import { SectionCard, TextAreaField, ChoiceGroup, CheckboxGroup } from '../compartidos/ControlesClinicos.jsx';
import { psychologicalStates } from './anamnesis.config.mjs';
import useSection from '../compartidos/useSection.js';

export default function AnamnesisSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Enfermedad actual" subtitle="Motivo de consulta, historia de enfermedad y evaluación general al momento de la atención.">
      <div className="undac-form-grid">
        <TextAreaField label="Motivo de consulta" value={get('motivoConsulta')} onChange={set('motivoConsulta')} className="undac-col-2" rows={3} />
        <ChoiceGroup label="Tipo de atención" value={get('tipoAtencion')} onChange={set('tipoAtencion')} options={['Urgencia','Tratamiento integral','Tratamiento específico']} className="undac-col-2" />
        <TextAreaField label="Historia de la enfermedad" value={get('historiaEnfermedad')} onChange={set('historiaEnfermedad')} className="undac-col-2" rows={5} />
        <ChoiceGroup label="Estado general del paciente" value={get('estadoGeneral')} onChange={set('estadoGeneral')} options={['Malo','Regular','Bueno']} className="undac-col-2" />
        <TextAreaField label="Ectoscopía" value={get('ectoscopia')} onChange={set('ectoscopia')} className="undac-col-2" rows={3} />
      </div>
    </SectionCard>
    <SectionCard title="Datos psicológicos" subtitle="Cómo se encuentra el paciente al momento de la consulta.">
      <CheckboxGroup label="Estado observado" values={get('estadoPsicologico', [])} onChange={set('estadoPsicologico')} options={psychologicalStates} />
      <TextAreaField label="Observaciones" value={get('observacionesPsicologicas')} onChange={set('observacionesPsicologicas')} rows={3} />
    </SectionCard>
  </div>;
}
