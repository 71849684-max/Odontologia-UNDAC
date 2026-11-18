export default function EstadoCarga({ mensaje = 'Cargando información', detalle = 'Espere un momento mientras preparamos la vista.', compacto = false }) {
    return (
        <div className={`estado-carga${compacto ? ' estado-carga--compacto' : ''}`} role="status" aria-live="polite" aria-busy="true">
            <span className="estado-carga__indicador" aria-hidden="true"><span /></span>
            <div className="estado-carga__texto"><strong>{mensaje}</strong><p>{detalle}</p></div>
            {!compacto ? <div className="estado-carga__esqueleto" aria-hidden="true"><span /><span /><span /></div> : null}
        </div>
    );
}
