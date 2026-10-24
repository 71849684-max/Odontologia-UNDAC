import React from 'react';
import { texto } from './documentoClinico.mjs';

export default function PieDocumento({ datos }) {
  return <footer className="doc-pie">
    <span>Documento generado el {texto(datos?.generadoEn)}</span>
    <span>Asistente: {texto(datos?.operador?.nombre)}</span>
    <span>Profesional encargado: {texto(datos?.operador?.docente)}</span>
  </footer>;
}
