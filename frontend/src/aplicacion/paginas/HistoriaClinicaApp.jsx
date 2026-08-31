import React, { useState, useEffect } from 'react';
import { MOCK_HISTORIAS } from '../configuracion/mockHistorias';
import { SECCIONES_HC } from '../configuracion/seccionesHistoriaClinica';

export default function HistoriaClinicaApp({ historiaId }) {
    const [historia, setHistoria] = useState(() => MOCK_HISTORIAS[0]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (historiaId) {
            const h = MOCK_HISTORIAS.find(x => x.id === historiaId);
            if (h) setHistoria(h);
        }
    }, [historiaId]);

    function irA(index) {
        if (index < 0 || index >= SECCIONES_HC.length) return;
        setActiveIndex(index);
    }

    const seccion = SECCIONES_HC[activeIndex];

    return (
        <div className="pagina-hc">
            <header className="hc-header-resumen">
                <div>
                    <h2>Historia Clínica</h2>
                    <p>{historia.codigo} · {historia.paciente}</p>
                </div>
                <div className="hc-meta">
                    <p><strong>Paciente:</strong> {historia.paciente}</p>
                    <p><strong>Operador:</strong> {historia.operador}</p>
                    <p><strong>Docente:</strong> {historia.docente}</p>
                    <p><strong>Estado:</strong> {historia.estado}</p>
                    <p><strong>Progreso:</strong> {historia.progreso}%</p>
                </div>
            </header>

            <div className="hc-contenedor">
                <aside className="hc-secciones">
                    <ul>
                        {SECCIONES_HC.map((s, idx) => (
                            <li key={s.id} className={idx < activeIndex ? 'completo' : idx === activeIndex ? 'en-progreso' : 'pendiente'}>
                                <button type="button" onClick={() => irA(idx)} aria-current={idx === activeIndex ? 'true' : undefined}>{s.titulo}</button>
                                <small>{idx === activeIndex ? 'En proceso' : idx < activeIndex ? 'Completada' : 'Pendiente'}</small>
                            </li>
                        ))}
                    </ul>
                </aside>

                <section className="hc-contenido-principal">
                    <nav className="hc-breadcrumb">
                        <span>Historias Clínicas</span> <span> / </span>
                        <strong>{historia.codigo}</strong> <span> / </span>
                        <small>{seccion.titulo}</small>
                    </nav>

                    <article className="seccion-placeholder">
                        <h3>{seccion.titulo}</h3>
                        <p>Esta sección será completada posteriormente. Estado: {activeIndex === activeIndex ? 'En proceso' : 'Pendiente'}</p>
                    </article>

                    <div className="hc-navegacion-secciones">
                        <button type="button" onClick={() => irA(activeIndex - 1)} disabled={activeIndex === 0}>Anterior</button>
                        <button type="button" onClick={() => irA(activeIndex + 1)} disabled={activeIndex === SECCIONES_HC.length - 1}>Siguiente</button>
                    </div>
                </section>
            </div>
        </div>
    );
}
