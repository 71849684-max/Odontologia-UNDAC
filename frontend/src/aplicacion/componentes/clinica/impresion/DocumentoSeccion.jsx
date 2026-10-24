import React from 'react';
import HojaImpresion from './HojaImpresion.jsx';
import EncabezadoInstitucional from './EncabezadoInstitucional.jsx';
import IdentificacionPaciente from './IdentificacionPaciente.jsx';
import PieDocumento from './PieDocumento.jsx';

export default function DocumentoSeccion({ titulo, datos, children }) {
  return <HojaImpresion>
    <EncabezadoInstitucional titulo={titulo} datos={datos} />
    <IdentificacionPaciente datos={datos} />
    <div className="doc-cuerpo">{children}</div>
    <PieDocumento datos={datos} />
  </HojaImpresion>;
}
