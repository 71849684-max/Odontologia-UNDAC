import React from 'react';
import {
    Activity,
    CalendarDays,
    ClipboardPlus,
    FileText,
    FlaskConical,
    HeartPulse,
    Search,
    Stethoscope,
    Syringe,
    Users,
} from 'lucide-react';
import '../../css/aplicacion/historia-clinica.css';
import { dashboardServices } from '../configuracion/historiaClinica.config.mjs';
import { mockHistorias } from '../configuracion/datosMock.mjs';
import { ProgressBar, StatusBadge } from '../componentes/clinica/ControlesClinicos.jsx';

const iconMap = {
    pacientes: Users,
    historias: FileText,
    'nueva-historia': ClipboardPlus,
    odontograma: Stethoscope,
    examenes: FlaskConical,
    diagnostico: HeartPulse,
    tratamiento: Activity,
    cirugia: Syringe,
    seguimiento: CalendarDays,
};

const activity = [
    { icon: FileText, title: 'Historia clínica actualizada', meta: 'Andrea Salazar Huamán · hace 15 min', tone: 'teal' },
    { icon: ClipboardPlus, title: 'Nueva historia creada', meta: 'Luis Paredes Rojas · hace 32 min', tone: 'gold' },
    { icon: Stethoscope, title: 'Observación docente recibida', meta: 'HC-2026-003 · hace 1 h', tone: 'blue' },
    { icon: HeartPulse, title: 'Historia validada', meta: 'HC-2026-004 · hace 2 h', tone: 'green' },
];

function go(onNavigate, target) {
    if (onNavigate) onNavigate(target);
    else window.onNavigate?.(target);
}

export default function DashboardApp({ rol, onNavigate }) {
    return (
        <div className="hc-dashboard space-y-6">
            <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="hc-kicker">Clínica odontológica universitaria</p>
                    <h1 className="hc-page-title">Inicio</h1>
                    <p className="hc-page-subtitle">Resumen de la atención clínica, avance académico y accesos principales del sistema.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" className="hc-button hc-button--ghost" onClick={() => go(onNavigate, 'pacientes')}><Search size={17} /> Buscar paciente</button>
                    <button type="button" className="hc-button hc-button--primary" onClick={() => go(onNavigate, 'nueva-historia')}><ClipboardPlus size={17} /> Nueva historia</button>
                </div>
            </section>

            <section className="hc-dashboard-kpis grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principales">
                {dashboardServices.slice(0, 4).map((service) => {
                    const Icon = iconMap[service.id] || FileText;
                    return (
                        <button key={service.id} type="button" className="hc-kpi-card" onClick={() => go(onNavigate, service.target)}>
                            <span className="hc-kpi-card__icon"><Icon size={23} /></span>
                            <span className="hc-kpi-card__copy"><small>{service.label}</small><strong>{service.metric}</strong><em>{service.metricLabel}</em></span>
                            <span className="hc-kpi-card__link">Abrir módulo →</span>
                        </button>
                    );
                })}
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.05fr_1.2fr_.8fr]">
                <article className="hc-panel-card">
                    <div className="hc-panel-card__header"><div><h2>Actividad reciente</h2><p>Últimos movimientos de la maqueta clínica.</p></div><button type="button" onClick={() => go(onNavigate, 'historias')}>Ver todo</button></div>
                    <div className="hc-activity-list">
                        {activity.map(({ icon: Icon, title, meta, tone }) => (
                            <div className="hc-activity-row" key={title}><span className={`hc-activity-row__icon is-${tone}`}><Icon size={16} /></span><span><strong>{title}</strong><small>{meta}</small></span><span aria-hidden="true">›</span></div>
                        ))}
                    </div>
                </article>

                <article className="hc-panel-card">
                    <div className="hc-panel-card__header"><div><h2>Mis historias por estado</h2><p>Distribución visual para el rol {rol || 'alumno'}.</p></div></div>
                    <div className="hc-status-summary">
                        <div className="hc-donut" role="img" aria-label="Distribución de historias: 43 por ciento en proceso, 25 por ciento pendientes, 11 por ciento observadas y 21 por ciento validadas"><span><strong>18</strong><small>Total</small></span></div>
                        <div className="hc-status-legend">
                            <div><span className="is-progress" />En proceso <strong>8</strong></div>
                            <div><span className="is-review" />Pendiente de revisión <strong>4</strong></div>
                            <div><span className="is-observed" />Observada <strong>2</strong></div>
                            <div><span className="is-valid" />Validada <strong>4</strong></div>
                        </div>
                    </div>
                </article>

                <article className="hc-panel-card">
                    <div className="hc-panel-card__header"><div><h2>Próximos controles</h2><p>Agenda visual de demostración.</p></div></div>
                    <div className="hc-appointments">
                        <div><time>10:00</time><span><strong>Andrea Salazar</strong><small>Control postoperatorio</small></span></div>
                        <div><time>11:30</time><span><strong>Luis Paredes</strong><small>Evaluación clínica</small></span></div>
                        <div><time>14:00</time><span><strong>Camila Torres</strong><small>Revisión de avance</small></span></div>
                    </div>
                </article>
            </section>

            <section className="hc-panel-card">
                <div className="hc-panel-card__header"><div><h2>Accesos clínicos rápidos</h2><p>Servicios vinculados directamente con las secciones de la Historia Clínica.</p></div></div>
                <div className="hc-service-strip grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {dashboardServices.slice(4).map((service) => {
                        const Icon = iconMap[service.id] || FileText;
                        return <button key={service.id} type="button" onClick={() => go(onNavigate, service.target)}><span><Icon size={20} /></span><strong>{service.label}</strong><small>{service.description}</small></button>;
                    })}
                </div>
            </section>

            <section className="hc-panel-card">
                <div className="hc-panel-card__header"><div><h2>Historias en curso</h2><p>Continuar registros clínicos con mayor prioridad.</p></div><button type="button" onClick={() => go(onNavigate, 'historias')}>Ver historias</button></div>
                <div className="hc-history-preview grid gap-3 lg:grid-cols-3">
                    {mockHistorias.slice(0, 3).map((item) => (
                        <button key={item.id} type="button" onClick={() => go(onNavigate, { view: 'historia', historiaId: item.id, section: 'datos-paciente' })}>
                            <span className="hc-avatar">{item.paciente.split(' ').slice(0, 2).map((part) => part[0]).join('')}</span>
                            <span className="min-w-0"><strong>{item.paciente}</strong><small>{item.codigo}</small><StatusBadge status={item.estado} /><ProgressBar value={item.progreso} /></span>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}
