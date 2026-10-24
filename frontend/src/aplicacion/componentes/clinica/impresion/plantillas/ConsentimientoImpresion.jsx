import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Campo, Firma, GrupoOpciones, Opcion, SubBloque, Texto } from '../primitivas.jsx';
import { consentParagraphs } from '../../../../formularios/consentimiento/consentimiento.config.mjs';
import { formatearFecha } from '../../../../utilidades/fechas.mjs';
import { texto } from '../documentoClinico.mjs';

export default function ConsentimientoImpresion({ values = {}, datos }) {
  const paciente = datos.paciente;
  return <DocumentoSeccion titulo="Consentimiento informado" datos={datos}>
    <div className="doc-consentimiento-encabezado">
      <h3>Autorización para la intervención quirúrgica en cirugía bucal</h3>
      <p>Documento de consentimiento informado del paciente.</p>
    </div>

    <Bloque titulo="Paciente">
      <div className="doc-grid doc-grid--3">
        <Campo etiqueta="Apellidos y nombres" valor={paciente.nombreCompleto} amplio />
        <Campo etiqueta="Edad" valor={paciente.edad ? `${paciente.edad} años` : ''} />
        <Campo etiqueta="Sexo" valor={paciente.sexo} />
        <Campo etiqueta="DNI" valor={paciente.dni} />
        <Campo etiqueta="Historia clínica" valor={paciente.historia} />
        <Campo etiqueta="Fecha" valor={formatearFecha(values.fecha)} />
        <Campo etiqueta="Domicilio" valor={values.domicilio || paciente.domicilio} amplio />
      </div>
      <Campo etiqueta="Profesional encargado que informa" valor={values.doctor || datos.operador.docente} amplio />
    </Bloque>

    <Bloque titulo="Autorización">
      <p className="doc-parrafo">Autorizo que el profesional encargado realice la intervención o procedimiento indicado, después de haber recibido la información necesaria para comprender su naturaleza, alternativas, riesgos y cuidados.</p>
      <ol className="doc-clausulas">
        {consentParagraphs.map((parrafo, indice) => <li key={indice}>
          <div className="doc-clausula-texto">{parrafo}</div>
          <div className="doc-clausula-estado"><Opcion etiqueta="Aceptada" marcado={Boolean(values[`consent${indice + 1}`])} /></div>
        </li>)}
      </ol>
      <Texto etiqueta="Intervención quirúrgica autorizada" valor={values.intervencionAutorizada} lineas={4} />
    </Bloque>

    <Bloque titulo="Firmas y constancias">
      <div className="doc-firmas doc-firmas--2">
        <Firma etiqueta="Firma del paciente" valor={values.firmaPaciente} nombre={paciente.nombreCompleto} />
        <Firma etiqueta="Huella dactilar — dedo índice derecho" valor={values.huellaDactilar} nombre={paciente.nombreCompleto} />
        <Firma etiqueta="Firma del acompañante" valor={values.firmaAcompanante} nombre={values.acompananteNombres} />
        <Firma etiqueta="Firma del profesional encargado" valor={values.firmaDocente} nombre={values.doctor || datos.operador.docente} />
      </div>
      <div className="doc-grid doc-grid--3">
        <Campo etiqueta="Cerro de Pasco, día" valor={values.firmaDia} />
        <Campo etiqueta="Mes" valor={values.firmaMes} />
        <Campo etiqueta="Año" valor={values.firmaAnio} />
      </div>
    </Bloque>

    <Bloque titulo="Familiar que lo acompaña">
      <div className="doc-grid doc-grid--2">
        <Campo etiqueta="Apellidos y nombres" valor={values.acompananteNombres} amplio />
        <Campo etiqueta="Dirección" valor={values.acompananteDireccion} />
        <Campo etiqueta="Parentesco" valor={values.acompananteParentesco} />
        <Campo etiqueta="DNI" valor={values.acompananteDni} />
      </div>
    </Bloque>

    <Bloque titulo="Programación de cirugía">
      <div className="doc-grid doc-grid--3">
        <Campo etiqueta="Fecha" valor={formatearFecha(values.programacionFecha)} />
        <Campo etiqueta="Hora" valor={values.programacionHora} />
      </div>
      <Texto etiqueta="Observaciones" valor={values.programacionObservaciones} lineas={4} />
      {values.programacionFecha || values.programacionHora ? <SubBloque titulo="Confirmación">
        <GrupoOpciones etiqueta="Programación registrada" valor="Sí" opciones={['Sí', 'No']} />
        <p className="doc-nota">{texto(values.programacionObservaciones, 'Sin observaciones adicionales.')}</p>
      </SubBloque> : null}
    </Bloque>
  </DocumentoSeccion>;
}
