import React from 'react';
import { Info } from 'lucide-react';
import { SectionCard, Field, TextAreaField } from '../compartidos/ControlesClinicos.jsx';
import { consentParagraphs } from './consentimiento.config.mjs';
import useSection from '../compartidos/useSection.js';
import Subheading from '../compartidos/Subheading.jsx';

export default function ConsentimientoSection({ values, onChange, patient, history, meta }) {
  const { get, set } = useSection(values, onChange);
  const patientName = patient?.nombres || get('paciente');
  const age = patient?.edad ?? get('edad');
  const sex = patient?.sexo === 'F' ? 'Femenino' : patient?.sexo === 'M' ? 'Masculino' : get('sexo');
  const dni = patient?.dni || get('dni');
  const hc = history?.codigo || get('hcNumero');
  return <div className="undac-section-stack clinical-consent-flow">
    <SectionCard title="Consentimiento informado" subtitle="Los datos identificatorios se recuperan de la historia clínica para evitar digitación duplicada.">
      <div className="clinical-context-note"><Info size={17} /><span>Los campos en gris provienen de Filiación. Si requieren corrección, actualice la sección de Ingreso y filiación.</span></div>
      <div className="undac-form-grid">
        <Field label="Apellidos y nombres del paciente" value={patientName} readOnly className="undac-col-2" />
        <Field label="Edad" value={age} readOnly /><Field label="Sexo" value={sex} readOnly />
        <Field label="DNI" value={dni} readOnly /><Field label="H.C. N.º" value={hc} readOnly />
        <Field label="Domicilio" value={get('domicilio')} onChange={set('domicilio')} className="undac-col-2" help="Se mantiene editable hasta enlazar este campo directamente con Filiación." />
        <Field label="Fecha" type="date" value={get('fecha')} onChange={set('fecha')} /><Field label="Profesional que informa / Dr.(a)" value={get('doctor') || meta?.docente || history?.docente || ''} onChange={set('doctor')} />
      </div>
      <div className="undac-consent-list">
        {consentParagraphs.map((paragraph, index) => <label className="undac-consent-item" key={index}><input type="checkbox" checked={Boolean(get(`consent${index + 1}`, false))} onChange={(event) => set(`consent${index + 1}`)(event.target.checked)} /><span><b>{index + 1}.</b> {paragraph}</span></label>)}
      </div>
      <TextAreaField label="Intervención quirúrgica autorizada" value={get('intervencionAutorizada')} onChange={set('intervencionAutorizada')} rows={4} />
      <div className="undac-form-grid">
        <Field label="Cerro de Pasco — día" value={get('firmaDia')} onChange={set('firmaDia')} /><Field label="Mes" value={get('firmaMes')} onChange={set('firmaMes')} /><Field label="Año" value={get('firmaAnio')} onChange={set('firmaAnio')} />
      </div>
    </SectionCard>
    <SectionCard title="Firmas, acompañante y programación" subtitle="Las áreas de firma continúan siendo marcadores visuales hasta integrar firma electrónica válida.">
      <div className="undac-signature-grid">
        {['Firma del paciente','Huella dactilar — dedo índice derecho','Firma del acompañante','Firma del docente — autorización de cirugía'].map((label) => <div className="undac-signature-slot" key={label}><span>Área reservada</span><strong>{label}</strong></div>)}
      </div>
      <Subheading>Familiar que lo acompaña</Subheading>
      <div className="undac-form-grid">
        <Field label="Apellidos y nombres" value={get('acompananteNombres')} onChange={set('acompananteNombres')} className="undac-col-2" />
        <Field label="Dirección" value={get('acompananteDireccion')} onChange={set('acompananteDireccion')} /><Field label="Parentesco" value={get('acompananteParentesco')} onChange={set('acompananteParentesco')} />
        <Field label="DNI" value={get('acompananteDni')} onChange={set('acompananteDni')} />
      </div>
      <Subheading>Programación de cirugía</Subheading>
      <div className="undac-form-grid"><Field label="Fecha" type="date" value={get('programacionFecha')} onChange={set('programacionFecha')} /><Field label="Hora" type="time" value={get('programacionHora')} onChange={set('programacionHora')} /><TextAreaField label="Observaciones" value={get('programacionObservaciones')} onChange={set('programacionObservaciones')} className="undac-col-2" rows={4} /></div>
    </SectionCard>
  </div>;
}
