import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Tabla, Texto } from '../primitivas.jsx';

export default function PlanTratamientoImpresion({ values = {}, datos }) {
  const procedimientos = Array.isArray(values.procedimientosPlan) ? values.procedimientosPlan : [];
  return <DocumentoSeccion titulo="Plan de tratamiento integral" datos={datos}>
    <Bloque titulo="Plan de tratamiento integral (fases)">
      <Tabla
        columnas={['Fase', 'Pieza o región', 'Procedimiento', 'Prioridad', 'Estado', 'Observaciones']}
        filas={procedimientos.map((item) => [
          item.fase,
          item.pieza,
          item.procedimiento,
          item.prioridad,
          item.estado,
          item.observaciones,
        ])}
        vacio="Sin procedimientos planificados."
      />
    </Bloque>

    <Bloque titulo="Plan integral">
      <Texto etiqueta="Descripción del plan de tratamiento" valor={values.planIntegral} lineas={8} />
    </Bloque>
  </DocumentoSeccion>;
}
