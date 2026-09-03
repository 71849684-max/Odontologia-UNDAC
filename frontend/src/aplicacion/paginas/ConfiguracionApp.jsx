import { useState } from 'react';
import { Building2, CalendarRange, Check, LockKeyhole, Save, Settings2, Stethoscope } from 'lucide-react';

const SECCIONES = [
    { id: 'institucion', titulo: 'Datos institucionales', descripcion: 'Nombre y unidad académica visibles en documentos.', icono: Building2 },
    { id: 'clinica', titulo: 'Parámetros clínicos', descripcion: 'Criterios visuales para estados y revisiones.', icono: Stethoscope },
    { id: 'periodo', titulo: 'Año académico y semestres', descripcion: 'Periodo activo usado en los formularios.', icono: CalendarRange },
    { id: 'seguridad', titulo: 'Seguridad', descripcion: 'Avisos de sesión y trazabilidad de cambios.', icono: LockKeyhole },
];

export default function ConfiguracionApp() {
    const [guardado, setGuardado] = useState(false);
    const [opciones, setOpciones] = useState({ validacion: true, auditoria: true, notificaciones: false });
    const alternar = (id) => setOpciones((actuales) => ({ ...actuales, [id]: !actuales[id] }));

    return <div className="hc-page space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="hc-kicker">Sistema</p><h1 className="hc-page-title">Configuración</h1><p className="hc-page-subtitle">Parámetros institucionales de demostración preparados para la futura integración con backend.</p></div><button type="button" className="hc-button hc-button--primary" onClick={() => setGuardado(true)}>{guardado ? <Check size={17} /> : <Save size={17} />}{guardado ? 'Cambios guardados' : 'Guardar configuración'}</button></header>
        <div className="hc-inline-callout"><span><Settings2 size={20} /></span><div><strong>Modo interfaz</strong><small>Los cambios se conservan solo durante esta sesión y no modifican datos del sistema.</small></div></div>
        <section className="hc-settings-grid">
            {SECCIONES.map(({ id, titulo, descripcion, icono: Icono }) => <article className="hc-panel-card hc-settings-card" key={id}><div className="hc-settings-card__title"><span><Icono size={19} /></span><div><h2>{titulo}</h2><p>{descripcion}</p></div></div>{id === 'institucion' && <div className="hc-settings-fields"><label>Nombre de la clínica<input defaultValue="Clínica Odontológica UNDAC" /></label><label>Facultad<input defaultValue="Facultad de Ciencias de la Salud" /></label></div>}{id === 'periodo' && <div className="hc-settings-fields"><label>Año académico<select defaultValue="2026"><option>2026</option><option>2027</option></select></label><label>Semestre activo<select defaultValue="2026-II"><option>2026-I</option><option>2026-II</option></select></label></div>}{id === 'clinica' && <div className="hc-toggle-list"><label><span><strong>Validación docente obligatoria</strong><small>Solicitar revisión antes de finalizar una historia.</small></span><input type="checkbox" checked={opciones.validacion} onChange={() => alternar('validacion')} /></label><label><span><strong>Notificaciones clínicas</strong><small>Mostrar avisos sobre revisiones y seguimientos.</small></span><input type="checkbox" checked={opciones.notificaciones} onChange={() => alternar('notificaciones')} /></label></div>}{id === 'seguridad' && <div className="hc-toggle-list"><label><span><strong>Auditar cambios clínicos</strong><small>Registrar edición, validación, firma y exportación.</small></span><input type="checkbox" checked={opciones.auditoria} onChange={() => alternar('auditoria')} /></label></div>}</article>)}
        </section>
    </div>;
}
