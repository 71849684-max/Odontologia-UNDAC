import React from 'react';
import { texto } from './documentoClinico.mjs';

export default function EncabezadoInstitucional({ titulo, datos }) {
  return <header className="doc-encabezado">
    <div className="doc-encabezado__marca">
      <span>Documento clínico</span>
      <strong>Historia Clínica Odontológica</strong>
    </div>
    <div className="doc-encabezado__titulo">
      <h2>{titulo}</h2>
    </div>
    <div className="doc-encabezado__codigo">
      <span>Historia clínica</span>
      <strong>{texto(datos?.paciente?.historia)}</strong>
    </div>
  </header>;
}
