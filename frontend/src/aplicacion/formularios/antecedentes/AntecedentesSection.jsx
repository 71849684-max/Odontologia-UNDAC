import React from 'react';
import { SectionCard, Field, SelectField, ChoiceGroup, CheckboxGroup } from '../compartidos/ControlesClinicos.jsx';
import { yesNo } from '../compartidos/opcionesClinicas.js';
import useSection from '../compartidos/useSection.js';

export default function AntecedentesSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack">
    <SectionCard title="Antecedentes personales — Generales">
      <div className="undac-form-grid">
        <Field label="Hijos: número" type="number" min="0" value={get('hijosNumero')} onChange={set('hijosNumero')} /><Field label="Hijos vivos" type="number" min="0" value={get('hijosVivos')} onChange={set('hijosVivos')} />
        <Field label="Hijos fallecidos" type="number" min="0" value={get('hijosFallecidos')} onChange={set('hijosFallecidos')} /><ChoiceGroup label="Ningún hijo" value={get('ningunHijo')} onChange={set('ningunHijo')} options={yesNo} />
        <SelectField label="Vivienda" value={get('vivienda')} onChange={set('vivienda')} options={['Propia','Alquilada','Otros']} /><Field label="Vivienda — otros" value={get('viviendaOtros')} onChange={set('viviendaOtros')} />
        <SelectField label="Material de vivienda" value={get('materialVivienda')} onChange={set('materialVivienda')} options={['Noble','Rústico','Otros']} /><Field label="Material — otros" value={get('materialOtros')} onChange={set('materialOtros')} />
        <SelectField label="Viajes" value={get('viajes')} onChange={set('viajes')} options={['Nunca','Frecuente','Otros']} /><Field label="Viajes — otros" value={get('viajesOtros')} onChange={set('viajesOtros')} />
        <SelectField label="Alimentación" value={get('alimentacion')} onChange={set('alimentacion')} options={['Come todo','Vegetariano','Dieta por indicación médica','Otros']} /><Field label="Alimentación — otros" value={get('alimentacionOtros')} onChange={set('alimentacionOtros')} />
        <CheckboxGroup label="Hábitos nocivos" values={get('habitosNocivos', [])} onChange={set('habitosNocivos')} options={['Fuma','Alcohol','Drogas','Otros']} className="undac-col-2" />
        <Field label="De ser sí, tipo y tiempo" value={get('habitosDetalle')} onChange={set('habitosDetalle')} className="undac-col-2" />
        <ChoiceGroup label="Inmunizaciones" value={get('inmunizaciones')} onChange={set('inmunizaciones')} options={yesNo} /><SelectField label="Situación socioeconómica" value={get('socioeconomica')} onChange={set('socioeconomica')} options={['Baja','Media','Alta']} />
      </div>
    </SectionCard>
    <SectionCard title="Antecedentes fisiológicos">
      <div className="undac-form-grid">
        <ChoiceGroup label="Periodo prenatal" value={get('prenatal')} onChange={set('prenatal')} options={['Normal','Con dificultad']} /><Field label="Detalle prenatal" value={get('prenatalDetalle')} onChange={set('prenatalDetalle')} />
        <ChoiceGroup label="Periodo natal" value={get('natal')} onChange={set('natal')} options={['Normal','Con dificultad']} /><Field label="Detalle natal" value={get('natalDetalle')} onChange={set('natalDetalle')} />
        <SelectField label="Lactancia" value={get('lactancia')} onChange={set('lactancia')} options={['Materna','Artificial','Otros']} /><Field label="Lactancia — otros" value={get('lactanciaOtros')} onChange={set('lactanciaOtros')} />
        <Field label="En mujeres: inicio de menstruación" value={get('menarquia')} onChange={set('menarquia')} /><SelectField label="Características" value={get('menstruacionCaracteristicas')} onChange={set('menstruacionCaracteristicas')} options={['Normal','A veces','Finalizó por la edad']} />
        <Field label="Edad de finalización" value={get('menstruacionFinal')} onChange={set('menstruacionFinal')} /><ChoiceGroup label="Gestación" value={get('gestacion')} onChange={set('gestacion')} options={yesNo} />
        {get('gestacion') === 'Sí' ? <Field label="Tiempo de gestación" value={get('gestacionTiempo')} onChange={set('gestacionTiempo')} className="undac-col-2" /> : null}
      </div>
    </SectionCard>
    <SectionCard title="Antecedentes terapéuticos">
      <div className="undac-form-grid">
        <ChoiceGroup label="¿Es alérgico a algún medicamento?" value={get('alergiaMedicamento')} onChange={set('alergiaMedicamento')} options={yesNo} /><Field label="Medicamento / detalle" value={get('alergiaMedicamentoDetalle')} onChange={set('alergiaMedicamentoDetalle')} />
        <Field label="Medicación anterior — nombre" value={get('medicacionAnteriorNombre')} onChange={set('medicacionAnteriorNombre')} /><Field label="Dosis" value={get('medicacionAnteriorDosis')} onChange={set('medicacionAnteriorDosis')} />
        <ChoiceGroup label="Medicación actual" value={get('medicacionActual')} onChange={set('medicacionActual')} options={yesNo} /><Field label="Nombre" value={get('medicacionActualNombre')} onChange={set('medicacionActualNombre')} />
        <Field label="Dosis" value={get('medicacionActualDosis')} onChange={set('medicacionActualDosis')} /><Field label="¿Por qué?" value={get('medicacionActualMotivo')} onChange={set('medicacionActualMotivo')} />
      </div>
    </SectionCard>
    <SectionCard title="Actos quirúrgicos">
      <div className="undac-form-grid">
        <ChoiceGroup label="¿Ha sido intervenido quirúrgicamente con anestesia total?" value={get('cirugiaAnestesiaTotal')} onChange={set('cirugiaAnestesiaTotal')} options={yesNo} className="undac-col-2" />
        <Field label="Tipo de intervención quirúrgica" value={get('tipoIntervencion')} onChange={set('tipoIntervencion')} className="undac-col-2" />
        <ChoiceGroup label="Reacción de la anestesia total" value={get('reaccionAnestesia')} onChange={set('reaccionAnestesia')} options={['Normal','Con complicaciones']} /><Field label="Si fue con complicaciones, explique" value={get('reaccionAnestesiaDetalle')} onChange={set('reaccionAnestesiaDetalle')} />
        <ChoiceGroup label="Hemorragias a causa de la intervención" value={get('hemorragiaIntervencion')} onChange={set('hemorragiaIntervencion')} options={yesNo} /><Field label="De ser sí, ¿cuántos días?" value={get('hemorragiaDias')} onChange={set('hemorragiaDias')} />
        <SelectField label="Proceso de cicatrización" value={get('cicatrizacion')} onChange={set('cicatrizacion')} options={['Normal','Demoró','Se complicó','Otros']} /><Field label="Cicatrización — otros" value={get('cicatrizacionOtros')} onChange={set('cicatrizacionOtros')} />
        <ChoiceGroup label="¿Le han realizado exodoncias?" value={get('exodoncias')} onChange={set('exodoncias')} options={yesNo} /><ChoiceGroup label="¿Problemas con el anestésico odontológico?" value={get('problemasAnestesicoOdontologico')} onChange={set('problemasAnestesicoOdontologico')} options={yesNo} />
        <ChoiceGroup label="¿Hemorragias post exodoncias?" value={get('hemorragiasPostExodoncia')} onChange={set('hemorragiasPostExodoncia')} options={yesNo} /><Field label="¿Por cuántos días?" value={get('hemorragiasPostExodonciaDias')} onChange={set('hemorragiasPostExodonciaDias')} />
        <ChoiceGroup label="Las exodoncias fueron realizadas por" value={get('exodonciaRealizadaPor')} onChange={set('exodonciaRealizadaPor')} options={['Odontólogo','Técnico']} className="undac-col-2" />
      </div>
    </SectionCard>
    <SectionCard title="Antecedentes familiares">
      <div className="undac-form-grid">
        <SelectField label="Padre" value={get('padreEstado')} onChange={set('padreEstado')} options={['Vive','Fallecido','Otros']} /><Field label="Padre — otros" value={get('padreEstadoOtros')} onChange={set('padreEstadoOtros')} />
        <SelectField label="Madre" value={get('madreEstado')} onChange={set('madreEstado')} options={['Vive','Fallecido','Otros']} /><Field label="Madre — otros" value={get('madreEstadoOtros')} onChange={set('madreEstadoOtros')} />
        <Field label="Hermanos — número" type="number" min="0" value={get('hermanosNumero')} onChange={set('hermanosNumero')} /><Field label="Hermanos vivos" type="number" min="0" value={get('hermanosVivos')} onChange={set('hermanosVivos')} />
        <Field label="Hermanos fallecidos" type="number" min="0" value={get('hermanosFallecidos')} onChange={set('hermanosFallecidos')} /><Field label="Otros" value={get('hermanosOtros')} onChange={set('hermanosOtros')} />
      </div>
    </SectionCard>
  </div>;
}
