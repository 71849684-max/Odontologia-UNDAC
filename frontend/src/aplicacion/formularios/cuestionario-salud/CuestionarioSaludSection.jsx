import React from 'react';
import { AlertTriangle, HeartPulse } from 'lucide-react';
import { CollapsibleSection, Field, ChoiceGroup } from '../compartidos/ControlesClinicos.jsx';
import { healthQuestions } from './cuestionario-salud.config.mjs';
import { yesNo } from '../compartidos/opcionesClinicas.js';
import useSection from '../compartidos/useSection.js';

const GROUPS = [
  { id: 'general', title: 'Atención médica y hospitalización', numbers: [1, 15, 16] },
  { id: 'cardio-renal', title: 'Cardiovascular, renal e hipertensión', numbers: [2, 3, 9] },
  { id: 'respiratorio', title: 'Respiratorio', numbers: [4, 23, 24] },
  { id: 'digestivo', title: 'Gástrico, digestivo y hepático', numbers: [5, 7, 8] },
  { id: 'neuro-endocrino', title: 'Neurológico, endocrino y metabólico', numbers: [6, 11, 19, 20, 21] },
  { id: 'alergias-otros', title: 'Alergias, hematología y otros antecedentes', numbers: [10, 12, 13, 14, 17, 18, 22] },
];

function answerFor(get, number) {
  return get(`q${number}Answer`);
}

export default function CuestionarioSaludSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  const answered = healthQuestions.filter((question) => yesNo.includes(answerFor(get, question.number))).length;
  const positive = healthQuestions.filter((question) => answerFor(get, question.number) === 'Sí');

  return <div className="undac-section-stack clinical-health-questionnaire">
    <section className="clinical-health-summary">
      <span className="clinical-health-summary__icon"><HeartPulse size={22} aria-hidden="true" /></span>
      <div><strong>Cuestionario de salud · 24 preguntas institucionales</strong><p>{answered} respondidas · {24 - answered} pendientes. Las respuestas afirmativas habilitan su detalle sin eliminar ni resumir preguntas del documento institucional.</p></div>
      {positive.length ? <span className="clinical-health-summary__alert"><AlertTriangle size={16} />{positive.length} respuesta{positive.length === 1 ? '' : 's'} positiva{positive.length === 1 ? '' : 's'}</span> : null}
    </section>

    <section className="clinical-health-overview" aria-label="Mapa del cuestionario">
      <div className="clinical-health-overview__heading"><h3>Estado de las preguntas</h3><p>Sí: respuesta afirmativa · No: respuesta negativa · Pendiente: sin respuesta</p></div>
      <ol className="clinical-health-matrix" aria-label="Estado de las 24 preguntas">
        {healthQuestions.map(({ number, text }) => {
          const answer = answerFor(get, number);
          const state = answer === 'Sí' ? 'positive' : answer === 'No' ? 'negative' : 'pending';
          return <li key={number} className={`is-${state}`} aria-label={`Pregunta ${number}: ${text} — ${state === 'pending' ? 'Pendiente' : answer}`}>
            <strong>{String(number).padStart(2, '0')}</strong><span>{state === 'pending' ? 'Pendiente' : answer}</span>
          </li>;
        })}
      </ol>
    </section>

    {GROUPS.map((group, groupIndex) => {
      const questions = group.numbers.map((number) => healthQuestions.find((question) => question.number === number)).filter(Boolean);
      const groupAnswered = questions.filter((question) => yesNo.includes(answerFor(get, question.number))).length;
      const groupPositive = questions.filter((question) => answerFor(get, question.number) === 'Sí').length;
      return <CollapsibleSection
        key={group.id}
        title={group.title}
        subtitle={`${questions.length} preguntas institucionales`}
        summary={`${groupAnswered}/${questions.length} respondidas${groupPositive ? ` · ${groupPositive} positiva${groupPositive === 1 ? '' : 's'}` : ''}`}
        defaultOpen={groupIndex === 0 || groupPositive > 0}
        status={groupAnswered === questions.length ? 'complete' : groupAnswered > 0 ? 'progress' : 'pending'}
      >
        <div className="undac-question-list">
          {questions.map((question) => {
            const answerKey = `q${question.number}Answer`;
            const answer = get(answerKey);
            return <div className={`undac-clinical-question${answer === 'Sí' ? ' is-positive' : ''}`} key={question.number}>
              <div className="undac-clinical-question__number">{String(question.number).padStart(2, '0')}</div>
              <div className="undac-clinical-question__content">
                <strong>{question.text}</strong>
                <ChoiceGroup label={`Respuesta de la pregunta ${question.number}`} value={answer} onChange={set(answerKey)} options={yesNo} />
                {answer === 'Sí' ? <div className="undac-question-detail">
                  <Field label={question.detailLabel || 'Detalle'} value={get(`q${question.number}Detail`)} onChange={set(`q${question.number}Detail`)} required />
                  {question.extraLabel ? <Field label={question.extraLabel} value={get(`q${question.number}Extra`)} onChange={set(`q${question.number}Extra`)} /> : null}
                </div> : null}
              </div>
            </div>;
          })}
        </div>
      </CollapsibleSection>;
    })}
  </div>;
}
