import React from 'react';
import HistoriaClinica from '../componentes/clinica/HistoriaClinica.jsx';

export default function HistoriaClinicaApp({ historiaId, seccionInicial = 'datos-paciente', onNavigate, rol, permisos = null }) {
    return (
        <HistoriaClinica
            key={`${historiaId ?? 'sin-historia'}-${seccionInicial}`}
            historiaId={historiaId}
            initialSection={seccionInicial}
            permisos={permisos}
            rol={rol}
            onExit={() => { if (typeof onNavigate === 'function') onNavigate('historias'); else window.onNavigate?.('historias'); }}
        />
    );
}
