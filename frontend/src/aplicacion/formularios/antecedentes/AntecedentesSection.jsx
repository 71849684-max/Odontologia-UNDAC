import React from 'react';
import { CollapsibleSection, Field, SelectField, ChoiceGroup, CheckboxGroup } from '../compartidos/ControlesClinicos.jsx';
import { yesNo } from '../compartidos/opcionesClinicas.js';
import useSection from '../compartidos/useSection.js';

function hasAny(values, keys) {
  return keys.some((key) => {
    const value = values?.[key];
    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== '';
  });
}

const blockStatus = (values, keys) => hasAny(values, keys) ? 'progress' : 'pending';

export default function AntecedentesSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack clinical-antecedentes-flow">
    <CollapsibleSection title="Antecedentes personales · Generales" subtitle="Hábitos, vivienda, alimentación e inmunizaciones" defaultOpen status={blockStatus(values, ['vivienda','alimentacion','habitosNocivos','inmunizaciones'])}>
      <div className="undac-form-grid">
        <Field label="Hijos: número" type="number" min="0" value={get('hijosNumero')} onChange={set('hijosNumero')} /><Field label="Hijos vivos" type="number" min="0" value={get('hijosVivos')} onChange={set('hijosVivos')} />
        <Field label="Hijos fallecidos" type="number" min="0" value={get('hijosFallecidos')} onChange={set('hijosFallecidos')} /><ChoiceGroup label="Ningún hijo" value={get('ningunHijo')} onChange={set('ningunHijo')} options={yesNo} />
        <SelectField label="Vivienda" value={get('vivienda')} onChange={set('vivienda')} options={['Propia','Alquilada','Otros']} />{get('vivienda') === 'Otros' ? <Field label="Vivienda — otros" value={get('viviendaOtros')} onChange={set('viviendaOtros')} /> : null}
        <SelectField label="Material de vivienda" value={get('materialVivienda')} onChange={set('materialVivienda')} options={['Noble','Rústico','Otros']} />{get('materialVivienda') === 'Otros' ? <Field label="Material — otros" value={get('materialOtros')} onChange={set('materialOtros')} /> : null}
        <SelectField label="Viajes" value={get('viajes')} onChange={set('viajes')} options={['Nunca','Frecuente','Otros']} />{get('viajes') === 'Otros' ? <Field label="Viajes — otros" value={get('viajesOtros')} onChange={set('viajesOtros')} /> : null}
        <SelectField label="Alimentación" value={get('alimentacion')} onChange={set('alimentacion')} options={['Come todo','Vegetariano','Dieta por indicación médica','Otros']} />{get('alimentacion') === 'Otros' ? <Field label="Alimentación — otros" value={get('alimentacionOtros')} onChange={set('alimentacionOtros')} /> : null}
        <CheckboxGroup label="Hábitos nocivos" values={get('habitosNocivos', [])} onChange={set('habitosNocivos')} options={['Fuma','Alcohol','Drogas','Otros']} className="undac-col-2" />
        {get('habitosNocivos', []).length ? <Field label="De ser sí, tipo y tiempo" value={get('habitosDetalle')} onChange={set('habitosDetalle')} className="undac-col-2" /> : null}
        <ChoiceGroup label="Inmunizaciones" value={get('inmunizaciones')} onChange={set('inmunizaciones')} options={yesNo} /><SelectField label="Situación socioeconómica" value={get('socioeconomica')} onChange={set('socioeconomica')} options={['Baja','Media','Alta']} />
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Antecedentes fisiológicos" subtitle="Desarrollo, lactancia y antecedentes gineco-obstétricos cuando correspondan" status={blockStatus(values, ['prenatal','natal','lactancia','gestacion','menarquia'])}>
      <div className="undac-form-grid">
        <ChoiceGroup label="Periodo prenatal" value={get('prenatal')} onChange={set('prenatal')} options={['Normal','Con dificultad']} />{get('prenatal') === 'Con dificultad' ? <Field label="Detalle prenatal" value={get('prenatalDetalle')} onChange={set('prenatalDetalle')} /> : null}
        <ChoiceGroup label="Periodo natal" value={get('natal')} onChange={set('natal')} options={['Normal','Con dificultad']} />{get('natal') === 'Con dificultad' ? <Field label="Detalle natal" value={get('natalDetalle')} onChange={set('natalDetalle')} /> : null}
        <SelectField label="Lactancia" value={get('lactancia')} onChange={set('lactancia')} options={['Materna','Artificial','Otros']} />{get('lactancia') === 'Otros' ? <Field label="Lactancia — otros" value={get('lactanciaOtros')} onChange={set('lactanciaOtros')} /> : null}
        <Field label="En mujeres: inicio de menstruación" value={get('menarquia')} onChange={set('menarquia')} /><SelectField label="Características" value={get('menstruacionCaracteristicas')} onChange={set('menstruacionCaracteristicas')} options={['Normal','A veces','Finalizó por la edad']} />
        {get('menstruacionCaracteristicas') === 'Finalizó por la edad' ? <Field label="Edad de finalización" value={get('menstruacionFinal')} onChange={set('menstruacionFinal')} /> : null}<ChoiceGroup label="Gestación" value={get('gestacion')} onChange={set('gestacion')} options={yesNo} />
        {get('gestacion') === 'Sí' ? <Field label="Tiempo de gestación" value={get('gestacionTiempo')} onChange={set('gestacionTiempo')} className="undac-col-2" /> : null}
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Antecedentes terapéuticos" subtitle="Alergias y medicación previa o actual" defaultOpen={get('alergiaMedicamento') === 'Sí' || get('medicacionActual') === 'Sí'} status={blockStatus(values, ['alergiaMedicamento','medicacionAnteriorNombre','medicacionActual'])}>
      <div className="undac-form-grid">
        <ChoiceGroup label="¿Es alérgico a algún medicamento?" value={get('alergiaMedicamento')} onChange={set('alergiaMedicamento')} options={yesNo} />{get('alergiaMedicamento') === 'Sí' ? <Field label="Medicamento / detalle" value={get('alergiaMedicamentoDetalle')} onChange={set('alergiaMedicamentoDetalle')} required /> : null}
        <Field label="Medicación anterior — nombre" value={get('medicacionAnteriorNombre')} onChange={set('medicacionAnteriorNombre')} /><Field label="Dosis" value={get('medicacionAnteriorDosis')} onChange={set('medicacionAnteriorDosis')} />
        <ChoiceGroup label="Medicación actual" value={get('medicacionActual')} onChange={set('medicacionActual')} options={yesNo} />
        {get('medicacionActual') === 'Sí' ? <><Field label="Nombre" value={get('medicacionActualNombre')} onChange={set('medicacionActualNombre')} /><Field label="Dosis actual" value={get('medicacionActualDosis')} onChange={set('medicacionActualDosis')} /><Field label="¿Por qué?" value={get('medicacionActualMotivo')} onChange={set('medicacionActualMotivo')} /></> : null}
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Actos quirúrgicos y anestesia" subtitle="Cirugías previas, hemorragias, cicatrización y exodoncias" status={blockStatus(values, ['cirugiaAnestesiaTotal','exodoncias','problemasAnestesicoOdontologico'])}>
      <div className="undac-form-grid">
        <ChoiceGroup label="¿Ha sido intervenido quirúrgicamente con anestesia total?" value={get('cirugiaAnestesiaTotal')} onChange={set('cirugiaAnestesiaTotal')} options={yesNo} className="undac-col-2" />
        {get('cirugiaAnestesiaTotal') === 'Sí' ? <><Field label="Tipo de intervención quirúrgica" value={get('tipoIntervencion')} onChange={set('tipoIntervencion')} className="undac-col-2" /><ChoiceGroup label="Reacción de la anestesia total" value={get('reaccionAnestesia')} onChange={set('reaccionAnestesia')} options={['Normal','Con complicaciones']} />{get('reaccionAnestesia') === 'Con complicaciones' ? <Field label="Si fue con complicaciones, explique" value={get('reaccionAnestesiaDetalle')} onChange={set('reaccionAnestesiaDetalle')} /> : null}<ChoiceGroup label="Hemorragias a causa de la intervención" value={get('hemorragiaIntervencion')} onChange={set('hemorragiaIntervencion')} options={yesNo} />{get('hemorragiaIntervencion') === 'Sí' ? <Field label="De ser sí, ¿cuántos días?" value={get('hemorragiaDias')} onChange={set('hemorragiaDias')} /> : null}<SelectField label="Proceso de cicatrización" value={get('cicatrizacion')} onChange={set('cicatrizacion')} options={['Normal','Demoró','Se complicó','Otros']} />{get('cicatrizacion') === 'Otros' ? <Field label="Cicatrización — otros" value={get('cicatrizacionOtros')} onChange={set('cicatrizacionOtros')} /> : null}</> : null}
        <ChoiceGroup label="¿Le han realizado exodoncias?" value={get('exodoncias')} onChange={set('exodoncias')} options={yesNo} /><ChoiceGroup label="¿Problemas con el anestésico odontológico?" value={get('problemasAnestesicoOdontologico')} onChange={set('problemasAnestesicoOdontologico')} options={yesNo} />
        <ChoiceGroup label="¿Hemorragias post exodoncias?" value={get('hemorragiasPostExodoncia')} onChange={set('hemorragiasPostExodoncia')} options={yesNo} />{get('hemorragiasPostExodoncia') === 'Sí' ? <Field label="¿Por cuántos días?" value={get('hemorragiasPostExodonciaDias')} onChange={set('hemorragiasPostExodonciaDias')} /> : null}
        {get('exodoncias') === 'Sí' ? <ChoiceGroup label="Las exodoncias fueron realizadas por" value={get('exodonciaRealizadaPor')} onChange={set('exodonciaRealizadaPor')} options={['Odontólogo','Técnico']} className="undac-col-2" /> : null}
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Antecedentes familiares" subtitle="Padres, hermanos y otros antecedentes familiares" status={blockStatus(values, ['padreEstado','madreEstado','hermanosNumero'])}>
      <div className="undac-form-grid">
        <SelectField label="Padre" value={get('padreEstado')} onChange={set('padreEstado')} options={['Vive','Fallecido','Otros']} />{get('padreEstado') === 'Otros' ? <Field label="Padre — otros" value={get('padreEstadoOtros')} onChange={set('padreEstadoOtros')} /> : null}
        <SelectField label="Madre" value={get('madreEstado')} onChange={set('madreEstado')} options={['Vive','Fallecido','Otros']} />{get('madreEstado') === 'Otros' ? <Field label="Madre — otros" value={get('madreEstadoOtros')} onChange={set('madreEstadoOtros')} /> : null}
        <Field label="Hermanos — número" type="number" min="0" value={get('hermanosNumero')} onChange={set('hermanosNumero')} /><Field label="Hermanos vivos" type="number" min="0" value={get('hermanosVivos')} onChange={set('hermanosVivos')} />
        <Field label="Hermanos fallecidos" type="number" min="0" value={get('hermanosFallecidos')} onChange={set('hermanosFallecidos')} /><Field label="Otros" value={get('hermanosOtros')} onChange={set('hermanosOtros')} />
      </div>
    </CollapsibleSection>
  </div>;
}
