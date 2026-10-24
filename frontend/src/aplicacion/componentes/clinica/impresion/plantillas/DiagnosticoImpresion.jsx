import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Campo, Tabla, Texto } from '../primitivas.jsx';

export default function DiagnosticoImpresion({ values = {}, datos }) {
  const diagnosticos = Array.isArray(values.diagnosticos) ? values.diagnosticos : [];
  return <DocumentoSeccion titulo="Diagnóstico y pronóstico" datos={datos}>
    <Bloque titulo="Síntesis diagnóstica estructurada">
      <Tabla
        columnas={['N.º', 'Código', 'Tipo', 'Pieza o región', 'Severidad', 'Evidencia clínica', 'Observaciones']}
        filas={diagnosticos.map((item, indice) => [
          String(indice + 1),
          item.codigo,
          item.tipo,
          item.piezaRegion,
          item.severidad,
          item.evidencia,
          item.observaciones,
        ])}
        vacio="Sin diagnósticos estructurados registrados."
      />
    </Bloque>

    <Bloque titulo="Diagnóstico institucional">
      <Texto etiqueta="DX. clínico radiográfico" valor={values.dxClinicoRadiografico} lineas={4} />
      <Texto etiqueta="DX presuntivo" valor={values.dxPresuntivo} lineas={4} />
      <Texto etiqueta="DX definitivo" valor={values.dxDefinitivo} lineas={4} />
    </Bloque>

    <Bloque titulo="Pronóstico">
      <Campo etiqueta="Pronóstico" valor={values.pronosticoEstructurado} />
      <Texto etiqueta="Justificación del pronóstico" valor={values.pronosticoJustificacion} lineas={4} />
      {values.pronostico ? <Texto etiqueta="Pronóstico ampliado" valor={values.pronostico} lineas={4} /> : null}
    </Bloque>
  </DocumentoSeccion>;
}
