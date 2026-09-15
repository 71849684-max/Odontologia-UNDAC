import React, { useEffect } from 'react';
import { Info, ShieldCheck } from 'lucide-react';
import { CollapsibleSection, Field, SelectField, ChoiceGroup } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';
import BusquedaPersonal from './BusquedaPersonal.jsx';
import departamentos from './ubigeo/departamentos.json';
import provincias from './ubigeo/provincias.json';
import distritos from './ubigeo/distritos.json';
import './datos-paciente.css';

export function fechaRegistroActual() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
}

export function calcularEdad(fecha, referencia = fechaRegistroActual()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || fecha > referencia) return '';
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const nacimiento = new Date(anio, mes - 1, dia);
  if (nacimiento.getMonth() !== mes - 1 || nacimiento.getDate() !== dia) return '';
  const [actual, mesActual, diaActual] = referencia.split('-').map(Number);
  return actual - anio - (mesActual < mes || (mesActual === mes && diaActual < dia) ? 1 : 0);
}

function hasAny(values, keys) {
  return keys.some((key) => {
    const value = values?.[key];
    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== '';
  });
}

function status(values, keys) {
  return hasAny(values, keys) ? 'progress' : 'pending';
}

export default function DatosPacienteSection({ values, onChange, meta }) {
  const { get, set } = useSection(values, onChange);
  useEffect(() => {
    if (!values?.fechaPaciente) onChange?.('fechaPaciente', fechaRegistroActual());
  }, [values?.fechaPaciente, onChange]);

  const departamento = departamentos.find((item) => item.nombre_ubigeo === get('departamento'));
  const opcionesProvincias = provincias[departamento?.id_ubigeo] || [];
  const provincia = opcionesProvincias.find((item) => item.nombre_ubigeo === get('provincia'));
  const opcionesDistritos = distritos[provincia?.id_ubigeo] || [];
  const nombres = (items) => items.map((item) => item.nombre_ubigeo);
  const campo = (label, key, props = {}) => <Field label={label} value={get(key)} onChange={set(key)} {...props} />;
  const conAcompanante = get('modalidadAsistencia', 'acompanado') === 'acompanado';
  const operadorNombre = values?.personal?.nombre || get('operador') || meta?.operador || 'Sin asignar';

  return <div className="undac-section-stack hc-admission clinical-admission-flow">
    <CollapsibleSection
      title="Identificación del paciente"
      subtitle="Datos institucionales y de identidad"
      summary={`${get('dni') || 'DNI pendiente'} · ${[get('apellidos'), get('nombres')].filter(Boolean).join(', ') || 'Nombre pendiente'}`}
      defaultOpen
      status={hasAny(values, ['dni', 'nombres', 'apellidos']) ? 'progress' : 'pending'}
    >
      <div className="hc-patient-grid">
        {campo('DNI', 'dni', { inputMode: 'numeric', maxLength: 8 })}
        <Field label="Fecha de registro" type="date" value={get('fechaPaciente', fechaRegistroActual())} readOnly />
        <ChoiceGroup label="Sexo" value={get('sexo')} onChange={set('sexo')} options={[{ value: 'M', label: 'Masculino (M)' }, { value: 'F', label: 'Femenino (F)' }]} />
      </div>
      <div className="hc-patient-grid hc-patient-grid--two hc-admission-row">
        {campo('Apellidos completos (paterno y materno)', 'apellidos')}
        {campo('Nombres completos', 'nombres')}
      </div>
      <div className="hc-patient-grid hc-patient-grid--birth hc-admission-row">
        <Field label="Fecha de nacimiento" type="date" max={fechaRegistroActual()} value={get('fechaNacimiento')} onChange={(fecha) => { onChange?.('fechaNacimiento', fecha); onChange?.('edad', calcularEdad(fecha)); }} />
        <Field label="Edad actual" value={get('fechaNacimiento') ? calcularEdad(get('fechaNacimiento')) : get('edad')} readOnly placeholder="Años" />
        {campo('Lugar de nacimiento (ciudad / hospital)', 'lugarNacimiento')}
      </div>
    </CollapsibleSection>

    <CollapsibleSection
      title="Datos personales y contacto"
      subtitle="Contacto principal, ocupación e información básica"
      summary={[get('celular'), get('ocupacion')].filter(Boolean).join(' · ') || 'Sin información registrada'}
      defaultOpen
      status={status(values, ['celular', 'correo', 'ocupacion'])}
    >
      <div className="hc-patient-grid hc-patient-grid--four">
        {campo('Teléfono celular', 'celular', { type: 'tel' })}
        {campo('Correo electrónico', 'correo', { type: 'email' })}
        <SelectField label="Grado de instrucción" value={get('gradoInstruccion')} onChange={set('gradoInstruccion')} options={[...new Set(['Sin instrucción', 'Inicial', 'Primaria', 'Secundaria', 'Superior técnica', 'Superior universitaria', 'Posgrado', get('gradoInstruccion')].filter(Boolean))]} />
        <SelectField label="Estado civil" value={get('estadoCivil')} onChange={set('estadoCivil')} options={['Soltero','Casado','Divorciado','Viudo','Otros']} />
        {campo('Ocupación', 'ocupacion')}
        {campo('Centro de estudios', 'centroEstudios')}
        {campo('Idioma materno', 'idioma')}
        {campo('Religión o culto', 'religion')}
        {campo('Lugar de trabajo', 'lugarTrabajo', { className: 'hc-span-two' })}
        {campo('Otro domicilio', 'domicilioRegistro2')}
        {campo('Teléfono adicional', 'telefonoRegistro2', { type: 'tel' })}
      </div>
    </CollapsibleSection>

    <CollapsibleSection
      title="Ubicación y residencia"
      subtitle="Dirección y procedencia del paciente"
      summary={[get('distrito'), get('provincia'), get('departamento')].filter(Boolean).join(', ') || 'No registrado'}
      status={status(values, ['departamento', 'provincia', 'distrito', 'domicilio'])}
    >
      <div className="hc-patient-grid">
        <SelectField label="Departamento" value={get('departamento')} options={nombres(departamentos)} onChange={(value) => { onChange?.('departamento', value); onChange?.('provincia', ''); onChange?.('distrito', ''); }} />
        <SelectField label="Provincia" value={get('provincia')} options={nombres(opcionesProvincias)} disabled={!departamento} onChange={(value) => { onChange?.('provincia', value); onChange?.('distrito', ''); }} />
        <SelectField label="Distrito" value={get('distrito')} options={nombres(opcionesDistritos)} disabled={!provincia} onChange={set('distrito')} />
      </div>
      <div className="hc-patient-grid hc-patient-grid--residence hc-admission-row">
        {campo('Dirección de domicilio actual', 'domicilio')}
        {campo('Tiempo de residencia en Cerro de Pasco', 'tiempoResidencia')}
        {campo('Procedencia', 'procedencia')}
      </div>
    </CollapsibleSection>

    <CollapsibleSection
      title="Acompañante, informante o tutor"
      subtitle="Contacto de apoyo o emergencia"
      summary={conAcompanante ? (get('acompanante') || get('informante') || 'Datos por completar') : 'Paciente acude solo'}
      status={status(values, ['acompanante', 'informante', 'tutorCelular'])}
    >
      <ChoiceGroup label="Modalidad de asistencia a la consulta" className="hc-attendance" value={get('modalidadAsistencia', 'acompanado')} onChange={set('modalidadAsistencia')} options={[{ value: 'acompanado', label: 'Con acompañante / tutor' }, { value: 'solo', label: 'Solo (paciente autovalente)' }]} />
      {conAcompanante ? <div className="hc-patient-grid hc-admission-row">
        {campo('Nombre completo del informante', 'informante')}
        {campo('Persona que lo acompaña', 'acompanante')}
        <SelectField label="Condición / parentesco" value={get('tutorParentesco')} onChange={set('tutorParentesco')} options={[...new Set(['Madre','Padre','Tutor','Cónyuge','Hermano/a','Otro', get('tutorParentesco')].filter(Boolean))]} />
        {campo('DNI del acompañante', 'acompananteDni', { inputMode: 'numeric', maxLength: 8 })}
        {campo('Teléfono de emergencia', 'tutorCelular', { type: 'tel' })}
        <SelectField label="Confiabilidad de la información" value={get('confiabilidad')} onChange={set('confiabilidad')} options={['Confiable', 'Relativamente confiable', 'No confiable']} />
        {campo('Dirección del informante', 'informanteDireccion', { className: 'hc-span-full' })}
      </div> : <p className="hc-admission-note"><Info size={17} aria-hidden="true" />El paciente brinda su propia información. Los datos previos del acompañante se conservan si necesita cambiar la modalidad.</p>}
    </CollapsibleSection>

    <CollapsibleSection
      title="Filiación parental"
      subtitle="Información de padre y madre cuando corresponda"
      summary={[get('padre'), get('madre')].filter(Boolean).join(' · ') || 'No registrado'}
      status={status(values, ['padre', 'madre'])}
    >
      <div className="hc-patient-grid hc-patient-grid--two">
        {['padre', 'madre'].map((parentesco) => <section className="hc-parental-person" key={parentesco}>
          <h5>Datos {parentesco === 'padre' ? 'del padre' : 'de la madre'}</h5>
          {campo(`Nombre ${parentesco === 'padre' ? 'del padre' : 'de la madre'}`, parentesco)}
          <div className="hc-patient-grid hc-patient-grid--two hc-admission-row">
            {campo(`DNI ${parentesco === 'padre' ? 'del padre' : 'de la madre'}`, `${parentesco}Dni`, { inputMode: 'numeric', maxLength: 8 })}
            {campo(`Celular ${parentesco === 'padre' ? 'del padre' : 'de la madre'}`, `${parentesco}Celular`, { type: 'tel' })}
          </div>
          <div className="hc-admission-row">{campo(`Ocupación ${parentesco === 'padre' ? 'del padre' : 'de la madre'}`, `${parentesco}Ocupacion`)}</div>
        </section>)}
      </div>
    </CollapsibleSection>

    <section className="clinical-operator-card">
      <span className="clinical-operator-card__icon"><ShieldCheck size={22} aria-hidden="true" /></span>
      <div className="clinical-operator-card__copy"><span>Operador responsable</span><strong>{operadorNombre}</strong><small>Semestre {meta?.semestre || '—'} · Año académico {meta?.anioAcademico || '—'} · asignación de la atención actual</small></div>
      <details className="clinical-operator-card__change"><summary>Cambiar asignación</summary><div><BusquedaPersonal value={values?.personal} meta={meta} fecha={get('fechaPaciente', fechaRegistroActual())} onChange={(persona) => { onChange?.('personal', persona); onChange?.('operador', persona?.nombre || ''); }} /></div></details>
    </section>
  </div>;
}
