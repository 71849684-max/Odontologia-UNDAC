import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarDays, ClipboardCheck, ClipboardPlus, FileText, Search, ShieldCheck, Users } from 'lucide-react';
import { listarHistorias, listarPacientesLocales } from '../servicios/registroHistoriaClinica.js';
import { listarHistoriasRemotas, listarPacientes } from '../servicios/servicioClinico.js';
import { obtenerResumenAdmin } from '../servicios/servicioAdministracion.js';

const PERFIL = {
    administrador: {
        etiqueta: 'Administrador',
        contexto: 'Vista general de operación, accesos y trazabilidad del sistema.',
        acciones: [
            { etiqueta: 'Gestionar usuarios', target: 'usuarios', icono: Users },
            { etiqueta: 'Consultar auditoría', target: 'auditoria', icono: ShieldCheck },
            { etiqueta: 'Ver historias', target: 'historias', icono: FileText },
        ],
    },
    docente: {
        etiqueta: 'Docente',
        contexto: 'Supervisión académica, validaciones y continuidad de atención.',
        acciones: [
            { etiqueta: 'Ver pendientes', target: 'pendientes', icono: ClipboardCheck },
            { etiqueta: 'Buscar historia', target: 'historias', icono: Search },
            { etiqueta: 'Revisar seguimientos', target: 'seguimiento', icono: CalendarDays },
        ],
    },
    alumno: {
        etiqueta: 'Alumno operador',
        contexto: 'Tus historias, tareas clínicas y próximos controles.',
        acciones: [
            { etiqueta: 'Nueva historia clínica', target: 'nueva-historia', icono: ClipboardPlus },
            { etiqueta: 'Buscar paciente', target: 'mis-pacientes', icono: Search },
            { etiqueta: 'Mis seguimientos', target: 'mis-seguimientos', icono: CalendarDays },
        ],
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

function pendientesDe(rol, historias, resumen) {
    if (rol === 'administrador') {
        if (!resumen) return [];
        const items = [];
        const inactivos = (resumen.usuarios ?? 0) - (resumen.usuarios_activos ?? 0);
        if (resumen.accesos_fallidos_recientes > 0) items.push({ texto: `${resumen.accesos_fallidos_recientes} accesos fallidos en los últimos 7 días`, target: 'auditoria' });
        if (inactivos > 0) items.push({ texto: `${inactivos} cuentas inactivas por revisar`, target: 'usuarios' });
        return items;
    }
    const estados = rol === 'docente' ? ['Pendiente de revisión'] : ['Observada', 'Borrador'];
    return historias
        .filter((item) => estados.includes(item.estado))
        .slice(0, 5)
        .map((item) => ({
            texto: `${item.codigo} · ${item.paciente} — ${item.estado}`,
            target: { view: 'historia', historiaId: item.id, section: item.estado === 'Pendiente de revisión' ? 'diagnostico' : 'datos-paciente' },
        }));
}

export default function DashboardApp({ rol = 'alumno', usuario, onNavigate }) {
    const perfil = PERFIL[rol] ?? PERFIL.alumno;
    const [historias, setHistorias] = useState(listarHistorias);
    const [pacientes, setPacientes] = useState(listarPacientesLocales);
    const [resumen, setResumen] = useState(null);

    useEffect(() => {
        let vigente = true;
        Promise.all([listarHistoriasRemotas(), listarPacientes()])
            .then(([listaHistorias, listaPacientes]) => {
                if (!vigente) return;
                setHistorias(listaHistorias);
                setPacientes(listaPacientes);
            })
            .catch(() => {});
        if (rol === 'administrador') {
            Promise.resolve()
                .then(() => obtenerResumenAdmin())
                .then((datos) => { if (vigente) setResumen(datos ?? null); })
                .catch(() => {});
        }
        return () => { vigente = false; };
    }, [rol]);

    const enProceso = historias.filter((item) => ['Borrador', 'En proceso'].includes(item.estado)).length;
    const pendientesRevision = historias.filter((item) => item.estado === 'Pendiente de revisión').length;
    const finalizadas = historias.filter((item) => item.estado === 'Validada').length;
    const pendientes = pendientesDe(rol, historias, resumen);
    const indicadores = [
        { etiqueta: 'Pacientes registrados', valor: pacientes.length, detalle: pacientes.length ? `${pacientes.filter((item) => (item.historias ?? 0) > 0).length} con historia` : 'Sin registros', icono: Users, target: rol === 'alumno' ? 'mis-pacientes' : 'pacientes' },
        { etiqueta: 'Historias clínicas', valor: historias.length, detalle: `${enProceso} activas`, icono: FileText, target: rol === 'alumno' ? 'mis-historias' : 'historias' },
        { etiqueta: 'Pendientes de validación', valor: pendientesRevision, detalle: 'Revisión docente', icono: ClipboardCheck, target: rol === 'docente' ? 'pendientes' : rol === 'alumno' ? 'mis-historias' : 'historias' },
        { etiqueta: 'Finalizadas', valor: finalizadas, detalle: historias.length ? `${Math.round((finalizadas / historias.length) * 100)} % del total` : 'Sin registros', icono: ShieldCheck, target: rol === 'alumno' ? 'mis-historias' : 'historias' },
    ];
    const actividad = historias.slice(0, 5).map((item) => ({
        id: item.id,
        titulo: `${item.codigo} · ${item.paciente}`,
        detalle: `${item.estado}${item.operador ? ` · ${item.operador}` : ''}${item.fecha ? ` · ${item.fecha}` : ''}`,
        tono: item.estado === 'Validada' ? 'success' : item.estado === 'Observada' ? 'warning' : 'info',
    }));
    const fecha = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

    return <div className="hc-dashboard space-y-5">
        <section className="hc-dashboard-welcome">
            <div><p className="hc-kicker">Clínica odontológica universitaria</p><h1 className="hc-page-title">{saludoActual()}, {nombreCorto(usuario?.nombre)}</h1><p className="hc-page-subtitle">Resumen de actividad clínica. {perfil.contexto}</p></div>
            <div className="hc-dashboard-context"><strong>{perfil.etiqueta}</strong><span>{fecha}</span></div>
        </section>

        <section className="hc-dashboard-kpis grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principales">
            {indicadores.map(({ etiqueta, valor, detalle, icono: Icono, target }) => <button key={etiqueta} type="button" className="hc-kpi-card" onClick={() => go(onNavigate, target)}><span className="hc-kpi-card__icon"><Icono size={22} /></span><span className="hc-kpi-card__copy"><small>{etiqueta}</small><strong>{valor}</strong><em>{detalle}</em></span><span className="hc-kpi-card__link">Ver detalle →</span></button>)}
        </section>

        <section className="hc-dashboard-grid">
            <article className="hc-panel-card">
                <div className="hc-panel-card__header"><div><h2>Actividad reciente</h2><p>Últimos movimientos registrados en la clínica.</p></div></div>
                {actividad.length ? <div className="hc-activity-list">{actividad.map(({ id, titulo, detalle, tono }) => <button type="button" className="hc-activity-row" key={id} onClick={() => go(onNavigate, { view: 'historia', historiaId: id, section: 'datos-paciente' })}><span className={`hc-activity-row__icon is-${tono}`}><FileText size={16} /></span><span><strong>{titulo}</strong><small>{detalle}</small></span><span aria-hidden="true">›</span></button>)}</div> : <p className="hc-panel-card__empty">No hay actividad clínica registrada.</p>}
            </article>
            <article className="hc-panel-card">
                <div className="hc-panel-card__header"><div><h2>Acciones rápidas</h2><p>Accesos disponibles para el perfil {perfil.etiqueta.toLowerCase()}.</p></div></div>
                <div className="hc-action-grid">{perfil.acciones.map(({ etiqueta, target, icono: Icono }) => <button type="button" key={etiqueta} onClick={() => go(onNavigate, target)}><span><Icono size={18} /></span><strong>{etiqueta}</strong><small>Abrir módulo</small></button>)}</div>
            </article>
            <article className="hc-panel-card">
                <div className="hc-panel-card__header"><div><h2>Pendientes</h2><p>Elementos que requieren atención.</p></div></div>
                {pendientes.length ? <ul className="hc-pending-list">{pendientes.map((item, index) => <li key={item.texto}><span>{index + 1}</span><p><button type="button" className="hc-link-button" onClick={() => go(onNavigate, item.target)}>{rol === 'administrador' ? <AlertTriangle size={14} aria-hidden="true" /> : null} {item.texto}</button></p></li>)}</ul> : <p className="hc-panel-card__empty">No hay pendientes registrados.</p>}
            </article>
        </section>

        <section className="hc-panel-card">
            <div className="hc-panel-card__header"><div><h2>Historias recientes</h2><p>Últimas historias clínicas modificadas.</p></div><button type="button" onClick={() => go(onNavigate, rol === 'alumno' ? 'mis-historias' : 'historias')}>Ver todas →</button></div>
            {historias.length ? <div className="hc-table-card hc-table-card--flush"><table className="hc-table"><thead><tr><th>HC</th><th>Paciente</th><th>Operador</th><th>Estado</th><th>Actualización</th><th>Progreso</th><th>Acción</th></tr></thead><tbody>{historias.slice(0, 5).map((item) => <tr key={item.id}><td data-label="HC"><strong>{item.codigo}</strong></td><td data-label="Paciente">{item.paciente}</td><td data-label="Operador">{item.operador || '—'}</td><td data-label="Estado">{item.estado}</td><td data-label="Actualización">{item.fecha}</td><td data-label="Progreso">{item.progreso ?? 0}%</td><td data-label="Acción"><button type="button" className="hc-mini-button" onClick={() => go(onNavigate, { view: 'historia', historiaId: item.id, section: 'datos-paciente' })}>Abrir</button></td></tr>)}</tbody></table></div> : <p className="hc-panel-card__empty">No hay historias clínicas recientes.</p>}
        </section>
    </div>;
}
