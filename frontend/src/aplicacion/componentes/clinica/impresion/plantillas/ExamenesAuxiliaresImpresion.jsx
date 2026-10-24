import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Campo, Galeria, ListaAdjuntos, Tabla, Texto } from '../primitivas.jsx';
import { labFields } from '../../../../formularios/examenes-auxiliares/examenes-auxiliares.config.mjs';

export default function ExamenesAuxiliaresImpresion({ values = {}, datos }) {
  return <DocumentoSeccion titulo="Exámenes auxiliares" datos={datos}>
    <Bloque titulo="Análisis de laboratorio clínico">
      <Tabla
        columnas={['N.º', 'Examen', 'Resultado']}
        filas={labFields.map(([clave, etiqueta], indice) => [String(indice + 1), etiqueta, values[clave] || ''])}
        vacio="Sin valores de laboratorio registrados."
      />
      <ListaAdjuntos etiqueta="Resultados de laboratorio adjuntos" adjuntos={values.resultadosLaboratorio} />
      <Texto etiqueta="Diagnóstico de análisis de laboratorio clínico" valor={values.diagnosticoLaboratorio} lineas={4} />
    </Bloque>

    <Bloque titulo="Exámenes radiográficos">
      <Texto etiqueta="Informe RX panorámico" valor={values.rxPanoramico} lineas={5} />
      <Texto etiqueta="Informe RX oclusales (ambos maxilar y mandíbula)" valor={values.rxOclusales} lineas={4} />
      <Texto etiqueta="Informe RX periapicales" valor={values.rxPeriapicales} lineas={4} />
      <Galeria etiqueta="Radiografías" adjuntos={values.radiografias} />
    </Bloque>

    <Bloque titulo="Estudios complementarios">
      <div className="doc-grid doc-grid--2">
        <Campo etiqueta="Análisis de laboratorio" valor={values.diagnosticoLaboratorio ? 'Registrado' : ''} />
        <Campo etiqueta="Exámenes radiográficos" valor={values.rxPanoramico || values.rxOclusales || values.rxPeriapicales ? 'Registrados' : ''} />
      </div>
    </Bloque>
  </DocumentoSeccion>;
}
