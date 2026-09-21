import React from 'react';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import { healthQuestions } from '../../../formularios/cuestionario-salud/cuestionario-salud.config.mjs';

export default function ClinicalInterviewSummary() {
  const { formData } = useHistoriaClinica();
  const anamnesis = formData.anamnesis ?? {};
  const health = formData['cuestionario-salud'] ?? {};
  const answered = healthQuestions.filter(({ number }) => ['Sí', 'No'].includes(health[`q${number}Answer`])).length;
  const positive = healthQuestions.filter(({ number }) => health[`q${number}Answer`] === 'Sí').length;
  return <section className="clinical-interview-summary" aria-label="Resumen de entrevista">
    <div className="clinical-interview-summary__reason">
      <span className="clinical-kicker">Motivo de consulta</span>
      <p>{anamnesis.motivoConsulta?.trim() || 'Motivo pendiente de registrar'}</p>
      <small>{anamnesis.tipoAtencion || 'Tipo de atención pendiente'} · {anamnesis.estadoGeneral ? `Estado general: ${anamnesis.estadoGeneral}` : 'Estado general pendiente'}</small>
    </div>
    <div className="clinical-interview-summary__metrics" role="status" aria-label="Resumen del cuestionario">
      <div><strong>{answered} de {healthQuestions.length} respondidas</strong><small>Cuestionario de salud</small></div>
      <div className={positive ? 'is-positive' : ''}><strong>{positive} afirmativas</strong><small>Revisar detalle</small></div>
      <div><strong>{healthQuestions.length - answered} pendientes</strong><small>Por responder</small></div>
    </div>
  </section>;
}
