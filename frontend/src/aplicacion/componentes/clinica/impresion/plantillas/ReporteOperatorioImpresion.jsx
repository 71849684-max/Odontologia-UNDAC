import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Campo, Firma, Tabla, Texto } from '../primitivas.jsx';
import { formatearFecha } from '../../../../utilidades/fechas.mjs';
import { textoOpcional } from '../documentoClinico.mjs';

function diagnosticoDefinitivo(values, allFormData) {
  const diagnostico = allFormData?.diagnostico ?? {};
  const estructurado = (diagnostico.diagnosticos ?? []).find((item) => item.tipo === 'Definitivo') ?? (diagnostico.diagnosticos ?? [])[0];
  if (estructurado) {
    return [estructurado.codigo, estructurado.evidencia || estructurado.observaciones || estructurado.piezaRegion].filter(Boolean).join(' · ');
  }
  return textoOpcional(values.diagnosticoDefinitivo) || textoOpcional(diagnostico.dxDefinitivo);
}

export default function ReporteOperatorioImpresion({ values = {}, datos, allFormData = {}, history = {} }) {
  const paciente = datos.paciente;
  const filasVitales = [
    ['P.A.', values.pre_pa, values.intra_pa, values.post_pa],
    ['T°', values.pre_temp, values.intra_temp, values.post_temp],
    ['F.R.', values.pre_fr, values.intra_fr, values.post_fr],
    ['F.C.', values.pre_fc, values.intra_fc, values.post_fc],
    ['Pulso', values.pre_pulso, values.intra_pulso, values.post_pulso],
  ];
  return <DocumentoSeccion titulo="Reporte operatorio" datos={datos}>
    <Bloque titulo="Datos del paciente y del procedimiento">
      <div className="doc-grid doc-grid--3">
        <Campo etiqueta="Apellidos y nombres" valor={paciente.nombreCompleto} amplio />
        <Campo etiqueta="Edad" valor={paciente.edad ? `${paciente.edad} años` : ''} />
        <Campo etiqueta="Sexo" valor={paciente.sexo} />
        <Campo etiqueta="Domicilio" valor={patientDomicilio(values, datos)} amplio />
        <Campo etiqueta="Asistente" valor={history.operador || values.alumno} />
        <Campo etiqueta="Acompañante o asistente del procedimiento" valor={values.asistente} />
        <Campo etiqueta="Fecha" valor={formatearFecha(values.fecha)} />
      </div>
    </Bloque>

    <Bloque titulo="Procedimiento">
      <div className="doc-grid doc-grid--2">
        <Campo etiqueta="1. Lugar (sala de cirugía)" valor={values.lugar} />
        <Campo etiqueta="2. Caso clínico" valor={values.casoClinico} />
        <Campo etiqueta="3. Tipo de anestesia" valor={values.tipoAnestesia} />
        <Campo etiqueta="4. Técnica de anestesia" valor={values.tecnicaAnestesia} />
      </div>
      <Texto etiqueta="5. Diagnóstico definitivo" valor={diagnosticoDefinitivo(values, allFormData)} lineas={3} />
      <Texto etiqueta="6. Tipo de tratamiento" valor={values.tipoTratamiento} lineas={3} />
    </Bloque>

    <Bloque titulo="Control de signos vitales">
      <Tabla
        columnas={['Control', 'Preoperatorio', 'Intraoperatorio', 'Postoperatorio']}
        filas={filasVitales}
      />
    </Bloque>

    <Bloque titulo="Evolución y cierre">
      <Texto etiqueta="7. Pronóstico" valor={values.pronostico} lineas={3} />
      <div className="doc-grid doc-grid--2">
        <Campo etiqueta="8. Hora de inicio" valor={values.horaInicio} />
        <Campo etiqueta="9. Hora de término" valor={values.horaTermino} />
      </div>
      <Texto etiqueta="10. Prescripción postoperatoria" valor={values.prescripcionPost} lineas={5} />
      <Texto etiqueta="11. Alta" valor={values.alta} lineas={4} />
      <Texto etiqueta="12. Epicrisis" valor={values.epicrisis} lineas={5} />
    </Bloque>

    <Bloque titulo="Firmas">
      <div className="doc-firmas doc-firmas--2">
        <Firma etiqueta="Firma del profesional encargado" valor={values.firmaDocenteReporte} nombre={datos.operador.docente} />
        <Firma etiqueta="Firma del asistente" valor={values.firmaAlumnoReporte} nombre={history.operador} />
      </div>
      <Campo etiqueta="Fecha del reporte" valor={formatearFecha(values.fecha)} />
    </Bloque>
  </DocumentoSeccion>;
}

function patientDomicilio(values, datos) {
  return values.domicilio || datos.paciente.domicilio;
}
