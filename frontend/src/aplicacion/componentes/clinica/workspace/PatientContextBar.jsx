import React, { useState } from 'react';
import { ArrowLeft, Menu, PanelLeftClose, ShieldCheck, UserRound, X } from 'lucide-react';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import BusquedaPersonal from '../../../formularios/datos-paciente/BusquedaPersonal.jsx';

export default function PatientContextBar({ onExit, navigationOpen = false, onToggleNavigation, navigationId, navigationTriggerRef, desktopNavigation = true }) {
  const { patient, history, formData, meta, updateSection } = useHistoriaClinica();
  const [asignacionAbierta, setAsignacionAbierta] = useState(false);
  const datosPaciente = formData['datos-paciente'] || {};
  const operadorNombre = datosPaciente.personal?.nombre || datosPaciente.operador || history.operador || 'Sin asignar';
  const initials = String(patient.nombres ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const NavigationIcon = navigationOpen ? PanelLeftClose : Menu;
  return (
    <header className="clinical-patient-bar" style={{ position: desktopNavigation ? 'sticky' : 'relative' }}>
      <div className="clinical-patient-bar__context">
        <div className="clinical-patient-bar__identity">
          <div className="clinical-patient-bar__controls">
            <button type="button" className="clinical-patient-bar__back" onClick={onExit} aria-label="Volver a historias clínicas"><ArrowLeft size={19} /></button>
            <button
              ref={navigationTriggerRef}
              type="button"
              className="clinical-patient-bar__navigation-toggle"
              aria-label={navigationOpen ? 'Ocultar momentos clínicos' : 'Mostrar momentos clínicos'}
              aria-expanded={navigationOpen}
              aria-controls={navigationId}
              onClick={onToggleNavigation}
            >
              <NavigationIcon size={19} aria-hidden="true" />
            </button>
          </div>
          <span className="clinical-patient-avatar" aria-hidden="true">{initials || <UserRound size={18} />}</span>
          <div className="clinical-patient-bar__identity-copy">
            <h1>{patient.nombres}</h1>
            <p><span>DNI {patient.dni}</span><i /><span>{patient.edad} años</span><i /><span>{patient.sexo === 'F' ? 'Femenino' : patient.sexo === 'M' ? 'Masculino' : patient.sexo}</span><i /><b>{history.codigo}</b></p>
          </div>
        </div>

        <section className="clinical-care-summary" aria-label="Operador responsable">
          <span className="clinical-care-summary__icon"><ShieldCheck size={18} aria-hidden="true" /></span>
          <div><span>Operador responsable</span><strong>{operadorNombre}</strong></div>
          <button type="button" aria-haspopup="dialog" aria-expanded={asignacionAbierta} onClick={() => setAsignacionAbierta(true)}>Cambiar asignación</button>
        </section>
      </div>
      {asignacionAbierta && <div className="clinical-operator-modal-overlay" role="presentation" onClick={() => setAsignacionAbierta(false)}>
        <section className="clinical-operator-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-cambiar-operador" onClick={(event) => event.stopPropagation()}>
          <header className="clinical-operator-modal__header">
            <div><h3 id="titulo-cambiar-operador">Cambiar operador responsable</h3><p>Busque y seleccione al responsable de esta historia clínica.</p></div>
            <button type="button" className="hc-mini-button" onClick={() => setAsignacionAbierta(false)} aria-label="Cerrar"><X size={16} /></button>
          </header>
          <BusquedaPersonal
            value={datosPaciente.personal}
            meta={meta}
            fecha={datosPaciente.fechaPaciente}
            onChange={(persona) => {
              updateSection('datos-paciente', 'personal', persona);
              updateSection('datos-paciente', 'operador', persona?.nombre || '');
            }}
          />
        </section>
      </div>}
    </header>
  );
}
