import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Campo, Galeria, GrupoOpciones, Texto } from '../primitivas.jsx';

export default function ExamenExtraoralImpresion({ values = {}, datos }) {
  return <DocumentoSeccion titulo="Examen estomatológico extraoral" datos={datos}>
    <Bloque titulo="Evaluación facial y funcional">
      <GrupoOpciones etiqueta="Tipo facial" valor={values.tipoFacial} opciones={['Dolicocéfalo', 'Mesocéfalo', 'Braquicéfalo']} />
      <GrupoOpciones etiqueta="Simetría facial" valor={values.simetriaFacial} opciones={['Simétrica', 'Asimétrica']} />
      <GrupoOpciones etiqueta="Perfil anteroposterior" valor={values.perfil} opciones={['Convexo', 'Recto', 'Cóncavo']} />
      <GrupoOpciones etiqueta="Labios" valor={values.competenciaLabial} opciones={['Competencia labial', 'Incompetencia labial', 'Cortos']} />
      <GrupoOpciones etiqueta="Tonicidad de músculos peribucales" valor={values.tonicidad} opciones={['Hipertónico', 'Normotónico', 'Hipotónico']} />
      <GrupoOpciones etiqueta="Ángulo nasolabial" valor={values.anguloNasolabial} opciones={['Cerrado', 'Normal', 'Abierto']} />
      <GrupoOpciones etiqueta="Fonación" valor={values.fonacion} opciones={['Normal', 'Paranormal', 'Otros']} />
      <Campo etiqueta="Fonación: otros" valor={values.fonacionOtros} />
      <div className="doc-grid doc-grid--2">
        <Campo etiqueta="Última visita al dentista" valor={values.ultimaVisitaDentista} />
        <Campo etiqueta="Motivo de la visita" valor={values.motivoVisitaDentista} />
      </div>
      <Texto etiqueta="Observaciones" valor={values.observaciones} lineas={2} />
    </Bloque>

    <Bloque titulo="Fotografías extraorales">
      <Galeria etiqueta="Vistas extraorales" adjuntos={values.fotosExtraorales} />
    </Bloque>
  </DocumentoSeccion>;
}
