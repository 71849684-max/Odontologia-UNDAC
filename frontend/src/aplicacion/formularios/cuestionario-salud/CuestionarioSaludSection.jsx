import React from 'react';
import { SectionCard, Field, ChoiceGroup } from '../compartidos/ControlesClinicos.jsx';
import { healthQuestions } from './cuestionario-salud.config.mjs';
import { yesNo } from '../compartidos/opcionesClinicas.js';
import useSection from '../compartidos/useSection.js';

export default function CuestionarioSaludSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <SectionCard title="Cuestionario de salud — Antecedentes médicos" subtitle="Las 24 preguntas corresponden al documento institucional. Los detalles se habilitan al seleccionar Sí.">
    <div className="undac-question-list">
      {healthQuestions.map((question) => {
        const answerKey = `q${question.number}Answer`;
        const answer = get(answerKey);
        return <div className="undac-clinical-question" key={question.number}>
          <div className="undac-clinical-question__number">{question.number}</div>
          <div className="undac-clinical-question__content">
            <strong>{question.text}</strong>
            <ChoiceGroup label="Respuesta" value={answer} onChange={set(answerKey)} options={yesNo} />
            {answer === 'Sí' ? <div className="undac-question-detail">
              <Field label={question.detailLabel || 'Detalle'} value={get(`q${question.number}Detail`)} onChange={set(`q${question.number}Detail`)} />
              {question.extraLabel ? <Field label={question.extraLabel} value={get(`q${question.number}Extra`)} onChange={set(`q${question.number}Extra`)} /> : null}
            </div> : null}
          </div>
        </div>;
      })}
    </div>
  </SectionCard>;
}
