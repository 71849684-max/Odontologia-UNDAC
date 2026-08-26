export default function PanelDistribucion({ titulo = 'Distribución', elementos = [] }) {
    return (
        <section className="tarjeta-modulo panel-distribucion" aria-labelledby="titulo-distribucion">
            <div className="tarjeta-modulo__titulo"><p className="rotulo-seccion">Panorama</p><h2 id="titulo-distribucion">{titulo}</h2></div>
            <div className="panel-distribucion__contenido">
                {elementos.map((elemento) => (
                    <div className="barra-distribucion" key={elemento.etiqueta}>
                        <div><span>{elemento.etiqueta}</span><strong>{elemento.valor}</strong></div>
                        <span className="barra-distribucion__pista"><span style={{ width: elemento.porcentaje }} /></span>
                    </div>
                ))}
            </div>
        </section>
    );
}
