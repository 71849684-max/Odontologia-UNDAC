import React from 'react';
import { clinicalSections } from '../../../configuracion/historiaClinica.config.mjs';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import ClinicalStatusBadge from './ClinicalStatusBadge.jsx';

export default function ClinicalSectionTabs() {
  const { activeMoment, activeSection, setActiveSection, sectionStatuses } = useHistoriaClinica();
  const sections = activeMoment.sections.map((id) => clinicalSections.find((section) => section.id === id)).filter(Boolean);
  if (sections.length <= 1) return null;
  return <nav className="clinical-section-tabs" aria-label={`Secciones de ${activeMoment.label}`}>
    {sections.map((section, index) => <button type="button" key={section.id} className={section.id === activeSection ? 'is-active' : ''} onClick={() => setActiveSection(section.id)} aria-current={section.id === activeSection ? 'page' : undefined}>
      <span>{index + 1}</span><strong>{section.short}</strong><ClinicalStatusBadge status={sectionStatuses[section.id]} compact />
    </button>)}
  </nav>;
}
