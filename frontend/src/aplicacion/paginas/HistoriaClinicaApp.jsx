import React from 'react';
import HistoriaClinica from '../componentes/clinica/HistoriaClinica.jsx';

export default function HistoriaClinicaApp({ historiaId, seccionInicial = 'datos-paciente', onNavigate }) {
    return (
        <HistoriaClinica
            key={`${historiaId ?? 'mock'}-${seccionInicial}`}
            historiaId={historiaId}
            initialSection={seccionInicial}
            onExit={() => { if (typeof onNavigate === 'function') onNavigate('historias'); else window.onNavigate?.('historias'); }}
        />
    );
}
