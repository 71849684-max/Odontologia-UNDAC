import React, { useEffect } from 'react';
import { UserRound, ContactRound, MapPin, Mail, UsersRound, Info } from 'lucide-react';
import { SectionCard, Field, SelectField, ChoiceGroup } from '../compartidos/ControlesClinicos.jsx';
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

const Titulo = ({ icon: Icon, children }) => <span className="hc-admission-title"><Icon size={18} aria-hidden="true" />{children}</span>;
const Grupo = ({ icon: Icon, children }) => <h4 className="hc-admission-group"><Icon size={15} aria-hidden="true" />{children}</h4>;

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

  return <div className="undac-section-stack hc-admission">
    <SectionCard title={<Titulo icon={UserRound}>Datos del operador clínico</Titulo>} subtitle="Estudiante u odontólogo a cargo de la atención odontológica." actions={values?.personal ? <span className="hc-admission-badge">Seleccionado</span> : null}>
      <BusquedaPersonal value={values?.personal} meta={meta} fecha={get('fechaPaciente', fechaRegistroActual())} onChange={(persona) => { onChange?.('personal', persona); onChange?.('operador', persona?.nombre || ''); }} />
    </SectionCard>
    <SectionCard title={<Titulo icon={ContactRound}>Datos personales y de identificación</Titulo>} subtitle="Complete los datos del paciente según su documento de identidad.">
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
      <Grupo icon={MapPin}>Ubicación y residencia</Grupo>
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
      <Grupo icon={Mail}>Contacto y aspectos sociodemográficos</Grupo>
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
    </SectionCard>
    <SectionCard title={<Titulo icon={UsersRound}>Acompañante, informante o tutor</Titulo>} subtitle="Datos de la persona que acompaña al paciente y contacto de emergencia." className="hc-companion-card">
      <ChoiceGroup label="Modalidad de asistencia a la consulta" className="hc-attendance" value={get('modalidadAsistencia', 'acompanado')} onChange={set('modalidadAsistencia')} options={[{ value: 'acompanado', label: 'Con acompañante / tutor' }, { value: 'solo', label: 'Solo (paciente autovalente)' }]} />
      {conAcompanante ? <div className="hc-patient-grid hc-admission-row">
        {campo('Nombre completo del informante', 'informante')}
        {campo('Persona que lo acompaña', 'acompanante')}
        <SelectField label="Condición / parentesco" value={get('tutorParentesco')} onChange={set('tutorParentesco')} options={[...new Set(['Madre','Padre','Tutor','Cónyuge','Hermano/a','Otro', get('tutorParentesco')].filter(Boolean))]} />
        {campo('DNI del acompañante', 'acompananteDni', { inputMode: 'numeric', maxLength: 8 })}
        {campo('Teléfono de emergencia', 'tutorCelular', { type: 'tel' })}
        <SelectField label="Confiabilidad de la información" value={get('confiabilidad')} onChange={set('confiabilidad')} options={['Confiable', 'Relativamente confiable', 'No confiable']} />
        {campo('Dirección del informante', 'informanteDireccion', { className: 'hc-span-full' })}
      </div> : <p className="hc-admission-note"><Info size={17} aria-hidden="true" />El paciente brinda su propia información. Los datos del acompañante se conservan si necesita cambiar la modalidad.</p>}
      <div className="hc-parental">
        <Grupo icon={UsersRound}>Filiación parental</Grupo>
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
      </div>
    </SectionCard>
  </div>;
}

