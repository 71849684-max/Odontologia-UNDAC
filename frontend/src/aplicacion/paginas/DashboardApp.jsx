import { CalendarDays, ClipboardCheck, ClipboardPlus, FileText, Search, ShieldCheck, Users } from 'lucide-react';
import { historiasClinicas, pacientesClinicos } from '../configuracion/datosClinicos.mjs';

const PERFIL = {
    administrador: {
        etiqueta: 'Administrador',
        contexto: 'Vista general de operación, accesos y trazabilidad del sistema.',
        acciones: [
            { etiqueta: 'Gestionar usuarios', target: 'usuarios', icono: Users },
            { etiqueta: 'Consultar auditoría', target: 'auditoria', icono: ShieldCheck },
            { etiqueta: 'Ver historias', target: 'historias', icono: FileText },
        ],
        pendientes: [],
    },
    docente: {
        etiqueta: 'Docente',
        contexto: 'Supervisión académica, validaciones y continuidad de atención.',
        acciones: [
            { etiqueta: 'Ver pendientes', target: 'pendientes', icono: ClipboardCheck },
            { etiqueta: 'Buscar historia', target: 'historias', icono: Search },
            { etiqueta: 'Revisar seguimientos', target: 'seguimiento', icono: CalendarDays },
        ],
        pendientes: [],
    },
    alumno: {
        etiqueta: 'Alumno operador',
        contexto: 'Tus historias, tareas clínicas y próximos controles.',
        acciones: [
            { etiqueta: 'Nueva historia clínica', target: 'nueva-historia', icono: ClipboardPlus },
            { etiqueta: 'Buscar paciente', target: 'mis-pacientes', icono: Search },
            { etiqueta: 'Mis seguimientos', target: 'mis-seguimientos', icono: CalendarDays },
        ],
        pendientes: [],
    },
};

const ACTIVIDAD = [];

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
    const enProceso = historiasClinicas.filter((item) => ['Borrador', 'En proceso'].includes(item.estado)).length;
    const pendientes = historiasClinicas.filter((item) => item.estado === 'Pendiente de revisión').length;
    const finalizadas = historiasClinicas.filter((item) => item.estado === 'Validada').length;
    const indicadores = [
        { etiqueta: 'Pacientes registrados', valor: pacientesClinicos.length, detalle: 'Sin registros', icono: Users, target: rol === 'alumno' ? 'mis-pacientes' : 'pacientes' },
        { etiqueta: 'Historias clínicas', valor: historiasClinicas.length, detalle: `${enProceso} activas`, icono: FileText, target: rol === 'alumno' ? 'mis-historias' : 'historias' },
        { etiqueta: 'Pendientes de validación', valor: pendientes, detalle: 'Revisión docente', icono: ClipboardCheck, target: rol === 'docente' ? 'pendientes' : rol === 'alumno' ? 'mis-historias' : 'historias' },
        { etiqueta: 'Finalizadas', valor: finalizadas, detalle: historiasClinicas.length ? `${Math.round((finalizadas / historiasClinicas.length) * 100)} % del total` : 'Sin registros', icono: ShieldCheck, target: rol === 'alumno' ? 'mis-historias' : 'historias' },
    ];
    const fecha = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

    return <div className="hc-dashboard space-y-5">
        <section className="hc-dashboard-welcome">
            <div><p className="hc-kicker">Sistema de Odontología</p><h1 className="hc-page-title">{saludoActual()}, {nombreCorto(usuario?.nombre)}</h1><p className="hc-page-subtitle">Resumen de actividad clínica. {perfil.contexto}</p></div>
            <div className="hc-dashboard-context"><strong>{perfil.etiqueta}</strong><span>{fecha}</span></div>
        </section>

        <section className="hc-dashboard-kpis grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principales">
            {indicadores.map(({ etiqueta, valor, detalle, icono: Icono, target }) => <button key={etiqueta} type="button" className="hc-kpi-card" onClick={() => go(onNavigate, target)}><span className="hc-kpi-card__icon"><Icono size={22} /></span><span className="hc-kpi-card__copy"><small>{etiqueta}</small><strong>{valor}</strong><em>{detalle}</em></span><span className="hc-kpi-card__link">Ver detalle →</span></button>)}
        </section>

        <section className="hc-dashboard-grid">
            <article className="hc-panel-card">
                <div className="hc-panel-card__header"><div><h2>Actividad reciente</h2><p>Últimos movimientos registrados en la clínica.</p></div></div>
                {ACTIVIDAD.length ? <div className="hc-activity-list">{ACTIVIDAD.map(({ icono: Icono, titulo, detalle, tono }) => <div className="hc-activity-row" key={titulo}><span className={`hc-activity-row__icon is-${tono}`}><Icono size={16} /></span><span><strong>{titulo}</strong><small>{detalle}</small></span><span aria-hidden="true">›</span></div>)}</div> : <p className="hc-panel-card__empty">No hay actividad clínica registrada.</p>}
            </article>
            <article className="hc-panel-card">
                <div className="hc-panel-card__header"><div><h2>Acciones rápidas</h2><p>Accesos disponibles para el perfil {perfil.etiqueta.toLowerCase()}.</p></div></div>
                <div className="hc-action-grid">{perfil.acciones.map(({ etiqueta, target, icono: Icono }) => <button type="button" key={etiqueta} onClick={() => go(onNavigate, target)}><span><Icono size={18} /></span><strong>{etiqueta}</strong><small>Abrir módulo</small></button>)}</div>
            </article>
            <article className="hc-panel-card">
                <div className="hc-panel-card__header"><div><h2>Pendientes</h2><p>Elementos que requieren atención.</p></div></div>
                {perfil.pendientes.length ? <ul className="hc-pending-list">{perfil.pendientes.map((item, index) => <li key={item}><span>{index + 1}</span><p>{item}</p></li>)}</ul> : <p className="hc-panel-card__empty">No hay pendientes registrados.</p>}
            </article>
        </section>

        <section className="hc-panel-card">
            <div className="hc-panel-card__header"><div><h2>Historias recientes</h2><p>Últimas historias clínicas modificadas.</p></div><button type="button" onClick={() => go(onNavigate, rol === 'alumno' ? 'mis-historias' : 'historias')}>Ver todas →</button></div>
            {historiasClinicas.length ? <div className="hc-table-card hc-table-card--flush"><table className="hc-table"><thead><tr><th>HC</th><th>Paciente</th><th>Operador</th><th>Estado</th><th>Actualización</th><th>Progreso</th><th>Acción</th></tr></thead><tbody>{historiasClinicas.slice(0, 5).map((item) => <tr key={item.id}><td data-label="HC"><strong>{item.codigo}</strong></td><td data-label="Paciente">{item.paciente}</td><td data-label="Operador">{item.operador}</td><td data-label="Estado">{item.estado}</td><td data-label="Actualización">{item.fecha}</td><td data-label="Progreso">{item.progreso}%</td><td data-label="Acción"><button type="button" className="hc-mini-button" onClick={() => go(onNavigate, { view: 'historia', historiaId: item.id, section: 'datos-paciente' })}>Abrir</button></td></tr>)}</tbody></table></div> : <p className="hc-panel-card__empty">No hay historias clínicas recientes.</p>}
        </section>
    </div>;
}
