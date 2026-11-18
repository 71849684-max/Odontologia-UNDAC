import React from 'react';
import { indicacionesHistoricas } from '../../../../formularios/plan-tratamiento/planTratamiento.config.mjs';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Tabla, Texto } from '../primitivas.jsx';

export default function PlanTratamientoImpresion({ values = {}, datos, formData = {} }) {
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
    {indicacionesHistoricas(formData.odontograma?.registro).length ? <Bloque titulo="Indicaciones históricas pendientes de revisión"><Tabla columnas={['Pieza', 'Evaluación de origen', 'Indicación']} filas={indicacionesHistoricas(formData.odontograma?.registro).map(item => [item.pieza, item.fecha, 'Extracción programada: verificar necesidad clínica'])} /></Bloque> : null}
  </DocumentoSeccion>;
}
