import React, { useCallback, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, Menu, ShieldCheck, UserRound } from 'lucide-react';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import OperatorAssignmentDialog from './OperatorAssignmentDialog.jsx';
import { asignarPersonal, idHistoria, mensajeError } from '../../../servicios/servicioClinico.js';

const MAX_ALERTAS = 4;

export default function PatientContextBar({ onExit, rol, navigationOpen = false, onToggleNavigation, navigationId, navigationTriggerRef, desktopNavigation = true, showNavigationToggle = true }) {
  const { patient, history, formData, meta, actualizarEquipo, alerts = [] } = useHistoriaClinica();
  const tipoAsignable = rol === 'alumno' ? 'DOCENTE' : 'ALUMNO';
  const etiquetaResponsable = tipoAsignable === 'DOCENTE' ? 'Profesional encargado' : 'Asistente responsable';
  const permiteAsignar = ['alumno', 'docente', 'administrador'].includes(rol);
  const [guardandoAsignacion, setGuardandoAsignacion] = useState(false);
  const [asignacionAbierta, setAsignacionAbierta] = useState(false);
  const [personalBorrador, setPersonalBorrador] = useState(null);
  const [errorAsignacion, setErrorAsignacion] = useState('');
  const assignmentTriggerRef = useRef(null);
  const cerrarAsignacion = useCallback(() => { setAsignacionAbierta(false); setErrorAsignacion(''); }, []);
  const datosPaciente = formData['datos-paciente'] || {};
  const operadorNombre = (tipoAsignable === 'DOCENTE' ? history.docente : history.operador) || 'Sin asignar';
  const initials = String(patient.nombres ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  function abrirAsignacion() {
    setPersonalBorrador(null);
    setAsignacionAbierta(true);
  }
  return <>
    <header className="clinical-patient-bar" style={{ position: desktopNavigation ? 'sticky' : 'relative' }}>
      <div className="clinical-patient-bar__context">
        <div className="clinical-patient-bar__identity">
          <div className="clinical-patient-bar__controls">
            <button type="button" className="clinical-patient-bar__back" onClick={onExit} aria-label="Volver a historias clínicas"><ArrowLeft size={19} /></button>
            {showNavigationToggle ? <button
              ref={navigationTriggerRef}
              type="button"
              className="clinical-patient-bar__navigation-toggle"
              aria-label={navigationOpen ? 'Ocultar momentos clínicos' : 'Mostrar momentos clínicos'}
              aria-expanded={navigationOpen}
              aria-controls={navigationId}
              onClick={onToggleNavigation}
            >
              <Menu size={19} aria-hidden="true" />
            </button> : null}
          </div>
          <span className="clinical-patient-avatar" aria-hidden="true">{initials || <UserRound size={18} />}</span>
          <div className="clinical-patient-bar__identity-copy">
            <h1>{patient.nombres}</h1>
            <p><span>DNI {patient.dni}</span><i /><span>{patient.edad} años</span><i /><span>{patient.sexo === 'F' ? 'Femenino' : patient.sexo === 'M' ? 'Masculino' : patient.sexo}</span><i /><b>{history.codigo}</b></p>
          </div>
        </div>

        <section className="clinical-care-summary" aria-label={etiquetaResponsable}>
          <span className="clinical-care-summary__icon"><ShieldCheck size={18} aria-hidden="true" /></span>
          <div><span>{etiquetaResponsable}</span><strong>{operadorNombre}</strong></div>
          {permiteAsignar ? <button ref={assignmentTriggerRef} type="button" aria-haspopup="dialog" aria-expanded={asignacionAbierta} onClick={abrirAsignacion}>Cambiar asignación</button> : null}
        </section>
      </div>
      {alerts.length ? <ul className="clinical-patient-bar__alert-strip" aria-label="Alertas clínicas">
        {alerts.slice(0, MAX_ALERTAS).map((alerta) => <li key={alerta.id} className={`clinical-alert-chip is-${alerta.level}`} title={`${alerta.label} · ${alerta.source}`}>
          {alerta.level === 'critical' ? <AlertTriangle size={13} aria-hidden="true" /> : null}
          <span>{alerta.level === 'critical' ? <span className="solo-lectores">Alerta crítica: </span> : null}{alerta.label}</span>
        </li>)}
        {alerts.length > MAX_ALERTAS ? <li className="clinical-alert-more">+{alerts.length - MAX_ALERTAS} más</li> : null}
      </ul> : null}
    </header>
    <OperatorAssignmentDialog
      open={asignacionAbierta}
      tipo={tipoAsignable}
      value={personalBorrador}
      meta={meta}
      fecha={datosPaciente.fechaPaciente}
      triggerRef={assignmentTriggerRef}
      onClose={() => { if (!guardandoAsignacion) cerrarAsignacion(); }}
      onSelect={async (persona) => {
        if (guardandoAsignacion) return;
        setPersonalBorrador(persona);
        setErrorAsignacion('');
        if (!persona) return;
        const servidor = idHistoria(history.id);
        if (!servidor || !persona.id) {
          setErrorAsignacion('La historia debe estar guardada en el servidor para cambiar su asignación.');
          return;
        }
        setGuardandoAsignacion(true);
        try {
          const historia = await asignarPersonal(servidor, persona.id);
          actualizarEquipo(historia);
          cerrarAsignacion();
        } catch (error) {
          setErrorAsignacion(mensajeError(error, 'No se pudo guardar la asignación.'));
        } finally {
          setGuardandoAsignacion(false);
        }
      }}
      error={errorAsignacion}
    />
  </>;
}
