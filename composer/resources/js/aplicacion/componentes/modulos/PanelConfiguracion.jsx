export default function PanelConfiguracion({ grupos = [] }) {
    return (
        <div className="cuadricula-configuracion">
            {grupos.map((grupo) => (
                <section className="tarjeta-modulo grupo-configuracion" aria-labelledby={`grupo-${grupo.id}`} key={grupo.id}>
                    <div className="tarjeta-modulo__titulo"><p className="rotulo-seccion">Parámetros</p><h2 id={`grupo-${grupo.id}`}>{grupo.titulo}</h2>{grupo.descripcion && <p>{grupo.descripcion}</p>}</div>
                    <div className="grupo-configuracion__opciones">
                        {grupo.opciones.map((opcion) => (
                            opcion.tipo === 'texto' ? (
                                <label className="campo-configuracion" key={opcion.id}><span>{opcion.etiqueta}</span><input type="text" defaultValue={opcion.valor} /></label>
                            ) : (
                                <label className="interruptor-configuracion" key={opcion.id}><span><strong>{opcion.etiqueta}</strong>{opcion.detalle && <small>{opcion.detalle}</small>}</span><input type="checkbox" defaultChecked={opcion.activa} /></label>
                            )
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
