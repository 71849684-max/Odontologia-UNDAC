import React from 'react';
import { HistoriaClinicaProvider } from './contexto/HistoriaClinicaContext.jsx';
import ClinicalWorkspace from './workspace/ClinicalWorkspace.jsx';

export default function HistoriaClinica({ historiaId, initialSection = 'datos-paciente', onExit, rol, permisos = null }) {
  return (
    <HistoriaClinicaProvider key={String(historiaId ?? '')} historiaId={historiaId} initialSection={initialSection} permisos={permisos}>
      <ClinicalWorkspace onExit={onExit} rol={rol} />
    </HistoriaClinicaProvider>
  );
}
