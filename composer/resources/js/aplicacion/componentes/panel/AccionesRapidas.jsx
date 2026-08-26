import { ArrowUpRight, FilePlus2, Search, UserPlus } from 'lucide-react';

const ICONOS = [FilePlus2, UserPlus, Search];

export default function AccionesRapidas({ acciones = [] }) {
    return (
        <section className="tarjeta-panel acciones-rapidas" aria-labelledby="titulo-acciones-rapidas">
            <div className="tarjeta-panel__encabezado">
                <div>
                    <p className="rotulo-seccion">Accesos</p>
                    <h2 id="titulo-acciones-rapidas">Acciones rápidas</h2>
                </div>
            </div>
            <div className="acciones-rapidas__cuadricula">
                {acciones.map((accion, indice) => {
                    const Icono = ICONOS[indice % ICONOS.length];
                    return (
                        <button type="button" key={accion}>
                            <span className="acciones-rapidas__icono" aria-hidden="true"><Icono size={19} /></span>
                            <span>{accion}</span>
                            <ArrowUpRight size={16} aria-hidden="true" />
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
