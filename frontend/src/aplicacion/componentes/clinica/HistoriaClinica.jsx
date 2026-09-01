import React, { useMemo, useState } from 'react';
import '../../../css/aplicacion/historia-clinica.css';
import { clinicalSections } from '../../configuracion/historiaClinica.config.mjs';
import { createEmptyOdontogram } from '../../configuracion/odontograma.config.mjs';
import { mockHistoriaMeta, mockHistorias, mockPacientes } from '../../configuracion/datosMock.mjs';
import { ProgressBar, SaveBar, StatusBadge } from './ControlesClinicos.jsx';
import Odontograma from './Odontograma.jsx';
import {
  DatosPacienteSection,
  AnamnesisSection,
  CuestionarioSaludSection,
  AntecedentesSection,
  ExamenClinicoSection,
  ExamenExtraoralSection,
  ExamenIntraoralSection,
  OclusionSection,
  ExamenesAuxiliaresSection,
  DiagnosticoSection,
  ModelosSection,
  PlanTratamientoSection,
  ConsentimientoSection,
  CirugiaSection,
  ReporteOperatorioSection,
  SeguimientoSection,
} from './SeccionesClinicas.jsx';

const componentMap = {
  'datos-paciente': DatosPacienteSection,
  anamnesis: AnamnesisSection,
  'cuestionario-salud': CuestionarioSaludSection,
  antecedentes: AntecedentesSection,
  'examen-clinico': ExamenClinicoSection,
  'examen-extraoral': ExamenExtraoralSection,
  'examen-intraoral': ExamenIntraoralSection,
  oclusion: OclusionSection,
  'examenes-auxiliares': ExamenesAuxiliaresSection,
  diagnostico: DiagnosticoSection,
  modelos: ModelosSection,
  'plan-tratamiento': PlanTratamientoSection,
  consentimiento: ConsentimientoSection,
  cirugia: CirugiaSection,
  'reporte-operatorio': ReporteOperatorioSection,
  seguimiento: SeguimientoSection,
};

const navGlyphs = {
  'datos-paciente': '01', anamnesis: '02', 'cuestionario-salud': '03', antecedentes: '04', 'examen-clinico': '05',
  'examen-extraoral': '06', 'examen-intraoral': '07', odontograma: '08', oclusion: '09', 'examenes-auxiliares': '10',
  diagnostico: '11', modelos: '12', 'plan-tratamiento': '13', consentimiento: '14', cirugia: '15', 'reporte-operatorio': '16', seguimiento: '17'
};

