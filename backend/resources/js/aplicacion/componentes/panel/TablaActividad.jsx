import { ArrowRight } from 'lucide-react';

function tonoEstado(estado) {
    if (/revisar|validar|firma/i.test(estado)) return 'academico';
    if (/curso|registrada|validada/i.test(estado)) return 'clinico';
    return 'neutro';
}

export default function TablaActividad({ actividades = [] }) {
    return (
        <section className="tarjeta-panel tarjeta-actividad" aria-labelledby="titulo-actividad">
            <div className="tarjeta-panel__encabezado">
                <div>
                    <p className="rotulo-seccion">Seguimiento</p>
                    <h2 id="titulo-actividad">Actividad clínica reciente</h2>
                </div>
                <button type="button" className="boton-texto">
                    Ver toda la actividad <ArrowRight size={16} />
                </button>
            </div>

            <div className="tabla-actividad" role="table" aria-label="Actividad clínica reciente">
                <div className="tabla-actividad__encabezado" role="row">
                    <span role="columnheader">Paciente</span>
                    <span role="columnheader">Historia</span>
                    <span role="columnheader">Atención</span>
                    <span role="columnheader">Fecha</span>
                    <span role="columnheader">Estado</span>
                </div>
                {actividades.map((actividad) => (
                    <div className="tabla-actividad__fila" role="row" key={actividad.id}>
                        <span role="cell" data-label="Paciente">
                            <span className="avatar-paciente" aria-hidden="true">{actividad.paciente.charAt(0)}</span>
                            <strong>{actividad.paciente}</strong>
                        </span>
                        <span role="cell" data-label="Historia">{actividad.historia}</span>
                        <span role="cell" data-label="Atención">{actividad.atencion}</span>
                        <span role="cell" data-label="Fecha">{actividad.fecha}</span>
                        <span role="cell" data-label="Estado">
                            <span className={`etiqueta-estado etiqueta-estado--${tonoEstado(actividad.estado)}`}>
                                {actividad.estado}
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
