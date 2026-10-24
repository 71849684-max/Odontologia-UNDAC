import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Campo, GrupoOpciones, Lista, SubBloque, Texto } from '../primitivas.jsx';

export default function AntecedentesImpresion({ values = {}, datos, allFormData = {} }) {
  const salud = allFormData['cuestionario-salud'] ?? {};
  return <DocumentoSeccion titulo="Antecedentes personales y familiares" datos={datos}>
    <Bloque titulo="Antecedentes personales generales">
      <div className="doc-grid doc-grid--3">
        <Campo etiqueta="Hijos: número" valor={values.hijosNumero} />
        <Campo etiqueta="Hijos vivos" valor={values.hijosVivos} />
        <Campo etiqueta="Hijos fallecidos" valor={values.hijosFallecidos} />
        <GrupoOpciones etiqueta="Ningún hijo" valor={values.ningunHijo} opciones={['Sí', 'No']} />
        <GrupoOpciones etiqueta="Vivienda" valor={values.vivienda} opciones={['Propia', 'Alquilada', 'Otros']} />
        <Campo etiqueta="Vivienda: otros" valor={values.viviendaOtros} />
        <GrupoOpciones etiqueta="Material de vivienda" valor={values.materialVivienda} opciones={['Noble', 'Rústico', 'Otros']} />
        <Campo etiqueta="Material: otros" valor={values.materialOtros} />
        <GrupoOpciones etiqueta="Viajes" valor={values.viajes} opciones={['Nunca', 'Frecuente', 'Otros']} />
        <Campo etiqueta="Viajes: otros" valor={values.viajesOtros} />
        <GrupoOpciones etiqueta="Alimentación" valor={values.alimentacion} opciones={['Come todo', 'Vegetariano', 'Dieta por indicación médica', 'Otros']} />
        <Campo etiqueta="Alimentación: otros" valor={values.alimentacionOtros} />
        <GrupoOpciones etiqueta="Inmunizaciones" valor={values.inmunizaciones} opciones={['Sí', 'No']} />
        <GrupoOpciones etiqueta="Situación socioeconómica" valor={values.socioeconomica} opciones={['Baja', 'Media', 'Alta']} />
      </div>
      <Lista etiqueta="Hábitos nocivos" valores={values.habitosNocivos} />
      <Texto etiqueta="De ser sí, tipo y tiempo" valor={values.habitosDetalle} lineas={2} />
    </Bloque>

    <Bloque titulo="Antecedentes fisiológicos">
      <div className="doc-grid doc-grid--2">
        <GrupoOpciones etiqueta="Periodo prenatal" valor={values.prenatal} opciones={['Normal', 'Con dificultad']} />
        <Campo etiqueta="Detalle prenatal" valor={values.prenatalDetalle} />
        <GrupoOpciones etiqueta="Periodo natal" valor={values.natal} opciones={['Normal', 'Con dificultad']} />
        <Campo etiqueta="Detalle natal" valor={values.natalDetalle} />
        <GrupoOpciones etiqueta="Lactancia" valor={values.lactancia} opciones={['Materna', 'Artificial', 'Otros']} />
        <Campo etiqueta="Lactancia: otros" valor={values.lactanciaOtros} />
        <Campo etiqueta="Inicio de menstruación" valor={values.menarquia} />
        <GrupoOpciones etiqueta="Características de la menstruación" valor={values.menstruacionCaracteristicas} opciones={['Normal', 'A veces', 'Finalizó por la edad']} />
        <Campo etiqueta="Edad de finalización" valor={values.menstruacionFinal} />
        <GrupoOpciones etiqueta="Gestación" valor={values.gestacion} opciones={['Sí', 'No']} />
        <Campo etiqueta="Tiempo de gestación" valor={values.gestacionTiempo} />
      </div>
    </Bloque>

    <Bloque titulo="Antecedentes terapéuticos">
      <GrupoOpciones etiqueta="Alergia a algún medicamento" valor={values.alergiaMedicamento} opciones={['Sí', 'No']} />
      <Campo etiqueta="Medicamento o detalle de la alergia" valor={values.alergiaMedicamentoDetalle} />
      <SubBloque titulo="Medicación anterior">
        <div className="doc-grid doc-grid--2">
          <Campo etiqueta="Nombre" valor={values.medicacionAnteriorNombre} />
          <Campo etiqueta="Dosis" valor={values.medicacionAnteriorDosis} />
        </div>
      </SubBloque>
      <SubBloque titulo="Medicación actual">
        <GrupoOpciones etiqueta="¿Toma medicación actualmente?" valor={values.medicacionActual} opciones={['Sí', 'No']} />
        <div className="doc-grid doc-grid--3">
          <Campo etiqueta="Nombre" valor={values.medicacionActualNombre} />
          <Campo etiqueta="Dosis" valor={values.medicacionActualDosis} />
          <Campo etiqueta="¿Por qué?" valor={values.medicacionActualMotivo} />
        </div>
      </SubBloque>
      <div className="doc-grid doc-grid--2">
        <Campo etiqueta="Alergia registrada en el cuestionario de salud" valor={salud.q14Answer === 'Sí' ? salud.q14Detail : salud.q13Answer === 'Sí' ? salud.q13Detail : ''} />
      </div>
    </Bloque>

    <Bloque titulo="Actos quirúrgicos y anestesia">
      <GrupoOpciones etiqueta="Intervenido quirúrgicamente con anestesia total" valor={values.cirugiaAnestesiaTotal} opciones={['Sí', 'No']} />
      <Campo etiqueta="Tipo de intervención quirúrgica" valor={values.tipoIntervencion} />
      <GrupoOpciones etiqueta="Reacción de la anestesia total" valor={values.reaccionAnestesia} opciones={['Normal', 'Con complicaciones']} />
      <Texto etiqueta="Detalle de las complicaciones" valor={values.reaccionAnestesiaDetalle} lineas={2} />
      <GrupoOpciones etiqueta="Hemorragias a causa de la intervención" valor={values.hemorragiaIntervencion} opciones={['Sí', 'No']} />
      <Campo etiqueta="Días de hemorragia" valor={values.hemorragiaDias} />
      <GrupoOpciones etiqueta="Proceso de cicatrización" valor={values.cicatrizacion} opciones={['Normal', 'Demoró', 'Se complicó', 'Otros']} />
      <Campo etiqueta="Cicatrización: otros" valor={values.cicatrizacionOtros} />
      <div className="doc-grid doc-grid--2">
        <GrupoOpciones etiqueta="Le han realizado exodoncias" valor={values.exodoncias} opciones={['Sí', 'No']} />
        <GrupoOpciones etiqueta="Problemas con el anestésico odontológico" valor={values.problemasAnestesicoOdontologico} opciones={['Sí', 'No']} />
        <GrupoOpciones etiqueta="Hemorragias post exodoncia" valor={values.hemorragiasPostExodoncia} opciones={['Sí', 'No']} />
        <Campo etiqueta="Días de hemorragia post exodoncia" valor={values.hemorragiasPostExodonciaDias} />
        <GrupoOpciones etiqueta="Las exodoncias fueron realizadas por" valor={values.exodonciaRealizadaPor} opciones={['Odontólogo', 'Técnico']} />
      </div>
    </Bloque>

    <Bloque titulo="Antecedentes familiares">
      <div className="doc-grid doc-grid--3">
        <GrupoOpciones etiqueta="Padre" valor={values.padreEstado} opciones={['Vive', 'Fallecido', 'Otros']} />
        <Campo etiqueta="Padre: otros" valor={values.padreEstadoOtros} />
        <GrupoOpciones etiqueta="Madre" valor={values.madreEstado} opciones={['Vive', 'Fallecido', 'Otros']} />
        <Campo etiqueta="Madre: otros" valor={values.madreEstadoOtros} />
        <Campo etiqueta="Hermanos: número" valor={values.hermanosNumero} />
        <Campo etiqueta="Hermanos vivos" valor={values.hermanosVivos} />
        <Campo etiqueta="Hermanos fallecidos" valor={values.hermanosFallecidos} />
        <Campo etiqueta="Hermanos: otros" valor={values.hermanosOtros} />
      </div>
    </Bloque>
  </DocumentoSeccion>;
}
