import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from 'lucide-react';
import { clinicalSections } from '../../../configuracion/historiaClinica.config.mjs';
import { componentesSeccion } from '../../../formularios/registroFormularios.js';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import PatientContextBar from './PatientContextBar.jsx';
import ClinicalMomentSidebar from './ClinicalMomentSidebar.jsx';
import ClinicalSectionTabs from './ClinicalSectionTabs.jsx';

const DESKTOP_NAVIGATION_QUERY = '(min-width: 992px)';

function desktopNavigationMatches() {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia(DESKTOP_NAVIGATION_QUERY).matches;
}

export default function ClinicalWorkspace({ onExit }) {
  const { patient, history, meta, activeSection, formData, updateActiveSection, navigateRelative, markCurrentComplete, sectionStatuses } = useHistoriaClinica();
  const active = clinicalSections.find((section) => section.id === activeSection) ?? clinicalSections[0];
  const index = clinicalSections.findIndex((section) => section.id === active.id);
  const ActiveComponent = componentesSeccion[active.id];
  const mainRef = useRef(null);
  const navigationTriggerRef = useRef(null);
  const navigationId = useId();
  const [desktopNavigation, setDesktopNavigation] = useState(desktopNavigationMatches);
  const [navigationOpen, setNavigationOpen] = useState(desktopNavigationMatches);
  const previousSection = useRef(activeSection);
  useEffect(() => {
    if (previousSection.current === activeSection) return;
    previousSection.current = activeSection;
    mainRef.current?.scrollIntoView?.({ block: 'start', behavior: 'instant' });
    mainRef.current?.focus({ preventScroll: true });
  }, [activeSection]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const media = window.matchMedia(DESKTOP_NAVIGATION_QUERY);
    const handleChange = (event) => {
      setDesktopNavigation(event.matches);
      setNavigationOpen(event.matches);
    };
    media.addEventListener?.('change', handleChange);
    return () => media.removeEventListener?.('change', handleChange);
  }, []);

  const mobileDrawerOpen = navigationOpen && !desktopNavigation;

  function closeMobileNavigation() {
    if (desktopNavigation) return;
    setNavigationOpen(false);
    navigationTriggerRef.current?.focus();
  }

  useEffect(() => {
    if (!mobileDrawerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeMobileNavigation();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileDrawerOpen, desktopNavigation]);

  return (
    <div className="clinical-workspace-shell" style={desktopNavigation ? { height: '100dvh', overflow: 'hidden' } : undefined}>
      <PatientContextBar
        onExit={onExit}
        navigationOpen={navigationOpen}
        onToggleNavigation={() => setNavigationOpen((current) => !current)}
        navigationId={navigationId}
        navigationTriggerRef={navigationTriggerRef}
        desktopNavigation={desktopNavigation}
      />
      {mobileDrawerOpen ? <button type="button" className="clinical-moment-overlay" aria-label="Cerrar momentos clínicos" onClick={closeMobileNavigation} /> : null}
      <div className={`clinical-workspace-layout is-navigation-${navigationOpen ? 'open' : 'closed'}${mobileDrawerOpen ? ' is-mobile-drawer-open' : ''}`} style={desktopNavigation ? { height: 'calc(100dvh - 73px)', overflow: 'hidden' } : undefined}>
        <ClinicalMomentSidebar id={navigationId} open={navigationOpen} onNavigate={closeMobileNavigation} />
        <main ref={mainRef} tabIndex={-1} inert={mobileDrawerOpen ? true : undefined} className={`clinical-workspace__main clinical-section--${active.id}`} style={desktopNavigation ? { height: '100%', overflowY: 'auto' } : undefined}>
          <ClinicalSectionTabs />
          <section className="clinical-active-section" aria-labelledby="clinical-active-title">
            <div className="clinical-active-section__heading">
              <div><span className="clinical-kicker">Sección {index + 1} de {clinicalSections.length}</span><h2 id="clinical-active-title">{active.label}</h2><p>Complete únicamente la información clínica necesaria. Los cambios se conservan automáticamente.</p></div>
              <span className={`clinical-active-section__state is-${sectionStatuses[active.id]}`}>{sectionStatuses[active.id] === 'complete' ? 'Completo' : sectionStatuses[active.id] === 'in-progress' ? 'En progreso' : 'Pendiente'}</span>
            </div>
            <div className="clinical-active-section__content">
              {ActiveComponent ? <ActiveComponent
                key={`${history.codigo}-${active.id}`}
                values={formData[active.id] || {}}
                allFormData={formData}
                onChange={updateActiveSection}
                meta={meta}
                patient={patient}
                history={history}
                patientId={history.codigo}
                patientName={patient.nombres}
                historyCode={history.codigo}
              /> : <div className="undac-card"><p>Sección preparada para implementación.</p></div>}
            </div>
          </section>
          <footer className="clinical-workspace-actions">
            <span className="clinical-workspace-actions__save"><Save size={15} aria-hidden="true" /><span>Autoguardado activo</span><small>Los cambios se conservan automáticamente.</small></span>
            <div>
              {index > 0 ? <button type="button" className="undac-btn undac-btn--ghost" onClick={() => navigateRelative(-1)}><ArrowLeft size={16} />Anterior</button> : null}
              <button type="button" className="undac-btn undac-btn--secondary" onClick={markCurrentComplete}><CheckCircle2 size={16} /><span className="clinical-action-label clinical-action-label--desktop">Marcar sección completa</span><span className="clinical-action-label clinical-action-label--mobile">Completar</span></button>
              {index < clinicalSections.length - 1 ? <button type="button" className="undac-btn undac-btn--primary" onClick={() => navigateRelative(1)}>Continuar<ArrowRight size={16} /></button> : null}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
