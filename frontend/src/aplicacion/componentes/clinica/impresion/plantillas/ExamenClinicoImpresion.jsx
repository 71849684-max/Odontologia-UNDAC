import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Campo, GrupoOpciones, Tabla, Texto } from '../primitivas.jsx';
import { calcularImc } from '../documentoClinico.mjs';

export default function ExamenClinicoImpresion({ values = {}, datos }) {
  const imc = calcularImc(values.peso, values.talla);
  return <DocumentoSeccion titulo="Examen clínico general" datos={datos}>
    <Bloque titulo="Evaluación general">
      <GrupoOpciones etiqueta="Tipo psicológico de paciente" valor={values.tipoPsicologico} opciones={['Receptivo', 'Escéptico', 'Pasivo', 'No colaborador']} />
      <GrupoOpciones etiqueta="Marcha o caminata" valor={values.marcha} opciones={['Normal', 'Con dificultad']} />
      <GrupoOpciones etiqueta="Fatiga o cansancio al sentarse o caminar" valor={values.fatiga} opciones={['Sí', 'No']} />
      <div className="doc-grid doc-grid--3">
        <GrupoOpciones etiqueta="Raza" valor={values.raza} opciones={['Mestiza', 'Blanca', 'Negra', 'Caucásico', 'Otros']} />
        <Campo etiqueta="Raza: otros" valor={values.razaOtros} />
        <Campo etiqueta="Peso (kg)" valor={values.peso} />
        <Campo etiqueta="Talla (m o cm)" valor={values.talla} />
        <Campo etiqueta="Índice de masa corporal" valor={imc} />
      </div>
    </Bloque>

    <Bloque titulo="Signos vitales">
      <Tabla
        columnas={['Temperatura', 'Presión arterial', 'Frecuencia respiratoria', 'Pulso', 'Frecuencia cardiaca']}
        filas={[[
          values.temperatura ? `${values.temperatura} °C` : '',
          values.presionArterial ? `${values.presionArterial} mmHg` : '',
          values.frecuenciaRespiratoria ? `${values.frecuenciaRespiratoria} rpm` : '',
          values.pulso ? `${values.pulso} ppm` : '',
          values.frecuenciaCardiaca ? `${values.frecuenciaCardiaca} lpm` : '',
        ]]}
      />
    </Bloque>

    <Bloque titulo="Cabeza y órganos de los sentidos">
      <GrupoOpciones etiqueta="Forma del cráneo" valor={values.formaCraneo} opciones={['Dolicocéfalo', 'Mesocéfalo', 'Braquicéfalo']} />
      <div className="doc-grid doc-grid--3">
        <GrupoOpciones etiqueta="Cabellos: implantación" valor={values.cabelloImplantacion} opciones={['Buena', 'Regular', 'Patológica']} />
        <Campo etiqueta="Cabellos: color" valor={values.cabelloColor} />
        <GrupoOpciones etiqueta="Ojos" valor={values.ojosEstado} opciones={['Normales', 'Presenta patología']} />
        <Campo etiqueta="Ojos: patología" valor={values.ojosPatologia} />
        <Campo etiqueta="Ojos: color" valor={values.ojosColor} />
        <Campo etiqueta="Ojos: forma" valor={values.ojosForma} />
        <GrupoOpciones etiqueta="Oídos" valor={values.oidosEstado} opciones={['Normales', 'Presenta patología']} />
        <Campo etiqueta="Oídos: patología" valor={values.oidosPatologia} />
        <GrupoOpciones etiqueta="Audición" valor={values.audicion} opciones={['Escucha bien', 'Escucha con dificultad']} />
        <GrupoOpciones etiqueta="Nariz" valor={values.narizEstado} opciones={['Normal', 'Buen olfato', 'Dificultad en olfacción']} />
        <Campo etiqueta="Nariz: forma" valor={values.narizForma} />
        <GrupoOpciones etiqueta="Labios" valor={values.labiosEstado} opciones={['Normal', 'Presenta patología']} />
        <Campo etiqueta="Labios: patología" valor={values.labiosPatologia} />
        <Campo etiqueta="Labios: forma" valor={values.labiosForma} />
        <GrupoOpciones etiqueta="Fascies" valor={values.fasciesEstado} opciones={['Normal', 'Patológico']} />
        <Campo etiqueta="Fascies: color" valor={values.fasciesColor} />
      </div>
    </Bloque>

    <Bloque titulo="Cuello, extremidades y tórax">
      <div className="doc-grid doc-grid--2">
        <GrupoOpciones etiqueta="Cuello: forma" valor={values.cuelloForma} opciones={['Normal', 'Patológico']} />
        <Campo etiqueta="Cuello: patología" valor={values.cuelloPatologia} />
        <GrupoOpciones etiqueta="Cadena linfática" valor={values.cadenaLinfatica} opciones={['Normal', 'Patológico']} />
        <Campo etiqueta="Cadena linfática: patología" valor={values.cadenaLinfaticaPatologia} />
        <GrupoOpciones etiqueta="ATM" valor={values.atm} opciones={['Normal', 'Chasquidos', 'Otros']} />
        <Campo etiqueta="ATM: otros" valor={values.atmOtros} />
        <GrupoOpciones etiqueta="Glándulas tiroides" valor={values.tiroides} opciones={['Normal', 'Patológico']} />
        <Campo etiqueta="Tiroides: patología" valor={values.tiroidesPatologia} />
        <GrupoOpciones etiqueta="Miembros superiores" valor={values.miembrosSuperiores} opciones={['Normales', 'Presenta alteración']} />
        <Campo etiqueta="Miembros superiores: alteración" valor={values.miembrosSuperioresDetalle} />
        <GrupoOpciones etiqueta="Miembros inferiores" valor={values.miembrosInferiores} opciones={['Normales', 'Presenta alteración']} />
        <Campo etiqueta="Miembros inferiores: alteración" valor={values.miembrosInferioresDetalle} />
        <GrupoOpciones etiqueta="Tórax" valor={values.torax} opciones={['Normal', 'Presenta alteración o patología']} />
        <Campo etiqueta="Tórax: patología" valor={values.toraxPatologia} />
      </div>
    </Bloque>

    <Bloque titulo="Observaciones">
      <Texto etiqueta="Observaciones del examen clínico" valor={values.observaciones} lineas={3} />
    </Bloque>
  </DocumentoSeccion>;
}