export default function HistoriaClinica({ historiaId, initialSection = 'datos-paciente', onExit }) {
  const safeInitial = clinicalSections.some((item) => item.id === initialSection) ? initialSection : 'datos-paciente';
  const selectedPatient = mockPacientes.find((item) => String(item.id) === String(historiaId)) || mockPacientes[0];
  const selectedHistory = mockHistorias.find((item) => String(item.id) === String(historiaId)) || mockHistorias[0];
  const patientInitials = selectedPatient.nombres.split(' ').slice(0, 2).map((part) => part[0]).join('');
  const [activeSection, setActiveSection] = useState(safeInitial);
  const [formData, setFormData] = useState({});
  const [odontogram, setOdontogram] = useState(() => createEmptyOdontogram());
  const [completed, setCompleted] = useState(new Set(['datos-paciente','anamnesis','cuestionario-salud','antecedentes','examen-clinico','examen-extraoral']));
  const [savedMessage, setSavedMessage] = useState('');

  const sectionIndex = clinicalSections.findIndex((item) => item.id === activeSection);
  const active = clinicalSections[sectionIndex] || clinicalSections[0];
  const progress = Math.round((completed.size / clinicalSections.length) * 100);
  const grouped = useMemo(() => clinicalSections.reduce((acc, item) => { (acc[item.group] ||= []).push(item); return acc; }, {}), []);

  const updateSection = (key, value) => setFormData((current) => ({
    ...current,
    [activeSection]: { ...(current[activeSection] || {}), [key]: value },
  }));

  const save = () => {
    setCompleted((current) => new Set([...current, activeSection]));
    setSavedMessage(`“${active.label}” guardado localmente.`);
    window.setTimeout?.(() => setSavedMessage(''), 1800);
  };

  const go = (offset) => {
    save();
    const nextIndex = Math.min(clinicalSections.length - 1, Math.max(0, sectionIndex + offset));
    setActiveSection(clinicalSections[nextIndex].id);
    document.querySelector('.undac-hc-main')?.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const ActiveComponent = componentMap[activeSection];

  return (
    <div className="undac-hc-shell hc-clinical-shell">
      <header className="undac-hc-header">
        <button type="button" className="undac-icon-btn undac-hc-back" onClick={onExit} aria-label="Volver a historias">←</button>
        <div className="undac-hc-header__patient">
          <span className="undac-avatar undac-avatar--lg">{patientInitials}</span>
          <div><span className="undac-eyebrow">Historia clínica · {selectedHistory.codigo}</span><h1>{selectedPatient.nombres}</h1><p>DNI {selectedPatient.dni} · {selectedPatient.edad} años · {selectedPatient.sexo} · Operador: {selectedHistory.operador}</p></div>
        </div>
        <div className="undac-hc-header__meta">
          <StatusBadge status={selectedHistory.estado} />
          <ProgressBar value={progress} label="Progreso de secciones" />
          <button type="button" className="undac-btn undac-btn--secondary undac-btn--sm" onClick={save}>Guardar</button>
        </div>
      </header>

      <div className="undac-hc-body">
        <aside className="undac-hc-nav hc-section-nav" aria-label="Secciones de Historia Clínica">
          <div className="undac-hc-nav__intro"><strong>Historia clínica</strong><span>{completed.size} de {clinicalSections.length} secciones trabajadas</span></div>
          {Object.entries(grouped).map(([group, items]) => <div className="undac-hc-nav__group" key={group}><span className="undac-hc-nav__group-title">{group}</span>{items.map((section) => {
            const isActive = section.id === activeSection;
            const isComplete = completed.has(section.id);
            return <button type="button" key={section.id} className={`${isActive ? 'is-active' : ''} ${isComplete ? 'is-complete' : ''}`} onClick={() => setActiveSection(section.id)} aria-current={isActive ? 'page' : undefined}><span className="undac-hc-nav__num">{navGlyphs[section.id]}</span><span className="undac-hc-nav__label">{section.short}</span><span className="undac-hc-nav__state" aria-label={isComplete ? 'Sección trabajada' : 'Sección pendiente'}>{isComplete ? '✓' : '•'}</span></button>; })}</div>)}
        </aside>

        <main className="undac-hc-main">
          <div className="undac-hc-main__heading">
            <div><span className="undac-eyebrow">Sección {String(sectionIndex + 1).padStart(2, '0')} de {clinicalSections.length}</span><h2>{active.label}</h2><p>Registro frontend-only · datos ficticios · guardado local.</p></div>
            <div className="undac-hc-main__academic"><span><b>Semestre</b>{mockHistoriaMeta.semestre}</span><span><b>Año</b>{mockHistoriaMeta.anioAcademico}</span><span><b>Docente</b>{mockHistoriaMeta.docente}</span></div>
          </div>

          {savedMessage ? <div className="undac-toast" role="status">✓ {savedMessage}</div> : null}

          <div className="undac-hc-content">
            {activeSection === 'odontograma'
              ? <Odontograma value={odontogram} onChange={setOdontogram} />
              : ActiveComponent
                ? <ActiveComponent values={formData[activeSection] || {}} onChange={updateSection} meta={mockHistoriaMeta} />
                : <div className="undac-card"><p>Sección preparada para implementación.</p></div>}
          </div>

          <SaveBar sectionLabel={active.label} onSave={save} onPrevious={() => go(-1)} onNext={() => go(1)} isFirst={sectionIndex === 0} isLast={sectionIndex === clinicalSections.length - 1} />
        </main>
      </div>
    </div>
  );
}
