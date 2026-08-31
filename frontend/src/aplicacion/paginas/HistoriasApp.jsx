import React, { useState } from 'react';
import { MOCK_HISTORIAS } from '../configuracion/mockHistorias';

export default function HistoriasApp({ rol }) {
    const [q, setQ] = useState('');
    const [estado, setEstado] = useState('Todos');
    const resultados = MOCK_HISTORIAS.filter(h => {
        if (q) {
            const t = q.toLowerCase();
            if (![h.codigo, h.paciente, h.operador, h.docente].some(v => (v || '').toLowerCase().includes(t))) return false;
        }
        if (estado !== 'Todos' && h.estado !== estado) return false;
        return true;
    });

    function abrir(h) {
        if (window.onNavigate) window.onNavigate({ id: 'historia-clinica', params: { historiaId: h.id } });
    }

    return (
        <div className="pagina-historias">
            <header className="pagina-cabecera">
                <h2>Historias Clínicas</h2>
                <p>Listado de historias clínicas</p>
            </header>

            <section className="filtros-busqueda">
                <input placeholder="Buscar por código, paciente, operador..." value={q} onChange={(e) => setQ(e.target.value)} />
                <label>Estado<select value={estado} onChange={(e) => setEstado(e.target.value)}><option>Todos</option><option>En proceso</option><option>Pendiente de revisión</option><option>Validada</option></select></label>
            </section>

            <section className="tabla-historias">
                <table>
                    <thead><tr><th>Código</th><th>Paciente</th><th>Operador</th><th>Docente</th><th>Fecha</th><th>Progreso</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {resultados.map(h => (
                            <tr key={h.id}>
                                <td>{h.codigo}</td>
                                <td>{h.paciente}</td>
                                <td>{h.operador}</td>
                                <td>{h.docente}</td>
                                <td>{h.fecha}</td>
                                <td>{h.progreso}%</td>
                                <td>{h.estado}</td>
                                <td><button onClick={() => abrir(h)}>Ver</button> <button onClick={() => abrir(h)}>Continuar</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
