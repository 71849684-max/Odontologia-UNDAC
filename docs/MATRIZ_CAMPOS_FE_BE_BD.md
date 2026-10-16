# Matriz de campos: frontend → backend → base de datos

Regla: **el frontend manda**. Cada clave que un formulario escribe en `formData[seccion]` debe guardarse en la base de datos y volver con la misma clave al recargar el expediente (`GET /api/historias/{id}/expediente`). Si el backend usaba otro nombre, acepta ambos y devuelve el del frontend.

La prueba [`ContratoExpedienteTest`](../backend/tests/Feature/ContratoExpedienteTest.php) envía todas las claves de cada sección y falla si alguna no vuelve. Al añadir un campo al frontend, se añade también a esa prueba.

Los cambios de esquema están en [`backend/database/parches/`](../backend/database/parches) y se aplican con `php artisan clinica:parches` (añadir `--bd=bd_clinica_undac_test` para la base de pruebas).

Estado inicial: **OK** funcionaba; **CLAVE** el backend leía otro nombre; **NO_GUARDA** no se persistía; **NO_LEE** se guardaba pero no se devolvía; **SIN_COLUMNA** no existía columna; **ARCHIVO** solo vivía en el navegador.

Métodos: `ServicioPacientes` ([ServicioPacientes.php](../backend/app/Clinica/Pacientes/ServicioPacientes.php)) para la ficha del paciente; el resto en `ServicioExpediente` ([ServicioExpediente.php](../backend/app/Clinica/Expediente/ServicioExpediente.php)).

## Datos del paciente (`datos-paciente`)

| Clave frontend | Tabla.columna | Estado inicial |
|---|---|---|
| `dni` | `paciente.numero_documento` | OK |
| `fechaPaciente` | `historia_clinica.fecha_apertura` (solo lectura) | NO_LEE |
| `sexo` | `paciente.sexo` | OK |
| `apellidos`, `nombres` | `paciente.apellidos`, `paciente.nombres` (VARCHAR 180) | OK |
| `fechaNacimiento` | `paciente.fecha_nacimiento` | OK |
| `edad` | calculada desde `fecha_nacimiento` | calculado |
| `lugarNacimiento` | `paciente.lugar_nacimiento` | NO_LEE |
| `celular`, `correo` | `paciente.telefono`, `paciente.correo` | OK |
| `gradoInstruccion`, `estadoCivil`, `ocupacion` | `paciente.grado_instruccion`, `.estado_civil`, `.ocupacion` | OK |
| `centroEstudios`, `religion`, `lugarTrabajo` | `paciente.centro_estudios`, `.religion`, `.lugar_trabajo` | NO_LEE |
| `idioma` | `paciente.idioma_materno` | CLAVE (`idiomaMaterno`) |
| `domicilioRegistro2` | `paciente.direccion_alternativa` | CLAVE (`direccionAlternativa`) |
| `telefonoRegistro2` | `paciente.telefono_adicional` | CLAVE (`telefonoAdicional`) |
| `departamento`, `provincia`, `distrito`, `domicilio` | `paciente.departamento`, `.provincia`, `.distrito`, `.direccion` | OK |
| `tiempoResidencia`, `procedencia` | `paciente.tiempo_residencia`, `.procedencia` | NO_LEE |
| `modalidadAsistencia` | `paciente.modalidad_asistencia` | OK |
| `informante` | `paciente_contacto.informante` | SIN_COLUMNA |
| `acompanante`, `tutorParentesco`, `confiabilidad` | `paciente_contacto.nombre`, `.parentesco`, `.confiabilidad` | OK |
| `acompananteDni` | `paciente_contacto.numero_documento` | CLAVE (`tutorDocumento`) |
| `tutorCelular` | `paciente_contacto.telefono` | CLAVE (`tutorTelefono`) |
| `informanteDireccion` | `paciente_contacto.direccion` | CLAVE (`tutorDireccion`) |
| `padre`, `padreDni`, `padreCelular`, `padreOcupacion` | `paciente_familiar` (PADRE): `nombre`, `numero_documento`, `telefono`, `ocupacion` | SIN_COLUMNA |
| `madre`, `madreDni`, `madreCelular`, `madreOcupacion` | `paciente_familiar` (MADRE) | SIN_COLUMNA |
| `operador`, `personal` | `historia_alumno` / `historia_docente` vía `PUT /historias/{id}/asignacion` | NO_GUARDA |

