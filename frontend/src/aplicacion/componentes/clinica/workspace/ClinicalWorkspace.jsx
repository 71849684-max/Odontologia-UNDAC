import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from 'lucide-react';
import { clinicalSections } from '../../../configuracion/historiaClinica.config.mjs';
import { componentesSeccion } from '../../../formularios/registroFormularios.js';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import PatientContextBar from './PatientContextBar.jsx';
import ClinicalMomentSidebar from './ClinicalMomentSidebar.jsx';
import ClinicalMomentHeader from './ClinicalMomentHeader.jsx';
import ClinicalSectionTabs from './ClinicalSectionTabs.jsx';

export default function ClinicalWorkspace({ onExit }) {
  const { patient, history, meta, activeSection, formData, updateActiveSection, navigateRelative, markCurrentComplete, sectionStatuses } = useHistoriaClinica();
  const active = clinicalSections.find((section) => section.id === activeSection) ?? clinicalSections[0];
  const index = clinicalSections.findIndex((section) => section.id === active.id);
  const ActiveComponent = componentesSeccion[active.id];
  return (
    <div className="clinical-workspace-shell">
      <PatientContextBar onExit={onExit} />
      <div className="clinical-workspace-layout">
        <ClinicalMomentSidebar />
        <main className={`clinical-workspace__main clinical-section--${active.id}`}>
          <ClinicalMomentHeader />
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
            <span><Save size={15} aria-hidden="true" /> Autoguardado activo · el botón de completar cambia el estado clínico, no el guardado.</span>
            <div>
              {index > 0 ? <button type="button" className="undac-btn undac-btn--ghost" onClick={() => navigateRelative(-1)}><ArrowLeft size={16} />Anterior</button> : null}
              <button type="button" className="undac-btn undac-btn--secondary" onClick={markCurrentComplete}><CheckCircle2 size={16} />Marcar sección completa</button>
              {index < clinicalSections.length - 1 ? <button type="button" className="undac-btn undac-btn--primary" onClick={() => navigateRelative(1)}>Continuar<ArrowRight size={16} /></button> : null}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
