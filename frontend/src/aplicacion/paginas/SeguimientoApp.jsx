import { CalendarClock, CheckCircle2, Clock3, Search } from 'lucide-react';
import { mockHistorias } from '../configuracion/datosMock.mjs';
import { ProgressBar, StatusBadge } from '../componentes/clinica/ControlesClinicos';

const CONTROLES = [
    { id: 1, fecha: 'Hoy · 10:00', paciente: 'Andrea Salazar Huamán', tipo: 'Control postoperatorio', responsable: 'María Fernández', estado: 'Programado' },
    { id: 2, fecha: 'Hoy · 11:30', paciente: 'Luis Paredes Rojas', tipo: 'Evaluación periodontal', responsable: 'Diego Ramos', estado: 'Pendiente' },
    { id: 3, fecha: 'Mañana · 09:00', paciente: 'Camila Torres Vega', tipo: 'Revisión de diagnóstico', responsable: 'María Fernández', estado: 'Programado' },
];

export default function SeguimientoApp({ tipo = 'seguimiento', rol = 'alumno', onNavigate }) {
    const esPendientes = tipo === 'pendientes';
    const pendientes = mockHistorias.filter((historia) => historia.estado !== 'Validada');
    const go = (target) => typeof onNavigate === 'function' ? onNavigate(target) : window.onNavigate?.(target);

    return <div className="hc-page space-y-5">
        <header><p className="hc-kicker">{esPendientes ? 'Supervisión docente' : 'Continuidad clínica'}</p><h1 className="hc-page-title">{esPendientes ? 'Pendientes de revisión' : rol === 'alumno' ? 'Mis seguimientos' : 'Seguimiento'}</h1><p className="hc-page-subtitle">{esPendientes ? 'Historias y secciones que requieren evaluación o validación docente.' : 'Agenda de controles y tareas posteriores a la atención clínica.'}</p></header>
        {esPendientes ? <>
            <section className="hc-compact-stats" aria-label="Resumen de pendientes"><article><span><Clock3 size={17} /></span><strong>{pendientes.length}</strong><small>Historias pendientes</small></article><article><span><CheckCircle2 size={17} /></span><strong>{mockHistorias.filter((item) => item.estado === 'Validada').length}</strong><small>Validadas</small></article><article><span><CalendarClock size={17} /></span><strong>2</strong><small>Consentimientos</small></article></section>
            <div className="hc-table-card"><table className="hc-table"><thead><tr><th>Historia</th><th>Paciente</th><th>Operador</th><th>Estado</th><th>Progreso</th><th>Acción</th></tr></thead><tbody>{pendientes.map((historia) => <tr key={historia.id}><td data-label="Historia"><strong>{historia.codigo}</strong></td><td data-label="Paciente">{historia.paciente}</td><td data-label="Operador">{historia.operador}</td><td data-label="Estado"><StatusBadge status={historia.estado} /></td><td data-label="Progreso"><ProgressBar value={historia.progreso} /></td><td data-label="Acción"><button type="button" className="hc-mini-button" onClick={() => go({ view: 'historia', historiaId: historia.id, section: 'diagnostico' })}>Revisar</button></td></tr>)}</tbody></table></div>
        </> : <>
            <div className="hc-filterbar"><label className="hc-search"><Search size={17} /><span className="sr-only">Buscar seguimiento</span><input placeholder="Buscar por paciente o tipo de control..." /></label><span>{CONTROLES.length} controles próximos</span></div>
            <div className="hc-table-card"><table className="hc-table"><thead><tr><th>Fecha</th><th>Paciente</th><th>Tipo de control</th><th>Responsable</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{CONTROLES.map((control) => <tr key={control.id}><td data-label="Fecha"><strong>{control.fecha}</strong></td><td data-label="Paciente">{control.paciente}</td><td data-label="Tipo de control">{control.tipo}</td><td data-label="Responsable">{control.responsable}</td><td data-label="Estado"><StatusBadge status={control.estado} /></td><td data-label="Acción"><button type="button" className="hc-mini-button">Ver detalle</button></td></tr>)}</tbody></table></div>
        </>}
    </div>;
}
