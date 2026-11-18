import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { listarConfiguracion } from '../../../servicios/servicioAdministracion.js';
import { idHistoria } from '../../../servicios/servicioClinico.js';
import BotonEliminacionClinica from '../../../formularios/busqueda-historias/BotonEliminacionClinica.jsx';
import { ArrowLeft, ArrowRight, BadgeCheck, MessageSquare, Printer, Send, Undo2 } from 'lucide-react';
import { componentesSeccion } from '../../../formularios/registroFormularios.js';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import { SECTION_STATUS, statusLabel } from '../logica/clinicalStatus.mjs';
import AutoSaveIndicator from './AutoSaveIndicator.jsx';
import PatientContextBar from './PatientContextBar.jsx';
import ClinicalMomentSidebar from './ClinicalMomentSidebar.jsx';
import ClinicalSectionTabs from './ClinicalSectionTabs.jsx';
import CargaVista from '../../interfaz/CargaVista.jsx';
import DecisionesConsentimiento from '../../../formularios/consentimiento/DecisionesConsentimiento.jsx';
import HistorialDocumentos from './HistorialDocumentos.jsx';
import DialogoObservaciones from './DialogoObservaciones.jsx';
import { LecturaClinicaContext } from '../../../formularios/compartidos/LecturaClinicaContext.js';

const DESKTOP_NAVIGATION_QUERY = '(min-width: 992px)';
const VistaPreviaImpresion = React.lazy(() => import('../impresion/VistaPreviaImpresion.jsx'));

function desktopNavigationMatches() {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia(DESKTOP_NAVIGATION_QUERY).matches;
}

