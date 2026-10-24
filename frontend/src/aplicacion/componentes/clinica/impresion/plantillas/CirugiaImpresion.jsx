import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Texto } from '../primitivas.jsx';

export default function CirugiaImpresion({ values = {}, datos }) {
  return <DocumentoSeccion titulo="Plan de tratamiento quirúrgico" datos={datos}>
    <Bloque titulo="Preoperatorio">
      <Texto etiqueta="Preoperatorio" valor={values.preoperatorio} lineas={7} />
    </Bloque>
    <Bloque titulo="Intraoperatorio">
      <Texto etiqueta="Intraoperatorio" valor={values.intraoperatorio} lineas={8} />
    </Bloque>
    <Bloque titulo="Postoperatorio">
      <Texto etiqueta="Postoperatorio" valor={values.postoperatorio} lineas={7} />
    </Bloque>
  </DocumentoSeccion>;
}
