import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clinicalSections } from '../../../configuracion/historiaClinica.config.mjs';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import ClinicalStatusBadge from './ClinicalStatusBadge.jsx';

export default function ClinicalSectionTabs() {
  const { activeMoment, activeSection, setActiveSection, sectionStatuses } = useHistoriaClinica();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sections = activeMoment.sections.map((id) => clinicalSections.find((section) => section.id === id)).filter(Boolean);
  const activeIndex = Math.max(0, sections.findIndex((section) => section.id === activeSection));
  const current = sections[activeIndex];

  useEffect(() => {
    setMobileOpen(false);
  }, [activeSection, activeMoment.id]);

  if (sections.length <= 1) return null;

  function selectSection(sectionId) {
    setActiveSection(sectionId);
    setMobileOpen(false);
  }

  return (
    <>
      <nav className="clinical-section-tabs" aria-label={`Secciones de ${activeMoment.label}`}>
        {sections.map((section, index) => <button type="button" key={section.id} className={section.id === activeSection ? 'is-active' : ''} onClick={() => setActiveSection(section.id)} aria-current={section.id === activeSection ? 'page' : undefined}>
          <span>{index + 1}</span><strong>{section.short}</strong><ClinicalStatusBadge status={sectionStatuses[section.id]} compact />
        </button>)}
      </nav>

      <section className="clinical-section-mobile" aria-label="Sección clínica actual">
        <button
          type="button"
          className="clinical-section-mobile__trigger"
          aria-expanded={mobileOpen}
          aria-controls="clinical-mobile-sections"
          aria-label={`${current.short}, ${activeIndex + 1} de ${sections.length}`}
          onClick={() => setMobileOpen((value) => !value)}
        >
          <span className="clinical-section-mobile__copy"><small>Sección actual</small><strong>{current.short}</strong></span>
          <span className="clinical-section-mobile__position">{activeIndex + 1} de {sections.length}</span>
          <ClinicalStatusBadge status={sectionStatuses[current.id]} compact />
          <ChevronDown className={mobileOpen ? 'is-open' : ''} size={19} aria-hidden="true" />
        </button>
        {mobileOpen ? (
          <div id="clinical-mobile-sections" className="clinical-section-mobile__menu" role="region" aria-label="Cambiar sección clínica">
            {sections.map((section, index) => (
              <button
                type="button"
                key={section.id}
                className={section.id === activeSection ? 'is-active' : ''}
                aria-current={section.id === activeSection ? 'page' : undefined}
                onClick={() => selectSection(section.id)}
              >
                <span>{index + 1}</span>
                <strong>{section.short}</strong>
                <ClinicalStatusBadge status={sectionStatuses[section.id]} compact />
              </button>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
