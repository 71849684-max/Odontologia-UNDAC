import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Campo, Tabla, Texto } from '../primitivas.jsx';
import { formatearFecha } from '../../../../utilidades/fechas.mjs';

export default function SeguimientoImpresion({ values = {}, datos, history = {} }) {
  const procedimientos = Array.isArray(values.procedimientos) ? values.procedimientos : [];
  return <DocumentoSeccion titulo="Seguimiento quirúrgico" datos={datos}>
    <Bloque titulo="Seguimiento clínico">
      <div className="doc-grid doc-grid--2">
        <Campo etiqueta="Apellidos y nombres del paciente" valor={datos.paciente.nombreCompleto} amplio />
        <Campo etiqueta="Asistente" valor={history.operador} />
        <Campo etiqueta="Fecha de referencia" valor={formatearFecha(values.fecha)} />
      </div>
      <Texto etiqueta="Evolución o seguimiento" valor={values.evolucion} lineas={6} />
    </Bloque>

    <Bloque titulo="Ficha de seguimiento de los procedimientos">
      <Tabla
        columnas={['Fecha', 'Procedimiento', 'Evolución', 'Firma del asistente', 'Firma del profesional encargado']}
        filas={procedimientos.map((fila) => [
          formatearFecha(fila.fecha),
          fila.procedimiento,
          fila.evolucion,
          fila.firmaOperador,
          fila.firmaSupervisor,
        ])}
        vacio="Sin controles registrados."
      />
    </Bloque>
  </DocumentoSeccion>;
}
