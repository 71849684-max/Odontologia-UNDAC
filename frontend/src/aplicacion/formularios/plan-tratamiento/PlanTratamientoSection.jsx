import React from 'react';
import { SectionCard, TextAreaField } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';

export default function PlanTratamientoSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <SectionCard title="Plan de tratamiento integral (fases)" subtitle="El documento institucional dispone este apartado como planificación clínica abierta por fases.">
    <TextAreaField label="Plan de tratamiento integral" value={get('planIntegral')} onChange={set('planIntegral')} rows={18} placeholder="Describa las fases y procedimientos planificados..." />
  </SectionCard>;
}
