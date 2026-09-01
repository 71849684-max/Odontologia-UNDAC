import React, { useMemo, useState } from 'react';
import { ClipboardPlus, Search } from 'lucide-react';
import '../../css/aplicacion/historia-clinica.css';
import { mockPacientes } from '../configuracion/datosMock.mjs';
import { ProgressBar, StatusBadge } from '../componentes/clinica/ControlesClinicos.jsx';

export default function PacientesApp({ onNavigate }) {
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => mockPacientes.filter((item) => `${item.nombres} ${item.dni} ${item.hc}`.toLowerCase().includes(query.toLowerCase())), [query]);
    const go = (target) => {
        if (typeof onNavigate === 'function') onNavigate(target);
        else window.onNavigate?.(target);
    };

    return <div className="hc-page space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="hc-kicker">Gestión clínica</p><h1 className="hc-page-title">Pacientes</h1><p className="hc-page-subtitle">Búsqueda, identificación y acceso a la Historia Clínica odontológica.</p></div><button type="button" className="hc-button hc-button--primary" onClick={() => go('nueva-historia')}><ClipboardPlus size={17} /> Nueva historia</button></header>
        <div className="hc-filterbar"><label className="hc-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por paciente, DNI o historia..." /></label><span>{filtered.length} pacientes</span></div>
        <div className="hc-table-card"><table className="hc-table"><thead><tr><th>Paciente</th><th>Documento</th><th>Historia</th><th>Teléfono</th><th>Estado</th><th>Progreso</th><th>Acciones</th></tr></thead><tbody>{filtered.map((patient) => <tr key={patient.id}><td data-label="Paciente"><div className="hc-person"><span className="hc-avatar">{patient.nombres.split(' ').slice(0,2).map((p) => p[0]).join('')}</span><span><strong>{patient.nombres}</strong><small>{patient.edad} años · {patient.sexo}</small></span></div></td><td data-label="Documento">{patient.dni}</td><td data-label="Historia">{patient.hc}</td><td data-label="Teléfono">{patient.telefono}</td><td data-label="Estado"><StatusBadge status={patient.estado} /></td><td data-label="Progreso"><ProgressBar value={patient.progreso} /></td><td data-label="Acciones"><button type="button" className="hc-mini-button" onClick={() => go({ view: 'historia', historiaId: patient.id, section: 'datos-paciente' })}>Abrir</button></td></tr>)}</tbody></table></div>
    </div>;
}
