import { BookOpenCheck, Download, FileText } from 'lucide-react';

export default function BibliotecaRecursos({ recursos = [] }) {
    return (
        <section className="biblioteca-recursos" aria-labelledby="titulo-biblioteca">
            <div className="tarjeta-modulo__titulo"><p className="rotulo-seccion">Material académico</p><h2 id="titulo-biblioteca">Recursos destacados</h2></div>
            <div className="biblioteca-recursos__cuadricula">
                {recursos.map((recurso, indice) => (
                    <article className="recurso-clinico" key={recurso.id}>
                        <span className={`recurso-clinico__icono recurso-clinico__icono--${indice % 2 ? 'academico' : 'clinico'}`} aria-hidden="true">{indice % 2 ? <BookOpenCheck size={22} /> : <FileText size={22} />}</span>
                        <span className="recurso-clinico__categoria">{recurso.categoria}</span>
                        <h3>{recurso.titulo}</h3>
                        <p>{recurso.descripcion ?? 'Material de consulta para la práctica clínica universitaria.'}</p>
                        <div><small>{recurso.formato}</small><button type="button" aria-label={`Abrir ${recurso.titulo}`}><Download size={16} /></button></div>
                    </article>
                ))}
            </div>
        </section>
    );
}
