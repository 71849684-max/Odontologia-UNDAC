import { useEffect, useState } from 'react';
import { ClipboardCheck, FileText, ShieldCheck, Users } from 'lucide-react';
import { listarHistorias, listarPacientesLocales } from '../servicios/registroHistoriaClinica.js';
import { listarHistoriasRemotas, listarPacientes } from '../servicios/servicioClinico.js';

const PERFIL = {
    administrador: {
        etiqueta: 'Administrador',
        contexto: 'Vista general de operación, accesos y trazabilidad del sistema.',
    },
    docente: {
        etiqueta: 'Docente',
        contexto: 'Supervisión académica, validaciones y continuidad de atención.',
    },
    alumno: {
        etiqueta: 'Alumno operador',
        contexto: 'Tus historias, tareas clínicas y próximos controles.',
    },
};

function go(onNavigate, target) {
    if (onNavigate) onNavigate(target);
    else window.onNavigate?.(target);
}

function saludoActual() {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
}

function nombreCorto(nombre = '') {
    return nombre.replace(/^(dra?\.?|prof\.?|lic\.?)\s+/i, '').split(' ')[0] || 'usuario';
}

export default function DashboardApp({ rol = 'alumno', usuario, onNavigate }) {
    const perfil = PERFIL[rol] ?? PERFIL.alumno;
    const [historias, setHistorias] = useState(listarHistorias);
    const [pacientes, setPacientes] = useState(listarPacientesLocales);

    useEffect(() => {
        let vigente = true;
        Promise.all([listarHistoriasRemotas(), listarPacientes()])
            .then(([listaHistorias, listaPacientes]) => {
                if (!vigente) return;
                setHistorias(listaHistorias);
                setPacientes(listaPacientes);
            })
            .catch(() => {});
        return () => { vigente = false; };
    }, [rol]);

    const enProceso = historias.filter((item) => ['Borrador', 'En proceso'].includes(item.estado)).length;
    const pendientesRevision = historias.filter((item) => item.estado === 'Pendiente de revisión').length;
    const finalizadas = historias.filter((item) => item.estado === 'Validada').length;
    const indicadores = [
        { etiqueta: 'Pacientes registrados', valor: pacientes.length, detalle: pacientes.length ? `${pacientes.filter((item) => (item.historias ?? 0) > 0).length} con historia` : 'Sin registros', icono: Users, target: rol === 'alumno' ? 'mis-pacientes' : 'pacientes' },
        { etiqueta: 'Historias clínicas', valor: historias.length, detalle: `${enProceso} activas`, icono: FileText, target: rol === 'alumno' ? 'mis-historias' : 'historias' },
        { etiqueta: 'Pendientes de validación', valor: pendientesRevision, detalle: 'Revisión docente', icono: ClipboardCheck, target: rol === 'docente' ? 'pendientes' : rol === 'alumno' ? 'mis-historias' : 'historias' },
        { etiqueta: 'Finalizadas', valor: finalizadas, detalle: historias.length ? `${Math.round((finalizadas / historias.length) * 100)} % del total` : 'Sin registros', icono: ShieldCheck, target: rol === 'alumno' ? 'mis-historias' : 'historias' },
    ];
    return <div className="hc-dashboard space-y-5">
        <section className="hc-dashboard-welcome">
            <div><p className="hc-kicker">Clínica odontológica universitaria</p><h1 className="hc-page-title">{saludoActual()}, {nombreCorto(usuario?.nombre)}</h1><p className="hc-page-subtitle">Resumen de actividad clínica. {perfil.contexto}</p></div>
        </section>

        <section className="hc-dashboard-kpis grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principales">
            {indicadores.map(({ etiqueta, valor, detalle, icono: Icono, target }) => <button key={etiqueta} type="button" className="hc-kpi-card" onClick={() => go(onNavigate, target)}><span className="hc-kpi-card__icon"><Icono size={22} /></span><span className="hc-kpi-card__copy"><small>{etiqueta}</small><strong>{valor}</strong><em>{detalle}</em></span><span className="hc-kpi-card__link">Ver detalle →</span></button>)}
        </section>

        <section className="hc-panel-card">
            <div className="hc-panel-card__header"><div><h2>Historias recientes</h2><p>Últimas historias clínicas modificadas.</p></div><button type="button" onClick={() => go(onNavigate, rol === 'alumno' ? 'mis-historias' : 'historias')}>Ver todas →</button></div>
            {historias.length ? <div className="hc-table-card hc-table-card--flush"><table className="hc-table"><thead><tr><th>HC</th><th>Paciente</th><th>Operador</th><th>Estado</th><th>Actualización</th><th>Progreso</th><th>Acción</th></tr></thead><tbody>{historias.slice(0, 5).map((item) => <tr key={item.id}><td data-label="HC"><strong>{item.codigo}</strong></td><td data-label="Paciente">{item.paciente}</td><td data-label="Operador">{item.operador || '—'}</td><td data-label="Estado">{item.estado}</td><td data-label="Actualización">{item.fecha}</td><td data-label="Progreso">{item.progreso ?? 0}%</td><td data-label="Acción"><button type="button" className="hc-mini-button" onClick={() => go(onNavigate, { view: 'historia', historiaId: item.id, section: 'datos-paciente' })}>Abrir</button></td></tr>)}</tbody></table></div> : <p className="hc-panel-card__empty">No hay historias clínicas recientes.</p>}
        </section>
    </div>;
}
