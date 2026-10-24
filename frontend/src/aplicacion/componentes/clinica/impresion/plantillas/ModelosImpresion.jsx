import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Galeria, Texto } from '../primitivas.jsx';

export default function ModelosImpresion({ values = {}, datos }) {
  return <DocumentoSeccion titulo="Estudio de modelos" datos={datos}>
    <Bloque titulo="Análisis de modelos de estudio">
      <Texto etiqueta="Informe del maxilar" valor={values.informeMaxilar} lineas={5} />
      <Texto etiqueta="Informe de la mandíbula" valor={values.informeMandibula} lineas={5} />
      <Texto etiqueta="Planificación en modelos" valor={values.planificacionModelos} lineas={5} />
    </Bloque>

    <Bloque titulo="Fotografías de modelos">
      <Galeria etiqueta="Vistas de modelos" adjuntos={values.fotosModelos} />
    </Bloque>
  </DocumentoSeccion>;
}
