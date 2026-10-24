import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Galeria, Tabla } from '../primitivas.jsx';
import { intraoralTissues } from '../../../../formularios/examen-intraoral/examen-intraoral.config.mjs';

export default function ExamenIntraoralImpresion({ values = {}, datos }) {
  const filas = intraoralTissues.map((tejido, indice) => [
    tejido,
    values[`tissue${indice}Status`] || '',
    values[`tissue${indice}Detail`] || '',
  ]);
  return <DocumentoSeccion titulo="Examen estomatológico intraoral" datos={datos}>
    <Bloque titulo="Tejidos blandos intraorales">
      <Tabla
        columnas={['Tejido', 'Anatomía y color', 'Descripción de la alteración']}
        filas={filas}
        vacio="Sin tejidos evaluados."
      />
    </Bloque>

    <Bloque titulo="Fotografías intraorales">
      <Galeria etiqueta="Vistas intraorales" adjuntos={values.fotosIntraorales} />
    </Bloque>
  </DocumentoSeccion>;
}
