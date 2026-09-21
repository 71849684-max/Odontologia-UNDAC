import React from 'react';
import { ArrowLeft, ShieldAlert, UserRound } from 'lucide-react';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import { clinicalSections } from '../../../configuracion/historiaClinica.config.mjs';
import { SECTION_STATUS } from '../logica/clinicalStatus.mjs';
import AutoSaveIndicator from './AutoSaveIndicator.jsx';

export default function PatientContextBar({ onExit }) {
  const { patient, history, meta, alerts, autosaveStatus, lastSavedAt, sectionStatuses } = useHistoriaClinica();
  const initials = String(patient.nombres ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const complete = clinicalSections.filter(({ id }) => [SECTION_STATUS.COMPLETE, SECTION_STATUS.REVIEW, SECTION_STATUS.APPROVED].includes(sectionStatuses[id])).length;
  const progress = Math.round(complete / clinicalSections.length * 100);
  return (
    <header className="clinical-patient-bar">
      <div className="clinical-patient-bar__context">
        <div className="clinical-patient-bar__identity">
          <button type="button" className="clinical-patient-bar__back" onClick={onExit} aria-label="Volver a historias clínicas"><ArrowLeft size={19} /></button>
          <span className="clinical-patient-avatar" aria-hidden="true">{initials || <UserRound size={18} />}</span>
          <div className="clinical-patient-bar__identity-copy">
            <h1>{patient.nombres}</h1>
            <p><span>DNI {patient.dni}</span><i /><span>{patient.edad} años</span><i /><span>{patient.sexo === 'F' ? 'Femenino' : patient.sexo === 'M' ? 'Masculino' : patient.sexo}</span><i /><b>{history.codigo}</b></p>
          </div>
        </div>

        <div className="clinical-patient-bar__alerts" aria-label="Alertas clínicas activas">
          {alerts.length === 0
            ? <span className="clinical-alert-chip is-neutral"><ShieldAlert size={15} />Sin alertas clínicas activas</span>
            : alerts.map((alert) => <span key={alert.id} className={`clinical-alert-chip is-${alert.level}`} title={alert.source}><ShieldAlert size={15} />{alert.label}</span>)}
        </div>

        <div className="clinical-patient-bar__save">
          <AutoSaveIndicator status={autosaveStatus} lastSavedAt={lastSavedAt} />
          <div className="clinical-history-progress">
            <span className="clinical-history-progress__copy"><small>Progreso</small><strong>{progress}%</strong></span>
            <div className="clinical-history-progress__track" role="progressbar" aria-label="Progreso de la historia clínica" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><i style={{ width: `${progress}%` }} /></div>
            <span>{complete} de {clinicalSections.length} secciones</span>
          </div>
        </div>
      </div>
      <dl className="clinical-care-summary" aria-label="Resumen de atención actual">
        <div><dt>Operador</dt><dd>{history.operador || 'Sin asignar'}</dd></div>
        <div><dt>Semestre</dt><dd>{meta?.semestre || '—'}</dd></div>
        <div><dt>Estado</dt><dd><i aria-hidden="true" />En registro</dd></div>
      </dl>
    </header>
  );
}