export default function ClinicalWorkspace({ onExit, rol }) {
  const [observacionesAbiertas, setObservacionesAbiertas] = useState(false);
  const botonObservacionesRef = useRef(null);
  const cerrarObservaciones = useCallback(() => setObservacionesAbiertas(false), []);
  const {
    sections, patient, history, meta, activeSection, formData, updateActiveSection, navigateRelative,
    sendCurrentToReview, approveCurrent, returnCurrentToEdit, validationErrors = [], revisionAviso = '', errorGuardado = '', transicionEnCurso = false, aprobacionBloqueada = false, sectionStatuses, autosaveStatus, reintentarGuardado, lastSavedAt, cargandoExpediente,
  } = useHistoriaClinica();
  const supervisa = rol === 'docente' || rol === 'administrador';
  const estadoActual = sectionStatuses[activeSection];
  const soloLectura = estadoActual === SECTION_STATUS.APPROVED || (rol === 'alumno' && history.codigoEstado === 'VALIDADA');
  const active = sections.find((section) => section.id === activeSection) ?? sections[0];
  const index = sections.findIndex((section) => section.id === active?.id);
  const ActiveComponent = componentesSeccion[active.id];
  const mainRef = useRef(null);
  const navigationTriggerRef = useRef(null);
  const sidebarNavigationTriggerRef = useRef(null);
  const navigationId = useId();
  const [desktopNavigation, setDesktopNavigation] = useState(desktopNavigationMatches);
  const [navigationOpen, setNavigationOpen] = useState(desktopNavigationMatches);
  const [eliminacionActiva, setEliminacionActiva] = useState(false);
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const cerrarHistorial = useCallback(() => setHistorialAbierto(false), []);
  const [impresionCompleta, setImpresionCompleta] = useState(false);
  const [impresionAbierta, setImpresionAbierta] = useState(false);
  const abrirImpresion = useCallback(() => setImpresionAbierta(true), []);
  const cerrarImpresion = useCallback(() => setImpresionAbierta(false), []);
  const previousNavigationOpen = useRef(navigationOpen);
  const previousSection = useRef(activeSection);
  useEffect(() => {
    if (previousSection.current === activeSection) return;
    previousSection.current = activeSection;
    if (mainRef.current) mainRef.current.scrollTop = 0;
    mainRef.current?.focus({ preventScroll: true });
  }, [activeSection]);

  useEffect(() => {
    if (rol !== 'administrador') return undefined;
    let vigente = true;
    listarConfiguracion()
      .then((respuesta) => {
        const item = (respuesta.data ?? []).find((parametro) => parametro.codigo === 'ELIMINACION_CLINICA_PERMITIDA');
        if (vigente) setEliminacionActiva(Boolean(item?.valor));
      })
      .catch(() => { if (vigente) setEliminacionActiva(false); });
    return () => { vigente = false; };
  }, [rol]);

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
        rol={rol}
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
              <div><span className="clinical-kicker">Sección {index + 1} de {sections.length}</span><h2 id="clinical-active-title">{active.label}</h2><p>Complete únicamente la información clínica necesaria. Los cambios se conservan automáticamente.</p></div>
              <div className="clinical-active-section__meta">
                <span className={`clinical-active-section__state is-${estadoActual}`}>{statusLabel(estadoActual)}</span>
                <button type="button" className="undac-btn undac-btn--ghost clinical-print-hide" onClick={abrirImpresion}><Printer size={16} aria-hidden="true" />Imprimir</button>
                {idHistoria(history.id) ? <><button type="button" className="undac-btn undac-btn--ghost" onClick={() => setHistorialAbierto(true)}>Historial de documentos</button><button type="button" className="undac-btn undac-btn--ghost" onClick={() => setImpresionCompleta(true)}>Expediente completo</button></> : null}
              </div>
            </div>
            {validationErrors.length ? <div className="clinical-validation-summary" role="alert">
              <strong>Faltan datos para completar esta sección</strong>
              <ul>{validationErrors.map((error) => <li key={`${error.campo}-${error.mensaje}`}>{error.mensaje}</li>)}</ul>
            </div> : null}
            {revisionAviso ? <p className="clinical-revision-aviso" role="status">{revisionAviso}</p> : null}
            {errorGuardado ? <p className="hc-form-error" role="alert">No se pudo guardar: {errorGuardado}</p> : null}
            {autosaveStatus === 'local' ? <p className="clinical-local-banner" role="status">Sin conexión al servidor; los datos no se guardaron en la clínica.</p> : null}
            {soloLectura ? <p className="clinical-readonly-note" role="note">Sección aprobada por el profesional encargado: solo lectura. Pida que la reabra si necesita corregirla.</p> : null}
            <LecturaClinicaContext.Provider value={soloLectura || transicionEnCurso}>
            <div className="clinical-active-section__content" onClickCapture={evento => {
              if ((soloLectura || transicionEnCurso) && evento.target.closest('input[type="checkbox"], input[type="radio"], input[type="file"]')) evento.preventDefault();
            }}>
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
            </div>
            </LecturaClinicaContext.Provider>
            {active.id === 'consentimiento' && supervisa ? <DecisionesConsentimiento values={formData[active.id] || {}} onChange={updateActiveSection} history={history} /> : null}
          </section>
          <footer className="clinical-workspace-actions" inert={cargandoExpediente ? true : undefined} aria-busy={cargandoExpediente}>
            <span className="clinical-workspace-actions__save"><AutoSaveIndicator status={autosaveStatus} lastSavedAt={lastSavedAt} />{autosaveStatus === 'error' ? <button type="button" className="undac-btn undac-btn--secondary" disabled={transicionEnCurso} onClick={reintentarGuardado}>Reintentar guardado</button> : null}</span>
            <div>
              <button ref={botonObservacionesRef} type="button" className="undac-btn undac-btn--ghost" aria-haspopup="dialog" aria-expanded={observacionesAbiertas} onClick={() => setObservacionesAbiertas(true)} disabled={cargandoExpediente}><MessageSquare size={16} />Ver observaciones</button>
              {index > 0 ? <button type="button" className="undac-btn undac-btn--ghost" onClick={() => navigateRelative(-1)}><ArrowLeft size={16} />Anterior</button> : null}
              {estadoActual === SECTION_STATUS.REVIEW ? <>
                {supervisa ? <button type="button" className="undac-btn undac-btn--secondary" disabled={aprobacionBloqueada} onClick={approveCurrent}><BadgeCheck size={16} />{transicionEnCurso ? 'Guardando aprobación…' : 'Aprobar sección'}</button> : null}
              </> : estadoActual === SECTION_STATUS.APPROVED ? (
                supervisa ? <button type="button" className="undac-btn undac-btn--ghost" disabled={transicionEnCurso} onClick={returnCurrentToEdit}><Undo2 size={16} />Reabrir sección</button> : null
              ) : <>
                {rol === 'alumno' ? <button type="button" className="undac-btn undac-btn--ghost" disabled={transicionEnCurso} onClick={sendCurrentToReview}><Send size={16} />Enviar a revisión</button> : null}
                {supervisa ? <button type="button" className="undac-btn undac-btn--ghost" disabled={aprobacionBloqueada} onClick={approveCurrent}><BadgeCheck size={16} />{transicionEnCurso ? 'Guardando aprobación…' : 'Aprobar sección'}</button> : null}
              </>}
              {index < sections.length - 1 ? <button type="button" className="undac-btn undac-btn--primary" onClick={() => navigateRelative(1)}>Continuar<ArrowRight size={16} /></button> : null}
              {rol === 'administrador' && eliminacionActiva && idHistoria(history.id) ? <BotonEliminacionClinica historiaId={idHistoria(history.id)} codigo={history.codigo} className="undac-btn undac-btn--ghost" onInactivada={onExit} /> : null}
            </div>
          </footer>
        </main>
      </div>
      {historialAbierto ? <HistorialDocumentos historiaId={idHistoria(history.id)} onClose={cerrarHistorial} /> : null}
      {impresionCompleta ? <CargaVista><VistaPreviaImpresion seccionId="todas" onClose={() => setImpresionCompleta(false)} /></CargaVista> : null}
      {impresionAbierta ? <CargaVista><VistaPreviaImpresion seccionId={active.id} onClose={cerrarImpresion} /></CargaVista> : null}
      {observacionesAbiertas ? <DialogoObservaciones historia={history} triggerRef={botonObservacionesRef} alCerrar={cerrarObservaciones} /> : null}
    </div>
  );
}