## Anamnesis, cuestionario de salud y antecedentes

Todas las claves estaban alineadas (`anamnesis`, `anamnesis_estado_psicologico`, `respuesta_salud`, `antecedente_*`). Único ajuste: `estadoPsicologico` se devuelve en el orden en que se registró.

## Examen clínico general (`examen-clinico`)

Las 43 claves se guardan en `examen_clinico_general` con el mismo nombre en snake_case. Los signos vitales numéricos son DECIMAL; el IMC se calcula en el frontend y no se guarda.

## Examen extraoral e intraoral

| Clave frontend | Tabla.columna | Estado inicial |
|---|---|---|
| Claves escalares (`tipoFacial`, `tissue{N}Status`, `tissue{N}Detail`, ...) | `examen_estomatologico` (EXTRAORAL / INTRAORAL), una fila por clave | OK |
| `fotosExtraorales`, `fotosIntraorales` | `archivo_clinico` (`seccion`, `clave_campo`) | ARCHIVO |

## Oclusión (`oclusion`)

| Clave frontend | Tabla.columna | Estado inicial |
|---|---|---|
| `oclusionPosterior`, `oclusionAnterior` | `examen_oclusion.clasificacion_posterior`, `.clasificacion_anterior` | OK |
| `ultimaExodoncia` | `examen_oclusion.ultima_exodoncia` | CLAVE (se guardaba en `observaciones`) |
| `motivosPerdida` | `examen_oclusion.motivos_perdida` | CLAVE (se guardaba en `mordida`) |
| `motivosPerdidaOtros` | `examen_oclusion.motivos_perdida_otros` | SIN_COLUMNA |
| `protesisTipos`, `protesisProfesional` | `protesis.tipo_protesis`, `.confeccionada_por` | OK |
| `protesisOtros` (campo nuevo del frontend) | `protesis.observaciones` de la fila "Otros" | no existía |
| `diagnosticoPresuntivoOclusion` | `examen_oclusion.diagnostico_presuntivo` | OK |

## Exámenes auxiliares (`examenes-auxiliares`)

| Clave frontend | Tabla.columna | Estado inicial |
|---|---|---|
| `hemoglobina`, `hematocrito`, `tiempoCoagulacion`, `tiempoSangria`, `grupoSanguineo`, `factorRh`, `glucosa`, `otros` | `examen_auxiliar` (`tipo_examen='LABORATORIO'`, `nombre_examen`=clave, `resultado`) | NO_GUARDA |
| `diagnosticoLaboratorio`, `rxPanoramico`, `rxOclusales`, `rxPeriapicales` | `examen_auxiliar.resultado` | OK |
| `resultadosLaboratorio`, `radiografias` | `archivo_clinico` + `examen_auxiliar.id_archivo` | ARCHIVO |

## Diagnóstico, modelos y plan de tratamiento

| Clave frontend | Tabla.columna | Estado inicial |
|---|---|---|
| `diagnosticos[]` (`codigo`, `tipo`, `piezaRegion`, `severidad`, `evidencia`, `observaciones`) | `diagnostico` | OK |
| `dxClinicoRadiografico`, `dxPresuntivo`, `dxDefinitivo` | `diagnostico.descripcion` por tipo | OK |
| `pronosticoEstructurado`, `pronosticoJustificacion` | `pronostico_clinico.pronostico`, `.justificacion` | OK |
| `pronostico` (texto libre) | `pronostico_clinico.pronostico_libre` | NO_LEE (se truncaba a 20) |
| `informeMaxilar`, `informeMandibula` | `estudio_modelo.informe_maxilar`, `.informe_mandibula` | OK |
| `planificacionModelos` | `estudio_modelo.planificacion` | CLAVE (`planificacion`) |
| `fotosModelos` | `archivo_clinico` | ARCHIVO |
| `planIntegral`, `procedimientosPlan[]` | `plan_tratamiento`, `fase_tratamiento`, `plan_tratamiento_item` | OK |

