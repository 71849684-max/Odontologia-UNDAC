import React, { useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import '../../css/aplicacion/historia-clinica.css';
import { mockHistorias } from '../configuracion/datosMock.mjs';
import { ProgressBar, StatusBadge } from '../componentes/clinica/ControlesClinicos.jsx';

export default function HistoriasApp({ rol, onNavigate }) {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('');
    const filtered = useMemo(() => mockHistorias.filter((item) => (!status || item.estado === status) && `${item.paciente} ${item.codigo} ${item.dni}`.toLowerCase().includes(query.toLowerCase())), [query, status]);
    const go = (target) => {
        if (typeof onNavigate === 'function') onNavigate(target);
        else window.onNavigate?.(target);
    };

    return <div className="hc-page space-y-5">
        <header><p className="hc-kicker">Historia clínica</p><h1 className="hc-page-title">Historias clínicas</h1><p className="hc-page-subtitle">Seguimiento de historias para el perfil {rol || 'alumno'}: borradores, revisión docente, observaciones y validación.</p></header>
        <div className="hc-filterbar"><label className="hc-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar historia o paciente..." /></label><label className="hc-select-filter"><Filter size={16} /><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos los estados</option>{['Borrador','En proceso','Pendiente de revisión','Observada','Validada'].map((item) => <option key={item}>{item}</option>)}</select></label></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((history) => <article className="hc-history-card" key={history.id}><div className="hc-history-card__top"><span className="hc-avatar hc-avatar--lg">{history.paciente.split(' ').slice(0,2).map((p) => p[0]).join('')}</span><StatusBadge status={history.estado} /></div><h2>{history.paciente}</h2><p>{history.codigo} · DNI {history.dni}</p><dl><div><dt>Operador</dt><dd>{history.operador}</dd></div><div><dt>Docente</dt><dd>{history.docente}</dd></div><div><dt>Última edición</dt><dd>{history.fecha}</dd></div></dl><ProgressBar value={history.progreso} /><button className="hc-button hc-button--secondary hc-button--full" type="button" onClick={() => go({ view: 'historia', historiaId: history.id, section: 'datos-paciente' })}>Abrir historia clínica</button></article>)}</div>
    </div>;
}
