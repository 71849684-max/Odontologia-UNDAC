import React, { useState } from 'react';

export default function NuevaHistoriaApp({ onCreated }) {
    const [paciente, setPaciente] = useState('');
    const [docente, setDocente] = useState('');
    const [creada, setCreada] = useState(null);

    function crear() {
        const nueva = { id: 'hc-mock-' + Date.now(), codigo: 'HC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 900 + 100), paciente: paciente || 'Paciente demo' };
        setCreada(nueva);
        if (onCreated) onCreated(nueva);
        // also navigate to historia clínica using global helper if available
        if (window.onNavigate) window.onNavigate({ id: 'historia-clinica', params: { historiaId: nueva.id } });
    }

    if (creada) {
        return (
            <div className="pagina-nueva">
                <h2>Historia creada</h2>
                <p>Código: {creada.codigo}</p>
                <button type="button" onClick={() => { if (window.onNavigate) window.onNavigate({ id: 'historia-clinica', params: { historiaId: creada.id } }); }}>Continuar con la Historia Clínica</button>
            </div>
        );
    }

    return (
        <div className="pagina-nueva">
            <h2>Nueva Historia Clínica</h2>
            <label>Paciente<input value={paciente} onChange={(e) => setPaciente(e.target.value)} placeholder="Nombre del paciente"/></label>
            <label>Docente supervisor<input value={docente} onChange={(e) => setDocente(e.target.value)} placeholder="Docente"/></label>
            <div className="acciones">
                <button type="button" onClick={() => { setPaciente(''); setDocente(''); }}>Cancelar</button>
                <button type="button" onClick={crear}>Crear historia</button>
            </div>
        </div>
    );
}
