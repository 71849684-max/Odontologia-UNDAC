import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Campo, GrupoOpciones, Lista, Texto } from '../primitivas.jsx';

export default function OclusionImpresion({ values = {}, datos }) {
  return <DocumentoSeccion titulo="Oclusión y pérdida dentaria" datos={datos}>
    <Bloque titulo="Relaciones oclusales">
      <div className="doc-grid doc-grid--2">
        <Campo etiqueta="Posterior: clase" valor={values.oclusionPosterior} />
        <Campo etiqueta="Anterior: clase" valor={values.oclusionAnterior} />
      </div>
      <Texto etiqueta="Última exodoncia o motivo de pérdida dentaria" valor={values.ultimaExodoncia} lineas={3} />
      <Lista etiqueta="Motivo por el cual perdió las piezas dentarias" valores={values.motivosPerdida} />
      <Campo etiqueta="Motivo: otros" valor={values.motivosPerdidaOtros} />
    </Bloque>

    <Bloque titulo="Antecedentes protésicos">
      <Lista etiqueta="Tipo de prótesis bucal" valores={values.protesisTipos} />
      <Campo etiqueta="Prótesis: otros" valor={values.protesisOtros} />
      <GrupoOpciones etiqueta="La prótesis fue confeccionada e instalada por" valor={values.protesisProfesional} opciones={['Odontólogo', 'Técnico dental']} />
    </Bloque>

    <Bloque titulo="Diagnóstico presuntivo">
      <Texto etiqueta="Diagnóstico presuntivo" valor={values.diagnosticoPresuntivoOclusion} lineas={4} />
    </Bloque>
  </DocumentoSeccion>;
}
