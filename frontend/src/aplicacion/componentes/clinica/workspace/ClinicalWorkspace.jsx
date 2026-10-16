import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Printer, Send, Undo2 } from 'lucide-react';
import { clinicalSections } from '../../../configuracion/historiaClinica.config.mjs';
import { componentesSeccion } from '../../../formularios/registroFormularios.js';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import { SECTION_STATUS, statusLabel } from '../logica/clinicalStatus.mjs';
import AutoSaveIndicator from './AutoSaveIndicator.jsx';
import PatientContextBar from './PatientContextBar.jsx';
import ClinicalMomentSidebar from './ClinicalMomentSidebar.jsx';
import ClinicalSectionTabs from './ClinicalSectionTabs.jsx';

const DESKTOP_NAVIGATION_QUERY = '(min-width: 992px)';

function desktopNavigationMatches() {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia(DESKTOP_NAVIGATION_QUERY).matches;
}

export default function ClinicalWorkspace({ onExit, rol }) {
  const {
    patient, history, meta, activeSection, formData, updateActiveSection, navigateRelative, markCurrentComplete,
    sendCurrentToReview, approveCurrent, returnCurrentToEdit, validationErrors = [], revisionAviso = '', sectionStatuses, autosaveStatus, lastSavedAt,
  } = useHistoriaClinica();
  const supervisa = rol === 'docente' || rol === 'administrador';
  const estadoActual = sectionStatuses[activeSection];
  const soloLectura = rol === 'alumno' && estadoActual === SECTION_STATUS.APPROVED;
  const active = clinicalSections.find((section) => section.id === activeSection) ?? clinicalSections[0];
  const index = clinicalSections.findIndex((section) => section.id === active.id);
  const ActiveComponent = componentesSeccion[active.id];
  const mainRef = useRef(null);
  const navigationTriggerRef = useRef(null);
  const sidebarNavigationTriggerRef = useRef(null);
  const navigationId = useId();
  const [desktopNavigation, setDesktopNavigation] = useState(desktopNavigationMatches);
  const [navigationOpen, setNavigationOpen] = useState(desktopNavigationMatches);
  const previousNavigationOpen = useRef(navigationOpen);
  const previousSection = useRef(activeSection);
  useEffect(() => {
    if (previousSection.current === activeSection) return;
    previousSection.current = activeSection;
    if (mainRef.current) mainRef.current.scrollTop = 0;
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

  useEffect(() => {
    if (previousNavigationOpen.current === navigationOpen) return;
    previousNavigationOpen.current = navigationOpen;
    if (!desktopNavigation) return;
    const target = navigationOpen ? sidebarNavigationTriggerRef.current : navigationTriggerRef.current;
    target?.focus({ preventScroll: true });
  }, [desktopNavigation, navigationOpen]);

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
    <div className="clinical-workspace-shell" style={desktopNavigation ? { height: '100dvh', overflow: 'hidden', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)' } : undefined}>
      <PatientContextBar
        onExit={onExit}
        navigationOpen={navigationOpen}
        onToggleNavigation={() => setNavigationOpen((current) => !current)}
        navigationId={navigationId}
        navigationTriggerRef={navigationTriggerRef}
        desktopNavigation={desktopNavigation}
        showNavigationToggle={!desktopNavigation || !navigationOpen}
      />
      {mobileDrawerOpen ? <button type="button" className="clinical-moment-overlay" aria-label="Cerrar momentos clínicos" onClick={closeMobileNavigation} /> : null}
      <div className={`clinical-workspace-layout is-navigation-${navigationOpen ? 'open' : 'closed'}${mobileDrawerOpen ? ' is-mobile-drawer-open' : ''}`} style={desktopNavigation ? { minHeight: 0, overflow: 'hidden' } : undefined}>
        <ClinicalMomentSidebar
          id={navigationId}
          open={navigationOpen}
          onNavigate={closeMobileNavigation}
          onToggle={() => setNavigationOpen(false)}
          desktopNavigation={desktopNavigation}
          navigationTriggerRef={sidebarNavigationTriggerRef}
        />
        <main ref={mainRef} tabIndex={-1} inert={mobileDrawerOpen ? true : undefined} className={`clinical-workspace__main clinical-section--${active.id}`} style={desktopNavigation ? { height: '100%', minHeight: 0, overflowY: 'auto' } : undefined}>
          <ClinicalSectionTabs />
          <section className="clinical-active-section" aria-labelledby="clinical-active-title">
            <div className="clinical-active-section__heading">
              <div><span className="clinical-kicker">Sección {index + 1} de {clinicalSections.length}</span><h2 id="clinical-active-title">{active.label}</h2><p>Complete únicamente la información clínica necesaria. Los cambios se conservan automáticamente.</p></div>
              <div className="clinical-active-section__meta">
                <span className={`clinical-active-section__state is-${estadoActual}`}>{statusLabel(estadoActual)}</span>
                <button type="button" className="undac-btn undac-btn--ghost clinical-print-hide" onClick={() => window.print()}><Printer size={16} aria-hidden="true" />Imprimir</button>
              </div>
            </div>
            {validationErrors.length ? <div className="clinical-validation-summary" role="alert">
              <strong>Faltan datos para completar esta sección</strong>
              <ul>{validationErrors.map((error) => <li key={`${error.campo}-${error.mensaje}`}>{error.mensaje}</li>)}</ul>
            </div> : null}
            {revisionAviso ? <p className="clinical-revision-aviso" role="status">{revisionAviso}</p> : null}
            {history.observacion ? <div className="clinical-observacion-docente" role="status">
              <strong>Observación del docente</strong>
              <p>{history.observacion}</p>
            </div> : null}
            {autosaveStatus === 'local' ? <p className="clinical-local-banner" role="status">Sin conexión al servidor; los datos no se guardaron en la clínica.</p> : null}
            {soloLectura ? <p className="clinical-readonly-note" role="note">Sección aprobada por el docente: solo lectura. Pida que la reabra si necesita corregirla.</p> : null}
            <fieldset className="clinical-active-section__content" disabled={soloLectura}>
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
                historyId={history.id}
              /> : <div className="undac-card"><p>Sección preparada para implementación.</p></div>}
            </fieldset>
          </section>
          <footer className="clinical-workspace-actions">
            <span className="clinical-workspace-actions__save"><AutoSaveIndicator status={autosaveStatus} lastSavedAt={lastSavedAt} /></span>
            <div>
              {index > 0 ? <button type="button" className="undac-btn undac-btn--ghost" onClick={() => navigateRelative(-1)}><ArrowLeft size={16} />Anterior</button> : null}
              {estadoActual === SECTION_STATUS.REVIEW ? <>
                {supervisa ? <button type="button" className="undac-btn undac-btn--secondary" onClick={approveCurrent}><BadgeCheck size={16} />Aprobar sección</button> : null}
                <button type="button" className="undac-btn undac-btn--ghost" onClick={returnCurrentToEdit}><Undo2 size={16} />{supervisa ? 'Devolver a edición' : 'Retomar edición'}</button>
              </> : estadoActual === SECTION_STATUS.APPROVED ? (
                supervisa ? <button type="button" className="undac-btn undac-btn--ghost" onClick={returnCurrentToEdit}><Undo2 size={16} />Reabrir sección</button> : null
              ) : <>
                <button type="button" className="undac-btn undac-btn--secondary" onClick={markCurrentComplete}><CheckCircle2 size={16} /><span className="clinical-action-label clinical-action-label--desktop">Marcar sección completa</span><span className="clinical-action-label clinical-action-label--mobile">Completar</span></button>
                {rol === 'alumno' ? <button type="button" className="undac-btn undac-btn--ghost" onClick={sendCurrentToReview}><Send size={16} />Enviar a revisión</button> : null}
                {supervisa ? <button type="button" className="undac-btn undac-btn--ghost" onClick={approveCurrent}><BadgeCheck size={16} />Aprobar sección</button> : null}
              </>}
              {index < clinicalSections.length - 1 ? <button type="button" className="undac-btn undac-btn--primary" onClick={() => navigateRelative(1)}>Continuar<ArrowRight size={16} /></button> : null}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
