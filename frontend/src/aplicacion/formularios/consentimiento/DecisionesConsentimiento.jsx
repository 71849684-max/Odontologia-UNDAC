import React, { useState } from 'react';
import { useHistoriaClinicaOpcional } from '../../componentes/clinica/contexto/HistoriaClinicaContext.jsx';
import { idHistoria, registrarDecisionConsentimiento, mensajeError } from '../../servicios/servicioClinico.js';
import { SectionCard, TextAreaField, SelectField, SlotConstancia } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';

export default function DecisionesConsentimiento({ values, onChange, history }) {
  const clinica = useHistoriaClinicaOpcional();
  const [decision, setDecision] = useState('OTORGADO');
  const [motivo, setMotivo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');
  async function registrar() {
    if (ocupado) return;
    setOcupado(true); setError('');
    try {
      if (!motivo.trim()) throw new Error('Describa la información y decisión del paciente.');
      if (!await clinica?.confirmarGuardado()) throw new Error('Guarde los cambios pendientes antes de registrar la decisión.');
      await registrarDecisionConsentimiento(idHistoria(history?.id), decision, motivo);
      window.location.reload();
    } catch (fallo) { setError(mensajeError(fallo, 'No se pudo registrar la decisión.')); }
    finally { setOcupado(false); }
  }
  const { get, set } = useSection(values, onChange);
  return idHistoria(history?.id) ? <SectionCard title="Registrar decisión del paciente" subtitle="Registra la decisión y sus constancias en el consentimiento y la auditoría. No constituye firma digital.">
      <p>Estado: {get('estadoConsentimiento', 'BORRADOR')} · Versión: {get('versionConsentimiento', 1)}</p>
      <SelectField label="Decisión" value={decision} onChange={setDecision} options={[{ value: 'OTORGADO', label: 'Otorgó su consentimiento' }, { value: 'NEGADO', label: 'Negó su consentimiento' }, { value: 'REVOCADO', label: 'Revocó su consentimiento anterior' }]} />
      <TextAreaField label="Constancia de información y decisión" value={motivo} onChange={setMotivo} rows={3} />
      <SlotConstancia campo="constanciaDecisionConsentimiento" label="Constancia de negativa o revocación" value={get('constanciaDecisionConsentimiento')} onChange={set('constanciaDecisionConsentimiento')} permitirDibujo />
      {error ? <p role="alert">{error}</p> : null}
      <button type="button" className="undac-btn undac-btn--primary" disabled={ocupado} onClick={registrar}>{ocupado ? 'Registrando…' : 'Conservar decisión y documento'}</button>
    </SectionCard> : null;
}
