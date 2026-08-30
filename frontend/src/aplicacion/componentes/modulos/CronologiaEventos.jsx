export default function CronologiaEventos({ eventos = [] }) {
    return (
        <section className="tarjeta-modulo cronologia" aria-labelledby="titulo-cronologia">
            <div className="tarjeta-modulo__titulo"><p className="rotulo-seccion">Trazabilidad</p><h2 id="titulo-cronologia">Actividad registrada</h2></div>
            <ol>
                {eventos.map((evento) => (
                    <li key={evento.id}>
                        <span className={`cronologia__punto cronologia__punto--${evento.tono ?? 'neutro'}`} aria-hidden="true" />
                        <div><strong>{evento.titulo}</strong><p>{evento.detalle}</p><small>{evento.usuario ? `${evento.usuario} · ` : ''}{evento.fecha}</small></div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
