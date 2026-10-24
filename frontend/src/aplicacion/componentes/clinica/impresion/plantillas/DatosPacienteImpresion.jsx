import React from 'react';
import DocumentoSeccion from '../DocumentoSeccion.jsx';
import { Bloque, Campo, GrupoOpciones, Texto } from '../primitivas.jsx';

const SEXO = [
  { valor: 'M', etiqueta: 'Masculino (M)' },
  { valor: 'F', etiqueta: 'Femenino (F)' },
];

export default function DatosPacienteImpresion({ values = {}, datos }) {
  const valor = (clave, respaldo = '') => values[clave] ?? respaldo;
  const acompanado = valor('modalidadAsistencia', 'acompanado') === 'acompanado';
  return <DocumentoSeccion titulo="Datos del paciente y filiación" datos={datos}>
    <Bloque titulo="Datos del asistente">
      <div className="doc-grid doc-grid--3">
        <Campo etiqueta="Apellidos y nombres del asistente" valor={datos.operador.nombre} amplio />
        <Campo etiqueta="DNI del asistente" valor={values.personal?.dni} />
        <Campo etiqueta="C.O.P." valor={datos.operador.cop} />
        <Campo etiqueta="Semestre" valor={datos.operador.semestre} />
        <Campo etiqueta="Año académico" valor={datos.operador.anioAcademico} />
        <Campo etiqueta="Fecha de registro" valor={datos.operador.fechaRegistro} />
        <Campo etiqueta="Profesional encargado" valor={datos.operador.docente} amplio />
      </div>
    </Bloque>

    <Bloque titulo="Identificación del paciente">
      <div className="doc-grid doc-grid--3">
        <Campo etiqueta="DNI" valor={valor('dni')} />
        <Campo etiqueta="Fecha y hora de registro" valor={datos.paciente.fechaRegistro} />
        <GrupoOpciones etiqueta="Sexo" valor={valor('sexo')} opciones={SEXO} />
      </div>
      <div className="doc-grid doc-grid--2">
        <Campo etiqueta="Apellidos completos" valor={valor('apellidos')} />
        <Campo etiqueta="Nombres completos" valor={valor('nombres')} />
        <Campo etiqueta="Fecha de nacimiento" valor={datos.paciente.fechaNacimiento} />
        <Campo etiqueta="Edad actual" valor={datos.paciente.edad ? `${datos.paciente.edad} años` : ''} />
        <Campo etiqueta="Lugar de nacimiento" valor={valor('lugarNacimiento')} amplio />
      </div>
    </Bloque>

    <Bloque titulo="Datos personales y contacto">
      <div className="doc-grid doc-grid--3">
        <Campo etiqueta="Teléfono celular" valor={valor('celular')} />
        <Campo etiqueta="Correo electrónico" valor={valor('correo')} />
        <Campo etiqueta="Grado de instrucción" valor={valor('gradoInstruccion')} />
        <Campo etiqueta="Estado civil" valor={valor('estadoCivil')} />
        <Campo etiqueta="Ocupación" valor={valor('ocupacion')} />
        <Campo etiqueta="Centro de estudios" valor={valor('centroEstudios')} />
        <Campo etiqueta="Idioma materno" valor={valor('idioma')} />
        <Campo etiqueta="Religión o culto" valor={valor('religion')} />
        <Campo etiqueta="Lugar de trabajo" valor={valor('lugarTrabajo')} />
        <Campo etiqueta="Otro domicilio" valor={valor('domicilioRegistro2')} />
        <Campo etiqueta="Teléfono adicional" valor={valor('telefonoRegistro2')} />
      </div>
    </Bloque>

    <Bloque titulo="Ubicación y residencia">
      <div className="doc-grid doc-grid--3">
        <Campo etiqueta="Departamento" valor={valor('departamento')} />
        <Campo etiqueta="Provincia" valor={valor('provincia')} />
        <Campo etiqueta="Distrito" valor={valor('distrito')} />
      </div>
      <div className="doc-grid doc-grid--3">
        <Campo etiqueta="Dirección de domicilio actual" valor={valor('domicilio')} amplio />
        <Campo etiqueta="Tiempo de residencia en Cerro de Pasco" valor={valor('tiempoResidencia')} />
        <Campo etiqueta="Procedencia" valor={valor('procedencia')} />
      </div>
    </Bloque>

    <Bloque titulo="Acompañante, informante o tutor">
      <GrupoOpciones
        etiqueta="Modalidad de asistencia"
        valor={valor('modalidadAsistencia', 'acompanado')}
        opciones={[
          { valor: 'acompanado', etiqueta: 'Con acompañante o tutor' },
          { valor: 'solo', etiqueta: 'Paciente autovalente' },
        ]}
      />
      {acompanado ? <div className="doc-grid doc-grid--3">
        <Campo etiqueta="Nombre del informante" valor={valor('informante')} />
        <Campo etiqueta="Persona que lo acompaña" valor={valor('acompanante')} />
        <Campo etiqueta="Condición o parentesco" valor={valor('tutorParentesco')} />
        <Campo etiqueta="DNI del acompañante" valor={valor('acompananteDni')} />
        <Campo etiqueta="Teléfono de emergencia" valor={valor('tutorCelular')} />
        <Campo etiqueta="Confiabilidad de la información" valor={valor('confiabilidad')} />
        <Campo etiqueta="Dirección del informante" valor={valor('informanteDireccion')} amplio />
      </div> : <Texto etiqueta="Observación" valor="El paciente brinda su propia información." lineas={1} />}
    </Bloque>

    <Bloque titulo="Filiación parental">
      <div className="doc-grid doc-grid--2">
        <div className="doc-subbloque">
          <h4>Padre</h4>
          <Campo etiqueta="Apellidos y nombres" valor={valor('padre')} />
          <div className="doc-grid doc-grid--2">
            <Campo etiqueta="DNI" valor={valor('padreDni')} />
            <Campo etiqueta="Celular" valor={valor('padreCelular')} />
          </div>
          <Campo etiqueta="Ocupación" valor={valor('padreOcupacion')} />
        </div>
        <div className="doc-subbloque">
          <h4>Madre</h4>
          <Campo etiqueta="Apellidos y nombres" valor={valor('madre')} />
          <div className="doc-grid doc-grid--2">
            <Campo etiqueta="DNI" valor={valor('madreDni')} />
            <Campo etiqueta="Celular" valor={valor('madreCelular')} />
          </div>
          <Campo etiqueta="Ocupación" valor={valor('madreOcupacion')} />
        </div>
      </div>
    </Bloque>
  </DocumentoSeccion>;
}
