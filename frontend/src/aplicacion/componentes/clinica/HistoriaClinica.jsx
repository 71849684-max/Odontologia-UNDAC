import React from 'react';
import { HistoriaClinicaProvider } from './contexto/HistoriaClinicaContext.jsx';
import ClinicalWorkspace from './workspace/ClinicalWorkspace.jsx';

export default function HistoriaClinica({ historiaId, initialSection = 'datos-paciente', onExit, rol }) {
  return (
    <HistoriaClinicaProvider historiaId={historiaId} initialSection={initialSection}>
      <ClinicalWorkspace onExit={onExit} rol={rol} />
    </HistoriaClinicaProvider>
  );
}
