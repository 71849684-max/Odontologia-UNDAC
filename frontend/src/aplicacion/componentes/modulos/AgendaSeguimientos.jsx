import { CalendarDays, Clock3 } from 'lucide-react';

export default function AgendaSeguimientos({ citas = [], fecha = new Date() }) {
    const dia = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric' }).format(fecha);
    const mes = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(fecha);
    return (
        <section className="tarjeta-modulo agenda-seguimientos" aria-labelledby="titulo-agenda">
            <div className="tarjeta-modulo__titulo"><p className="rotulo-seccion">Agenda clínica</p><h2 id="titulo-agenda">Próximos seguimientos</h2></div>
            <div className="agenda-seguimientos__fecha"><CalendarDays size={19} /><span><strong>{dia.charAt(0).toUpperCase() + dia.slice(1)}</strong><small>{mes.charAt(0).toUpperCase() + mes.slice(1)}</small></span></div>
            <ol>
                {citas.map((cita) => (
                    <li key={cita.id}>
                        <span className="agenda-seguimientos__hora"><Clock3 size={14} />{cita.hora}</span>
                        <div><strong>{cita.paciente}</strong><p>{cita.detalle}</p>{cita.responsable && <small>{cita.responsable}</small>}</div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