## Consentimiento informado (`consentimiento`)

| Clave frontend | Tabla.columna | Estado inicial |
|---|---|---|
| `fecha`, `intervencionAutorizada` | `consentimiento_informado.fecha_consentimiento`, `.intervencion_autorizada` | OK |
| `consent1` … `consent9` | `consentimiento_clausula.aceptada` (texto real de la cláusula en `.texto`) | OK |
| `domicilio`, `doctor` | `consentimiento_informado.domicilio_acto`, `.doctor_informante` | NO_GUARDA |
| `firmaDia`, `firmaMes`, `firmaAnio` | `consentimiento_informado.firma_dia`, `.firma_mes`, `.firma_anio` | NO_GUARDA |
| `acompananteNombres`, `acompananteDireccion`, `acompananteParentesco`, `acompananteDni` | `firma_consentimiento` (ACOMPANANTE) | NO_GUARDA |
| `firmaPaciente`, `huellaDactilar`, `firmaAcompanante`, `firmaDocente` | `archivo_clinico` + `firma_consentimiento.id_archivo` | ARCHIVO |
| `programacionFecha`, `programacionHora`, `programacionObservaciones` | `programacion_cirugia` | NO_GUARDA |

## Cirugía, reporte operatorio y seguimiento

| Clave frontend | Tabla.columna | Estado inicial |
|---|---|---|
| `preoperatorio`, `intraoperatorio`, `postoperatorio` | `etapa_quirurgica.descripcion` | OK |
| `asistente`, `lugar`, `casoClinico`, `tipoAnestesia`, `tecnicaAnestesia`, `tipoTratamiento`, `horaInicio`, `horaTermino` | `reporte_operatorio` | OK |
| `{pre,intra,post}_{pa,temp,fr,fc,pulso}` | `signo_vital_operatorio` | OK |
| `prescripcionPost`, `alta`, `epicrisis` | `prescripcion.resumen`, `alta_clinica.indicaciones`, `epicrisis.resumen_clinico` | OK |
| `fecha` | `reporte_operatorio.fecha` | NO_LEE |
| `diagnosticoDefinitivo` | `epicrisis.diagnostico` | NO_LEE |
| `pronostico` | `reporte_operatorio.pronostico` | SIN_COLUMNA |
| `firmaDocenteReporte`, `firmaAlumnoReporte` | `archivo_clinico` + `reporte_operatorio.id_archivo_firma_docente` / `_alumno` | ARCHIVO |
| `fecha`, `evolucion` (seguimiento) | `evolucion_clinica` | OK |
| `procedimientos[]` (`fecha`, `procedimiento`, `evolucion`) | `seguimiento_quirurgico` | OK |
| `procedimientos[].firmaOperador`, `.firmaSupervisor` | `firma_seguimiento` (OPERADOR / SUPERVISOR) | NO_GUARDA |

## Odontograma

El registro completo (`version`, `examinations[]` con piezas, superficies, hallazgos y rangos) se guarda en `odontograma.registro_json` y se normaliza en `odontograma_pieza`, `odontograma_superficie`, `odontograma_hallazgo` y `odontograma_hallazgo_pieza`. Antes el frontend nunca lo leía del servidor (solo `localStorage`) y el JSON ocupaba la columna clínica `especificaciones`.

## Formularios fuera de la historia clínica

| Formulario | Clave frontend | Destino | Estado inicial |
|---|---|---|---|
| Registro de paciente | todas | `POST/PUT /pacientes` → `paciente` | OK (`nombres` VARCHAR 100 → 180) |
| Perfil | `nombres`, `apellidos`, `correo`, `telefono` | `PUT /perfil` → `alumno` / `docente` | solo `localStorage` |
| Perfil | contraseña actual / nueva | `PUT /auth/clave` → `usuario_*.contrasena_hash` | no existía |
| Permisos de usuario | `permisos[]` | `usuario_alumno_submodulo` / `usuario_docente_submodulo` | modificaba el rol completo |
| Acceso | `nombre_usuario` | validación `max:120` igual que la columna | `max:80` |
