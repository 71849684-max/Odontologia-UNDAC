import React, { useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { CollapsibleSection, Field, SelectField, TextAreaField } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';

const EMPTY_DIAGNOSIS = {
  codigo: '',
  tipo: 'Presuntivo',
  piezaRegion: '',
  severidad: '',
  evidencia: '',
  observaciones: '',
};

export default function DiagnosticoSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  const diagnosticos = get('diagnosticos', []);
  const [confirmados, setConfirmados] = useState({});
  const [erroresDiagnostico, setErroresDiagnostico] = useState({});
  const updateDiagnosis = (index, key, value) => {
    setConfirmados((current) => ({ ...current, [index]: false }));
    set('diagnosticos')(diagnosticos.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  };
  const addDiagnosis = () => set('diagnosticos')([...diagnosticos, { ...EMPTY_DIAGNOSIS }]);
  const removeDiagnosis = (index) => {
    setConfirmados({});
    setErroresDiagnostico({});
    set('diagnosticos')(diagnosticos.filter((_, itemIndex) => itemIndex !== index));
  };
  const guardarDiagnostico = (index) => {
    if (!String(diagnosticos[index]?.codigo ?? '').trim()) {
      setErroresDiagnostico((current) => ({ ...current, [index]: 'Indique el código CIE-10 o estomatológico para guardar el diagnóstico.' }));
      return;
    }
    setErroresDiagnostico((current) => ({ ...current, [index]: '' }));
    setConfirmados((current) => ({ ...current, [index]: true }));
  };

  return <div className="undac-section-stack clinical-diagnosis-flow">
    <CollapsibleSection
      title="Síntesis diagnóstica estructurada"
      subtitle="Registre diagnósticos individuales para poder relacionarlos con hallazgos, piezas y procedimientos."
      summary={diagnosticos.length ? `${diagnosticos.length} diagnóstico${diagnosticos.length === 1 ? '' : 's'}` : 'Sin diagnósticos'}
      status={diagnosticos.length ? 'progress' : 'pending'}
      defaultOpen
    >
      {diagnosticos.length === 0 ? <div className="clinical-empty-inline"><strong>Aún no hay diagnósticos estructurados.</strong><span>Use “Registrar diagnóstico” para agregar el primero sin perder el resumen institucional disponible más abajo.</span><button type="button" className="undac-btn undac-btn--primary undac-btn--sm" onClick={addDiagnosis}><Plus size={16} />Registrar diagnóstico</button></div> : null}
      <div className="clinical-diagnosis-list">
        {diagnosticos.map((item, index) => <article className="clinical-diagnosis-card" key={`diagnostico-${index}`}>
          <div className="clinical-diagnosis-card__number">{index + 1}</div>
          <div className="clinical-diagnosis-card__fields">
            <Field label="Código CIE-10 / estomatológico" value={item.codigo} onChange={(value) => updateDiagnosis(index, 'codigo', value)} placeholder="Ej. K02.1" />
            <SelectField label="Tipo de diagnóstico" value={item.tipo} onChange={(value) => updateDiagnosis(index, 'tipo', value)} options={['Clínico-radiográfico','Presuntivo','Definitivo']} />
            <Field label="Pieza o región" value={item.piezaRegion} onChange={(value) => updateDiagnosis(index, 'piezaRegion', value)} placeholder="Ej. Pieza 21 / Generalizada" />
            <SelectField label="Severidad" value={item.severidad} onChange={(value) => updateDiagnosis(index, 'severidad', value)} options={['Leve','Moderada','Severa']} />
            <TextAreaField label="Evidencia clínica" value={item.evidencia} onChange={(value) => updateDiagnosis(index, 'evidencia', value)} rows={3} className="undac-col-2" />
            <TextAreaField label="Observaciones" value={item.observaciones} onChange={(value) => updateDiagnosis(index, 'observaciones', value)} rows={3} className="undac-col-2" />
          </div>
          <button type="button" className="clinical-icon-action is-danger" onClick={() => removeDiagnosis(index)} aria-label={`Eliminar diagnóstico ${index + 1}`}><Trash2 size={17} /></button>
          <div className="clinical-diagnosis-card__save">
            {erroresDiagnostico[index] ? <p role="alert">{erroresDiagnostico[index]}</p> : null}
            {confirmados[index] ? <span>Diagnóstico guardado</span> : null}
            <button type="button" className="undac-btn undac-btn--primary undac-btn--sm clinical-print-hide" onClick={() => guardarDiagnostico(index)}><Save size={16} />Guardar diagnóstico</button>
          </div>
        </article>)}
      </div>
      {diagnosticos.length > 0 ? <div className="clinical-diagnosis-register"><button type="button" className="undac-btn undac-btn--primary undac-btn--sm" onClick={addDiagnosis}><Plus size={16} />Registrar diagnóstico</button></div> : null}
    </CollapsibleSection>

    <CollapsibleSection title="Pronóstico clínico" subtitle="Conclusión general que orienta el plan de tratamiento." defaultOpen summary={get('pronosticoEstructurado') || 'Sin pronóstico'} status={get('pronosticoEstructurado') || get('pronosticoJustificacion') ? 'progress' : 'pending'}>
      <div className="undac-form-grid">
        <SelectField label="Pronóstico" value={get('pronosticoEstructurado')} onChange={set('pronosticoEstructurado')} options={['Favorable','Reservado','Desfavorable']} />
        <TextAreaField label="Justificación del pronóstico" value={get('pronosticoJustificacion')} onChange={set('pronosticoJustificacion')} className="undac-col-2" rows={4} />
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Resumen institucional del diagnóstico" subtitle="Campos del formato original conservados para compatibilidad documental" summary="Texto clínico libre" status={get('dxClinicoRadiografico') || get('dxPresuntivo') || get('dxDefinitivo') ? 'progress' : 'pending'}>
      <div className="undac-form-grid">
        <TextAreaField label="DX. clínico radiográfico" value={get('dxClinicoRadiografico')} onChange={set('dxClinicoRadiografico')} className="undac-col-2" rows={4} />
        <TextAreaField label="DX presuntivo" value={get('dxPresuntivo')} onChange={set('dxPresuntivo')} className="undac-col-2" rows={4} />
        <TextAreaField label="DX definitivo" value={get('dxDefinitivo')} onChange={set('dxDefinitivo')} className="undac-col-2" rows={4} />
        <TextAreaField label="Pronóstico" value={get('pronostico')} onChange={set('pronostico')} className="undac-col-2" rows={5} />
      </div>
    </CollapsibleSection>
  </div>;
}
