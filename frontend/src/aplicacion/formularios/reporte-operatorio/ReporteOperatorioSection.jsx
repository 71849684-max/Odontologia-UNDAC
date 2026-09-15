import React from 'react';
import { Info } from 'lucide-react';
import { SectionCard, Field, TextAreaField } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';
import Subheading from '../compartidos/Subheading.jsx';

function VitalControlTable({ values, onChange }) {
  const moments = [['pre','Pre operatorio'], ['intra','Intra-operatorio'], ['post','Post-operatorio']];
  const rows = [['pa','P.A.'],['temp','T°'],['fr','F.R.'],['fc','F.C.'],['pulso','Pulso']];
  return <div className="undac-table-wrap"><table className="undac-table undac-vital-table"><thead><tr><th>Control</th>{moments.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(([key,label]) => <tr key={key}><th>{label}</th>{moments.map(([moment]) => <td key={moment}><input aria-label={`${label} ${moment}`} value={values?.[`${moment}_${key}`] ?? ''} onChange={(event) => onChange?.(`${moment}_${key}`, event.target.value)} /></td>)}</tr>)}</tbody></table></div>;
}

export default function ReporteOperatorioSection({ values, onChange, patient, history, allFormData }) {
  const { get, set } = useSection(values, onChange);
  const patientData = allFormData?.['datos-paciente'] ?? {};
  const diagnosisData = allFormData?.diagnostico ?? {};
  const structuredDiagnosis = diagnosisData.diagnosticos?.find((item) => item.tipo === 'Definitivo') ?? diagnosisData.diagnosticos?.[0];
  const patientName = patient?.nombres || get('paciente');
  const sex = patient?.sexo === 'F' ? 'Femenino' : patient?.sexo === 'M' ? 'Masculino' : get('sexo');
  const definitiveDiagnosis = structuredDiagnosis ? `${structuredDiagnosis.codigo ? `${structuredDiagnosis.codigo} · ` : ''}${structuredDiagnosis.evidencia || structuredDiagnosis.observaciones || structuredDiagnosis.piezaRegion || ''}`.trim() : diagnosisData.dxDefinitivo || get('diagnosticoDefinitivo');
  const prognosis = diagnosisData.pronosticoEstructurado || diagnosisData.pronostico || get('pronostico');

  return <div className="undac-section-stack clinical-operative-report">
    <SectionCard title="Reporte operatorio" subtitle="Los datos ya existentes se recuperan de la historia clínica para que el operador se concentre en el procedimiento realizado.">
      <div className="clinical-context-note"><Info size={17} /><span>Paciente, operador, diagnóstico y pronóstico se precargan desde las secciones previas cuando están disponibles.</span></div>
      <div className="undac-form-grid">
        <Field label="Paciente — apellidos y nombres" value={patientName} readOnly className="undac-col-2" /><Field label="Edad" value={patient?.edad ?? get('edad')} readOnly /><Field label="Sexo" value={sex} readOnly />
        <Field label="Domicilio" value={patientData.domicilio || get('domicilio')} readOnly className="undac-col-2" /><Field label="Alumno de pregrado — apellidos y nombres" value={history?.operador || get('alumno')} readOnly /><Field label="Asistente" value={get('asistente')} onChange={set('asistente')} />
        <Field label="1. Lugar (sala de cirugía)" value={get('lugar')} onChange={set('lugar')} /><Field label="2. Caso clínico" value={get('casoClinico')} onChange={set('casoClinico')} />
        <Field label="3. Tipo de anestesia" value={get('tipoAnestesia')} onChange={set('tipoAnestesia')} /><Field label="4. Técnica de anestesia" value={get('tecnicaAnestesia')} onChange={set('tecnicaAnestesia')} />
        <TextAreaField label="5. Diagnóstico definitivo" value={definitiveDiagnosis} onChange={set('diagnosticoDefinitivo')} className="undac-col-2" rows={3} /><TextAreaField label="6. Tipo de tratamiento" value={get('tipoTratamiento')} onChange={set('tipoTratamiento')} className="undac-col-2" rows={3} />
      </div>
      <Subheading>Control de signos (funciones) vitales</Subheading>
      <VitalControlTable values={values} onChange={onChange} />
      <div className="undac-form-grid undac-form-grid--top">
        <TextAreaField label="7. Pronóstico" value={prognosis} onChange={set('pronostico')} className="undac-col-2" rows={3} />
        <Field label="8. Hora de inicio" type="time" value={get('horaInicio')} onChange={set('horaInicio')} /><Field label="9. Hora de término" type="time" value={get('horaTermino')} onChange={set('horaTermino')} />
        <TextAreaField label="10. Prescripción post operatoria" value={get('prescripcionPost')} onChange={set('prescripcionPost')} className="undac-col-2" rows={5} />
        <TextAreaField label="11. Alta" value={get('alta')} onChange={set('alta')} className="undac-col-2" rows={4} />
        <TextAreaField label="12. Epicrisis" value={get('epicrisis')} onChange={set('epicrisis')} className="undac-col-2" rows={5} />
        <Field label="Fecha" type="date" value={get('fecha')} onChange={set('fecha')} />
      </div>
      <div className="undac-signature-grid undac-signature-grid--2"><div className="undac-signature-slot"><span>Área reservada</span><strong>Firma del docente</strong></div><div className="undac-signature-slot"><span>Área reservada</span><strong>Firma del alumno</strong></div></div>
    </SectionCard>
  </div>;
}
