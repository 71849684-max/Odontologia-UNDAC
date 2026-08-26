function contenidoCelda(valor, clave) {
    if (clave === 'estado' || clave === 'prioridad') {
        const tono = /pendiente|revisar|media/i.test(valor) ? 'academico' : /alerta|vencido|alta/i.test(valor) ? 'alerta' : 'clinico';
        return <span className={`etiqueta-estado etiqueta-estado--${tono}`}>{valor}</span>;
    }
    if (clave === 'progreso') {
        return <span className="progreso-tabla"><span style={{ width: valor }} /><small>{valor}</small></span>;
    }
    return valor;
}

export default function TablaRegistros({ columnas = [], filas = [] }) {
    return (
        <div className="contenedor-tabla">
            <table className="tabla-registros">
                <thead><tr>{columnas.map((columna) => <th scope="col" key={columna.clave}>{columna.etiqueta}</th>)}</tr></thead>
                <tbody>
                    {filas.map((fila) => (
                        <tr key={fila.id}>
                            {columnas.map((columna) => (
                                <td data-label={columna.etiqueta} key={columna.clave}>{contenidoCelda(fila[columna.clave], columna.clave)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
