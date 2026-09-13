import { useMemo, useState } from 'react';
import { ClipboardPlus, Search, UserPlus } from 'lucide-react';
import { mockHistorias, mockPacientes } from '../../configuracion/datosMock.mjs';
import { StatusBadge } from '../compartidos/ControlesClinicos.jsx';
import EstadoVacio from '../../componentes/interfaz/EstadoVacio.jsx';

export default function PacientesApp({ onNavigate }) {
    const [query, setQuery] = useState('');
    const [estado, setEstado] = useState('');
    const filtered = useMemo(() => mockPacientes.filter((item) => {
        const coincide = `${item.nombres} ${item.dni} ${item.hc}`.toLowerCase().includes(query.toLowerCase());
        return coincide && (!estado || item.estado === estado);
    }), [query, estado]);
    const go = (target) => typeof onNavigate === 'function' ? onNavigate(target) : window.onNavigate?.(target);

    return <div className="hc-page space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="hc-kicker">Gestión clínica</p><h1 className="hc-page-title">Pacientes</h1><p className="hc-page-subtitle">Gestión de pacientes registrados en la Clínica Odontológica Universitaria.</p></div><div className="flex flex-wrap gap-2"><button type="button" className="hc-button hc-button--ghost"><UserPlus size={17} /> Nuevo paciente</button><button type="button" className="hc-button hc-button--primary" onClick={() => go('nueva-historia')}><ClipboardPlus size={17} /> Nueva historia</button></div></header>
        <section className="hc-compact-stats" aria-label="Resumen de pacientes"><article><strong>{mockPacientes.length}</strong><small>Registrados</small></article><article><strong>{mockPacientes.filter((item) => item.estado === 'En proceso').length}</strong><small>En atención</small></article><article><strong>{mockPacientes.filter((item) => item.estado === 'Pendiente de revisión').length}</strong><small>Por revisar</small></article></section>
        <div className="hc-filterbar"><label className="hc-search"><Search size={17} /><span className="sr-only">Buscar paciente</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, DNI o código..." /></label><div className="hc-filter-actions"><label className="hc-select-filter"><span>Estado</span><select value={estado} onChange={(e) => setEstado(e.target.value)}><option value="">Todos</option>{[...new Set(mockPacientes.map((item) => item.estado))].map((item) => <option key={item}>{item}</option>)}</select></label><span>{filtered.length} pacientes</span></div></div>
        {filtered.length ? <div className="hc-table-card"><table className="hc-table"><thead><tr><th>Paciente</th><th>DNI</th><th>Edad</th><th>Teléfono</th><th>Historias</th><th>Estado</th><th>Última atención</th><th>Acciones</th></tr></thead><tbody>{filtered.map((patient) => { const historia = mockHistorias.find((item) => item.id === patient.id); return <tr key={patient.id}><td data-label="Paciente"><div className="hc-person"><span className="hc-avatar">{patient.nombres.split(' ').slice(0, 2).map((p) => p[0]).join('')}</span><span><strong>{patient.nombres}</strong><small>{patient.hc} · {patient.sexo}</small></span></div></td><td data-label="DNI">{patient.dni}</td><td data-label="Edad">{patient.edad} años</td><td data-label="Teléfono">{patient.telefono}</td><td data-label="Historias">1</td><td data-label="Estado"><StatusBadge status={patient.estado} /></td><td data-label="Última atención">{historia?.fecha ?? 'Sin atención'}</td><td data-label="Acciones"><div className="hc-row-actions"><button type="button" className="hc-mini-button" onClick={() => go({ view: 'historia', historiaId: patient.id, section: 'datos-paciente' })}>Ver</button><button type="button" className="hc-mini-button" onClick={() => go('nueva-historia')}>Nueva HC</button></div></td></tr>;})}</tbody></table></div> : <EstadoVacio titulo="No se encontraron pacientes" descripcion="Ajusta la búsqueda o el filtro para consultar otros registros." />}
    </div>;
}
