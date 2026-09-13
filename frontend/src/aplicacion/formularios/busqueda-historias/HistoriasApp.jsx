import { useMemo, useState } from 'react';
import { ClipboardPlus, Filter, Search } from 'lucide-react';
import { mockHistorias } from '../../configuracion/datosMock.mjs';
import { ProgressBar, StatusBadge } from '../compartidos/ControlesClinicos.jsx';
import EstadoVacio from '../../componentes/interfaz/EstadoVacio.jsx';

export default function HistoriasApp({ rol, onNavigate }) {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('');
    const filtered = useMemo(() => mockHistorias.filter((item) => (!status || item.estado === status) && `${item.paciente} ${item.codigo} ${item.dni} ${item.operador} ${item.docente}`.toLowerCase().includes(query.toLowerCase())), [query, status]);
    const go = (target) => typeof onNavigate === 'function' ? onNavigate(target) : window.onNavigate?.(target);
    const indicadores = [
        ['Total', mockHistorias.length],
        ['En proceso', mockHistorias.filter((item) => ['Borrador', 'En proceso'].includes(item.estado)).length],
        ['Pendientes', mockHistorias.filter((item) => item.estado === 'Pendiente de revisión').length],
        ['Finalizadas', mockHistorias.filter((item) => item.estado === 'Validada').length],
    ];

    return <div className="hc-page space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="hc-kicker">Gestión clínica</p><h1 className="hc-page-title">Historias clínicas</h1><p className="hc-page-subtitle">Seguimiento de historias para el perfil {rol === 'alumno' ? 'alumno operador' : rol}: borradores, revisión docente, observaciones y validación.</p></div>{rol !== 'docente' && <button type="button" className="hc-button hc-button--primary" onClick={() => go('nueva-historia')}><ClipboardPlus size={17} /> Nueva historia clínica</button>}</header>
        <section className="hc-compact-stats" aria-label="Resumen de historias">{indicadores.map(([etiqueta, valor]) => <article key={etiqueta}><strong>{valor}</strong><small>{etiqueta}</small></article>)}</section>
        <div className="hc-filterbar"><label className="hc-search"><Search size={17} /><span className="sr-only">Buscar historia clínica</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar paciente, historia, alumno o docente..." /></label><label className="hc-select-filter"><Filter size={16} /><span className="sr-only">Filtrar por estado</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos los estados</option>{['Borrador', 'En proceso', 'Pendiente de revisión', 'Observada', 'Validada'].map((item) => <option key={item}>{item}</option>)}</select></label></div>
        {filtered.length ? <div className="hc-table-card"><table className="hc-table"><thead><tr><th>N.º historia</th><th>Paciente</th><th>Operador</th><th>Docente</th><th>Progreso</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>{filtered.map((history) => <tr key={history.id}><td data-label="N.º historia"><strong>{history.codigo}</strong></td><td data-label="Paciente"><div className="hc-person"><span className="hc-avatar">{history.paciente.split(' ').slice(0, 2).map((p) => p[0]).join('')}</span><span><strong>{history.paciente}</strong><small>DNI {history.dni}</small></span></div></td><td data-label="Operador">{history.operador}</td><td data-label="Docente">{history.docente}</td><td data-label="Progreso"><ProgressBar value={history.progreso} /></td><td data-label="Estado"><StatusBadge status={history.estado} /></td><td data-label="Fecha">{history.fecha}</td><td data-label="Acciones"><button className="hc-mini-button" type="button" onClick={() => go({ view: 'historia', historiaId: history.id, section: 'datos-paciente' })}>Abrir</button></td></tr>)}</tbody></table></div> : <EstadoVacio titulo="No hay historias para mostrar" descripcion="Ajusta la búsqueda o selecciona otro estado." />}
    </div>;
}
