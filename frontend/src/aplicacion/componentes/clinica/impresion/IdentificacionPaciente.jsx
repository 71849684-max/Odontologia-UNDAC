import React from 'react';
import { texto } from './documentoClinico.mjs';

export default function IdentificacionPaciente({ datos }) {
  const paciente = datos?.paciente ?? {};
  return <div className="doc-identificacion" aria-label="Identificación del paciente">
    <div className="doc-identificacion__nombre">
      <span>Paciente</span>
      <strong>{texto(paciente.nombreCompleto)}</strong>
    </div>
    <div><span>DNI</span><strong>{texto(paciente.dni)}</strong></div>
    <div><span>Edad</span><strong>{paciente.edad ? `${paciente.edad} años` : texto(paciente.edad)}</strong></div>
    <div><span>Sexo</span><strong>{texto(paciente.sexo)}</strong></div>
    <div><span>Historia clínica</span><strong>{texto(paciente.historia)}</strong></div>
    <div><span>Fecha de registro</span><strong>{texto(paciente.fechaRegistro)}</strong></div>
  </div>;
}
