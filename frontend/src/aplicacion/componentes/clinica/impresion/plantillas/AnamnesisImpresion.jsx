import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Campo, GrupoOpciones, Lista, Texto } from '../primitivas.jsx';

export default function AnamnesisImpresion({ values = {}, datos }) {
  return <DocumentoSeccion titulo="Anamnesis y enfermedad actual" datos={datos}>
    <Bloque titulo="Motivo de consulta y enfermedad actual">
      <Texto etiqueta="Motivo de consulta" valor={values.motivoConsulta} lineas={3} />
      <GrupoOpciones etiqueta="Tipo de atención" valor={values.tipoAtencion} opciones={['Urgencia', 'Tratamiento integral', 'Tratamiento específico']} />
      <Texto etiqueta="Historia de la enfermedad" valor={values.historiaEnfermedad} lineas={5} />
      <GrupoOpciones etiqueta="Estado general del paciente" valor={values.estadoGeneral} opciones={['Malo', 'Regular', 'Bueno']} />
      <Texto etiqueta="Ectoscopía" valor={values.ectoscopia} lineas={3} />
    </Bloque>

    <Bloque titulo="Datos psicológicos al momento de la consulta">
      <Lista etiqueta="Estado observado" valores={values.estadoPsicologico} />
      <Texto etiqueta="Observaciones" valor={values.observacionesPsicologicas} lineas={3} />
    </Bloque>

    <Bloque titulo="Antecedentes de atención odontológica">
      <div className="doc-grid doc-grid--2">
        <Campo etiqueta="Última visita al dentista" valor={values.ultimaVisitaDentista} />
        <Campo etiqueta="Motivo de la visita" valor={values.motivoVisitaDentista} />
      </div>
    </Bloque>
  </DocumentoSeccion>;
}
