import React from 'react';
import { ArrowLeft, ShieldAlert, UserRound } from 'lucide-react';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import AutoSaveIndicator from './AutoSaveIndicator.jsx';

export default function PatientContextBar({ onExit }) {
  const { patient, history, meta, alerts, autosaveStatus, lastSavedAt } = useHistoriaClinica();
  const initials = String(patient.nombres ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const operatorInitials = String(history.operador ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return (
    <header className="clinical-patient-bar">
      <div className="clinical-patient-bar__top">
        <div className="clinical-patient-bar__start"><button type="button" className="clinical-patient-bar__back" onClick={onExit} aria-label="Volver a historias clínicas"><ArrowLeft size={19} /></button><span className="clinical-patient-bar__brand"><strong>Historia clínica</strong><small>Clínica Odontológica UNDAC</small></span></div>
        <div className="clinical-patient-bar__top-actions">
          <AutoSaveIndicator status={autosaveStatus} lastSavedAt={lastSavedAt} />
          <span className="clinical-operator-avatar" aria-hidden="true">{operatorInitials || 'OP'}</span>
          <span className="clinical-patient-bar__operator"><strong>{history.operador || 'Operador sin asignar'}</strong><small>Operador activo</small></span>
        </div>
      </div>
      <div className="clinical-patient-bar__context">
        <div className="clinical-patient-bar__identity">
          <span className="clinical-patient-avatar">{initials || <UserRound size={18} />}</span>
          <div><h1>{patient.nombres}</h1><p>DNI {patient.dni} <i /> {patient.edad} años <i /> {patient.sexo === 'F' ? 'Femenino' : patient.sexo === 'M' ? 'Masculino' : patient.sexo} <i /> <b>{history.codigo}</b></p></div>
        </div>
        <div className="clinical-patient-bar__alerts" aria-label="Alertas clínicas activas">
          {alerts.length === 0 ? <span className="clinical-alert-chip is-neutral"><ShieldAlert size={15} />Sin alertas clínicas activas</span> : alerts.slice(0, 3).map((alert) => <span key={alert.id} className={`clinical-alert-chip is-${alert.level}`} title={alert.source}><ShieldAlert size={15} />{alert.label}</span>)}
          {alerts.length > 3 ? <span className="clinical-alert-more">+{alerts.length - 3}</span> : null}
        </div>
        <dl className="clinical-care-summary" aria-label="Resumen de atención actual">
          <div><dt>Operador</dt><dd>{history.operador || 'Sin asignar'}</dd></div>
          <div><dt>Semestre</dt><dd>{meta?.semestre || '—'}</dd></div>
          <div><dt>Estado</dt><dd><i aria-hidden="true" />En registro</dd></div>
        </dl>
      </div>
    </header>
  );
}
