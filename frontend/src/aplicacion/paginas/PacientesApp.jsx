import React, { useState, useMemo } from 'react';
import { MOCK_PACIENTES } from '../configuracion/mockPacientes';
import PacienteForm from '../componentes/modulos/PacienteForm';
import PacienteDetalle from '../componentes/modulos/PacienteDetalle';

export default function PacientesApp() {
    const [pacientes, setPacientes] = useState(MOCK_PACIENTES);
    const [query, setQuery] = useState('');
    const [filtros, setFiltros] = useState({ estado: 'Todos', sexo: 'Todos', edadMin: '', edadMax: '' });
    const [editing, setEditing] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [showForm, setShowForm] = useState(false);

    function handleSave(p) {
        setPacientes((prev) => {
            const existe = prev.find(x => x.id === p.id);
            if (existe) return prev.map(x => x.id === p.id ? p : x);
            return [p, ...prev];
        });
        setShowForm(false);
        setEditing(null);
    }

    const resultados = useMemo(() => {
        const q = query.trim().toLowerCase();
        return pacientes.filter((p) => {
            if (q) {
                if (![p.nombre, p.codigo, p.dni].some(v => (v || '').toString().toLowerCase().includes(q))) return false;
            }
            if (filtros.estado !== 'Todos' && p.estado !== filtros.estado) return false;
            if (filtros.sexo !== 'Todos' && p.sexo && filtros.sexo !== 'Todos' && p.sexo !== filtros.sexo) return false;
            if (filtros.edadMin && p.edad < Number(filtros.edadMin)) return false;
            if (filtros.edadMax && p.edad > Number(filtros.edadMax)) return false;
            return true;
        });
    }, [pacientes, query, filtros]);

    function abrirCrear() { setEditing(null); setShowForm(true); }
    function abrirEditar(p) { setEditing(p); setShowForm(true); }
    function abrirVer(p) { setViewing(p); }

    function limpiarFiltros() { setFiltros({ estado: 'Todos', sexo: 'Todos', edadMin: '', edadMax: '' }); setQuery(''); }

    return (
        <div className="pagina-pacientes">
            <header className="pagina-cabecera">
                <div>
                    <h2>Pacientes</h2>
                    <p>Gestión de pacientes de la clínica odontológica</p>
                </div>
                <div className="acciones"><button type="button" onClick={abrirCrear}>+ Nuevo paciente</button></div>
            </header>

            <section className="filtros-busqueda">
                <input placeholder="Buscar paciente, código o documento..." value={query} onChange={(e) => setQuery(e.target.value)} />
                <div className="filtros">
                    <label>Estado<select value={filtros.estado} onChange={(e) => setFiltros(f => ({ ...f, estado: e.target.value }))}><option>Todos</option><option>Activo</option><option>Seguimiento</option><option>Pendiente</option></select></label>
                    <label>Sexo<select value={filtros.sexo} onChange={(e) => setFiltros(f => ({ ...f, sexo: e.target.value }))}><option>Todos</option><option>F</option><option>M</option><option>O</option></select></label>
                    <label>Edad desde<input type="number" value={filtros.edadMin} onChange={(e) => setFiltros(f => ({ ...f, edadMin: e.target.value }))} /></label>
                    <label>hasta<input type="number" value={filtros.edadMax} onChange={(e) => setFiltros(f => ({ ...f, edadMax: e.target.value }))} /></label>
                    <button type="button" onClick={limpiarFiltros}>Limpiar filtros</button>
                </div>
            </section>

            <section className="tabla-pacientes">
                <table>
                    <thead><tr><th>Código</th><th>Paciente</th><th>Documento</th><th>Edad</th><th>Sexo</th><th>Última atención</th><th>Historias</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {resultados.map(p => (
                            <tr key={p.id}>
                                <td>{p.codigo}</td>
                                <td>{p.nombres} {p.apellidoPaterno} {p.apellidoMaterno}</td>
                                <td>{p.numeroDocumento}</td>
                                <td>{p.edad ?? '-'}</td>
                                <td>{p.sexo ?? '-'}</td>
                                <td>{p.ultimaAtencion ?? '-'}</td>
                                <td>{p.historias ?? 0}</td>
                                <td>{p.estado}</td>
                                <td>
                                    <button onClick={() => abrirVer(p)}>Ver</button>
                                    <button onClick={() => abrirEditar(p)}>Editar</button>
                                    <button onClick={() => { if (window.onNavigate) window.onNavigate({ id: 'nueva-historia', params: { pacienteId: p.id } }); }}>Historia clínica</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* mobile cards */}
                <div className="cards-mobile">
                    {resultados.map(p => (
                        <article className="card-paciente" key={'m-'+p.id}>
                            <header><strong>{p.nombres} {p.apellidoPaterno}</strong><small>{p.codigo}</small></header>
                            <p>DNI: {p.numeroDocumento}</p>
                            <p>Edad: {p.edad ?? '-'}</p>
                            <p>Estado: {p.estado}</p>
                            <div className="acciones">
                                <button onClick={() => abrirVer(p)}>Ver</button>
                                <button onClick={() => abrirEditar(p)}>Editar</button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {showForm && <div className="modal-overlay" role="dialog"><div className="modal"><PacienteForm paciente={editing} onCancel={() => { setShowForm(false); setEditing(null); }} onSave={handleSave} /></div></div>}

            {viewing && <div className="modal-overlay" role="dialog"><div className="modal small"><PacienteDetalle paciente={viewing} onClose={() => setViewing(null)} /></div></div>}
        </div>
    );
}
