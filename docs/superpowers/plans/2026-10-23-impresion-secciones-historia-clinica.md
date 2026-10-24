# Impresión de secciones de la historia clínica — Plan de implementación

**Fecha:** 23 de octubre de 2026
**Objetivo:** que cada sección de la historia clínica tenga una vista imprimible que reproduzca el formato institucional de `HISTORIA CLINICA PARA SOFTWARE ULTIMO.docx`, completada con los datos del paciente seleccionado, del operador y de la sección activa, sin imprimir los controles del formulario.

**Referencia del formato:** `C:\Users\Windows\Downloads\FREELANCE\SISTEMA ODONTOLOGICO\DOCUMENTOS\HISTORIA CLINICA PARA SOFTWARE  ULTIMO.docx`

## 1. Diagnóstico del estado actual

- `ClinicalWorkspace.jsx` ya tiene un botón **Imprimir** en el encabezado de la sección, pero ejecuta `window.print()` directamente. Lo que se imprime es la pantalla del formulario, no un documento.
- `workspace.css` sólo oculta la barra lateral, las acciones y algunos controles dentro de `@media print`. No hay una hoja A4, ni encabezado institucional, ni plantillas por sección.
- La historia clínica tiene 17 secciones registradas en `historiaClinica.config.mjs`; el documento Word agrupa el contenido en 19 bloques. La correspondencia no es 1:1 y hay que explicitarla.
- El contexto (`HistoriaClinicaContext.jsx`) ya reúne todo lo necesario: `patient`, `history`, `meta`, `formData` y `sectionStatuses`. Los datos del paciente seleccionado están resueltos en `selectedPatient` y en el seed de `datos-paciente`.
- El backend guarda la historia por secciones y expone `GET /api/historias/{id}/expediente`; no existe todavía una ruta de PDF ni una librería de generación (`composer.json` no tiene dompdf ni snappy).
- El catálogo de permisos del frontend no tiene una acción de impresión o exportación. En la base de referencia sí existe el submódulo `EXPORTAR_PDF`, pero no está conectado a ninguna ruta.
- No hay logotipo institucional en `frontend/public/` ni en `frontend/src/`. La interfaz no debe mostrar UNDAC, así que el encabezado se resolverá con texto neutro y, si se entrega un logotipo, con un asset posterior.

## 2. Qué pide el formato y qué falta

El Word contiene, en este orden:

1. Datos del operador (apellidos, semestre, año académico, fecha, docente, C.O.P.).
2. Datos personales del paciente, anamnesis (DNI y fecha) y filiación completa.
3. Enfermedad actual y datos psicológicos.
4. Cuestionario de salud (24 preguntas con Sí/No y detalle).
5. Antecedentes personales, fisiológicos, terapéuticos, actos quirúrgicos y familiares.
6. Examen clínico general.
7. Examen estomatológico extraoral + fotografías extraorales.
8. Examen estomatológico intraoral + fotografías intraorales.
9. Oclusión, pérdida dentaria, prótesis y diagnóstico presuntivo.
10. Exámenes auxiliares: laboratorio, resultados adjuntos, informes radiográficos y radiografías.
11. Diagnóstico clínico-radiográfico, presuntivo, definitivo y pronóstico.
12. Estudio de modelos + fotografías.
13. Plan de tratamiento integral por fases.
14. Plan de tratamiento quirúrgico (pre, intra y postoperatorio).
15. Consentimiento informado, firmas, huella, acompañante y programación.
16. Reporte operatorio con control de signos vitales y firmas.
17. Seguimiento quirúrgico y ficha de seguimiento de procedimientos.

El Word **no incluye una hoja de odontograma**. Para esa sección se usará el formato de la NTS 188 ya implementado en `docs/odontograma-nts188.md`, con la misma cabecera neutra.

### Brechas de datos detectadas

| Dato del formato | Estado | Propuesta |
| --- | --- | --- |
| Semestre y año académico del operador | No está en la historia ni en el endpoint | Se imprime vacío con línea para completar. Si se necesita automático, ampliar `historia` con el grupo/periodo en una fase posterior. |
| C.O.P. del docente | No existe en la base ni en la API | Se imprime vacío con línea. Requiere columna nueva en `docente`. |
| Texto de las cláusulas del consentimiento | El frontend sólo guarda los booleanos `consent1..9`; el backend guarda "Cláusula N" si no recibe `textosClausulas` | La plantilla usa `consentParagraphs` como texto vigente y muestra el estado aceptado. Añadir `textosClausulas` al payload para versionar el texto exacto. |
| Domicilio del consentimiento | Campo propio de la sección, separado de Filiación | Se imprime el valor guardado; si está vacío se deja línea, sin inventar el domicilio del paciente. |
| Odontograma vigente | El componente lo guarda en `localStorage` y en el endpoint propio; no pasa por `formData` | La plantilla lee el registro más reciente de `localStorage` y lo compara con `formData.odontograma.registro` por `savedAt`. |
| Logotipo institucional | No existe asset y la interfaz no debe mostrar UNDAC | Encabezado tipográfico neutro; el texto exacto queda pendiente de confirmación. |

## 3. Decisión de arquitectura

### Recomendación: plantillas de impresión en el frontend, con `window.print()`

Ventajas:

- No agrega dependencias ni rutas de backend.
- Usa el estado actual de la historia, incluidos los cambios que todavía no terminaron de autoguardarse.
- Permite una vista previa real antes de imprimir.
- El navegador ya puede guardar como PDF, que cubre la necesidad inmediata de archivo.

Límites que hay que asumir:

- El navegador decide los márgenes finales y puede añadir su propio encabezado y pie si el usuario no los desactiva.
- No se puede garantizar "Página X de Y" sin paginación en JavaScript o sin PDF del servidor.
- La impresión no queda auditada por sí sola.

### Alternativa posterior: PDF en el backend

Si la facultad exige un archivo oficial, numerado y almacenable, se añade en una fase separada:

- `barryvdh/laravel-dompdf` en `backend/composer.json`.
- `ServicioImpresionHistoria` que reutiliza `ServicioExpediente::obtener`.
- Vistas Blade en `backend/resources/views/clinica/impresion/`.
- Ruta `GET /api/historias/{id}/impresion/{seccion}` con `acceso:EXPORTAR_PDF`.
- Registro de auditoría `IMPRIMIR` con el `ContextoOperacion`.

No conviene empezar por aquí: duplica el trabajo de layout y retrasa la entrega visible. Las plantillas del frontend sirven como contrato visual para esa segunda etapa.

## 3.1. Regla de vocabulario

Toda la interfaz del frontend, incluida la impresión, usa este vocabulario:

| Término actual | Término visible nuevo |
| --- | --- |
| Docente / docentes | Profesional encargado / profesionales encargados |
| Alumno / alumnos | Asistente / asistentes |
| Alumno operador | Asistente |
| Supervisión docente | Supervisión del profesional encargado |

Reglas:

- El cambio es sólo de texto visible. Los identificadores internos (`rol === 'docente'`, `rol === 'alumno'`, códigos `DOCENTE`, `ALUMNO_OPERADOR`, claves de formulario y rutas) se conservan para no romper la sesión, los permisos ni la API.
- Las clases CSS `undac-*`, las variables `--undac-*` y las claves de `localStorage` no se renombran.
- UNDAC no aparece en títulos, login, sidebar, mensajes ni encabezados de impresión.
- Las etiquetas se centralizan en un archivo de configuración para evitar textos sueltos.
- Los sinónimos “cirujano dentista”, “cirujano dentista supervisor” y “supervisor clínico” se unifican como “profesional encargado” en el módulo clínico, salvo que se indique lo contrario.

## 4. Arquitectura propuesta

```
frontend/src/aplicacion/componentes/clinica/impresion/
├── VistaPreviaImpresion.jsx        modal, portal, precarga y disparo de impresión
├── HojaImpresion.jsx               hoja A4 con cabecera y pie
├── EncabezadoInstitucional.jsx     título del documento, servicio y código de HC, sin UNDAC
├── IdentificacionPaciente.jsx      banda de paciente en todas las hojas
├── PieDocumento.jsx                fecha de generación, operador, docente
├── primitivas.jsx                  Campo, Linea, Opcion, Tabla, Texto, Firma, Galeria
├── documentoClinico.mjs            adaptadores, formateadores y registro de plantillas
├── documentoClinico.test.mjs
└── plantillas/
    ├── DatosPacienteImpresion.jsx
    ├── AnamnesisImpresion.jsx
    ├── CuestionarioSaludImpresion.jsx
    ├── AntecedentesImpresion.jsx
    ├── ExamenClinicoImpresion.jsx
    ├── ExamenExtraoralImpresion.jsx
    ├── ExamenIntraoralImpresion.jsx
    ├── OdontogramaImpresion.jsx
    ├── OclusionImpresion.jsx
    ├── ExamenesAuxiliaresImpresion.jsx
    ├── DiagnosticoImpresion.jsx
    ├── ModelosImpresion.jsx
    ├── PlanTratamientoImpresion.jsx
    ├── ConsentimientoImpresion.jsx
    ├── CirugiaImpresion.jsx
    ├── ReporteOperatorioImpresion.jsx
    └── SeguimientoImpresion.jsx
```

CSS nuevo: `frontend/src/css/aplicacion/clinica/impresion.css`, importado desde `frontend/src/css/app.css`.

### Flujo de uso

1. El usuario pulsa **Imprimir** en el encabezado de la sección activa.
2. Se abre `VistaPreviaImpresion` en un portal sobre `document.body`, con la hoja A4 renderizada.
3. La vista previa muestra el documento completo de esa sección y dos acciones: **Imprimir documento** y **Cerrar**.
4. **Imprimir documento** espera la precarga de imágenes y llama `window.print()`.
5. `@media print` oculta `#root` y deja visible sólo el portal. Al cerrar, se restaura el foco en el botón que abrió la vista previa.

El botón actual de `ClinicalWorkspace.jsx` se reemplaza por este flujo. El `window.print()` directo desaparece del workspace.

## 5. Contrato de datos

`documentoClinico.mjs` concentra la traducción de datos clínicos a datos de impresión. Ninguna plantilla debe leer claves crudas del formulario si existe un adaptador.

```js
export const VACIO = '—';

export function datosImpresion({ patient, history, meta, formData }) {
  const datos = formData['datos-paciente'] ?? {};
  return {
    paciente: {
      nombreCompleto: nombrePaciente(datos, patient),
      dni: datos.dni || patient.dni || VACIO,
      edad: datos.edad || patient.edad || VACIO,
      sexo: sexoLegible(datos.sexo || patient.sexo),
      fechaNacimiento: formatearFecha(datos.fechaNacimiento || patient.fechaNacimiento),
      historia: history.codigo || VACIO,
    },
    operador: {
      nombre: datos.personal?.nombre || datos.operador || history.operador || VACIO,
      docente: meta?.docente || history.docente || VACIO,
      semestre: '',
      anioAcademico: '',
      cop: '',
    },
    generadoEn: formatearFechaHora(new Date()),
  };
}

export function texto(valor, respaldo = VACIO) {
  const limpio = String(valor ?? '').trim();
  return limpio || respaldo;
}

export function marcar(valor, opciones) {
  return opciones.map((opcion) => ({
    etiqueta: opcion,
    marcado: Array.isArray(valor) ? valor.includes(opcion) : valor === opcion,
  }));
}
```

Reglas de presentación:

- Campos cortos vacíos: `—`.
- Bloques de texto vacíos: una caja con línea inferior y la leyenda `Sin registro` en gris claro.
- Opciones: `☒` para la elegida y `☐` para las demás. No se depende del color.
- Listas vacías (diagnósticos, procedimientos, seguimientos): una fila con `Sin registros`.
- Las líneas punteadas del Word no se copian. Se usan tablas y campos con borde inferior para que el documento se lea como un formato digital, conservando rótulos y orden.
- No se imprimen estados de sección, botones, ayudas ni mensajes de validación.

## 6. Correspondencia sección → formato

| Sección (`id`) | Bloques del Word que reproduce | Fuente de datos |
| --- | --- | --- |
| `datos-paciente` | Datos del operador; anamnesis DNI/Fecha; filiación; informante, acompañante y tutor; padres | `formData['datos-paciente']`, `patient`, `history`, `meta` |
| `anamnesis` | Enfermedad actual; datos psicológicos | `formData.anamnesis` |
| `cuestionario-salud` | Cuestionario de salud 1–24 | `healthQuestions`, `preguntaVisible`, claves `qNAnswer`, `qNDetail`, `qNExtra` |
| `antecedentes` | Generales, fisiológicos, terapéuticos, actos quirúrgicos y familiares | `formData.antecedentes` |
| `examen-clinico` | Examen clínico general, cabeza, cuello, extremidades, tórax y signos vitales | `formData['examen-clinico']` |
| `examen-extraoral` | Tipo facial, simetría, perfil, labios, tonicidad, ángulo nasolabial, fonación, última visita y fotografías | `formData['examen-extraoral']` |
| `examen-intraoral` | Tejidos blandos y fotografías intraorales | `formData['examen-intraoral']`, `intraoralTissues` |
| `odontograma` | Hoja NTS 188 (no está en el Word) | Registro vigente del odontograma |
| `oclusion` | Oclusión, pérdida dentaria, prótesis y diagnóstico presuntivo | `formData.oclusion` |
| `examenes-auxiliares` | Laboratorio, resultados adjuntos, informes RX y radiografías | `formData['examenes-auxiliares']`, `labFields` |
| `diagnostico` | DX clínico-radiográfico, presuntivo, definitivo y pronóstico | `formData.diagnostico` |
| `modelos` | Estudio de modelos y fotografías | `formData.modelos` |
| `plan-tratamiento` | Plan de tratamiento integral por fases | `formData['plan-tratamiento']` |
| `consentimiento` | Consentimiento informado, firmas, huella, acompañante y programación | `formData.consentimiento`, `patient`, `history`, `consentParagraphs` |
| `cirugia` | Plan de tratamiento quirúrgico: pre, intra y postoperatorio | `formData.cirugia` |
| `reporte-operatorio` | Reporte operatorio, signos vitales y firmas | `formData['reporte-operatorio']`, `allFormData` para precargas |
| `seguimiento` | Seguimiento quirúrgico y ficha de procedimientos | `formData.seguimiento` |

## 7. Tareas

### Tarea 1 — Contrato de datos y pruebas unitarias

**Archivos:**
- Crear `frontend/src/aplicacion/componentes/clinica/impresion/documentoClinico.mjs`
- Crear `frontend/src/aplicacion/componentes/clinica/impresion/documentoClinico.test.mjs`

**Interfaces:**
- `datosImpresion({ patient, history, meta, formData })` devuelve `{ paciente, operador, generadoEn }`.
- `resolverPaciente(patient, datosPaciente)` tolera nombre completo en `patient.nombres` y nombre separado en el formulario.
- `texto`, `marcar`, `marcarSiNo`, `formatearFecha`, `formatearFechaHora`.
- `plantillaDeSeccion(seccionId)` devuelve el componente o `null`.

**Pasos:**
- [ ] Escribir pruebas para nombre completo, DNI, edad, sexo, HC, fechas, opciones múltiples y valores vacíos.
- [ ] Implementar los adaptadores sin dependencias de React.
- [ ] Verificar que un `formData` vacío no rompe y devuelve `—`.
- [ ] Ejecutar `npm test -- src/aplicacion/componentes/clinica/impresion/documentoClinico.test.mjs`.

**Aceptación:** los adaptadores cubren todos los datos de cabecera y no repiten lógica de nombres en las plantillas.

### Tarea 2 — Hoja, cabecera y primitivas de impresión

**Archivos:**
- Crear `HojaImpresion.jsx`, `EncabezadoInstitucional.jsx`, `IdentificacionPaciente.jsx`, `PieDocumento.jsx`, `primitivas.jsx`
- Crear `frontend/src/css/aplicacion/clinica/impresion.css`
- Modificar `frontend/src/css/app.css`

**Interfaces:**
- `<HojaImpresion numeroPagina?>{children}</HojaImpresion>`
- `<Campo etiqueta="DNI" valor="12345678" />`
- `<Opcion etiqueta="Urgencia" marcado />`
- `<Tabla columnas={[...]} filas={[...]} />`
- `<Texto etiqueta="Motivo de consulta" valor="..." />`
- `<Firma etiqueta="Firma del paciente" valor={adjunto} />`
- `<Galeria etiqueta="Fotografías extraorales" adjuntos={[...]} />`

**Estilos:**
- `@page { size: A4 portrait; margin: 12mm 10mm 14mm; }`
- Hoja en pantalla: `width: 210mm; min-height: 297mm; padding: 12mm 10mm; background: #fff; box-shadow`.
- Tipografía: Inter ya instalada; 10.5 pt para texto, 8.5 pt para tablas.
- Variables propias `--doc-*` para tinta, línea, fondo y gris. Nada de colores literales sueltos.
- `break-inside: avoid` en bloques, filas y firmas; `thead { display: table-header-group; }`.
- `@media print`: ocultar `#root`, anular `position: fixed`, `overflow`, sombras y fondos de pantalla; mostrar sólo el portal.
- Los controles del modal se ocultan con `clinical-print-hide`.

**Aceptación:** una hoja vacía se imprime como A4 sin recortes, con cabecera y pie repetibles.

### Tarea 3 — Vista previa e integración con el workspace

**Archivos:**
- Crear `VistaPreviaImpresion.jsx`
- Modificar `frontend/src/aplicacion/componentes/clinica/workspace/ClinicalWorkspace.jsx`
- Modificar `frontend/src/aplicacion/componentes/clinica/contexto/HistoriaClinicaContext.jsx`
- Modificar `frontend/src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx`

**Interfaces:**
- `VistaPreviaImpresion({ seccionId, onClose })` usa `useHistoriaClinica()` para leer los datos.
- El contexto expone `cargandoExpediente` para no imprimir mientras llega el expediente remoto.
- El botón del workspace cambia de `window.print()` a `setImpresionAbierta(true)`.

**Pasos:**
- [ ] Abrir en portal `#documento-impresion-root` con `role="dialog"`, `aria-modal="true"` y `aria-labelledby`.
- [ ] Cerrar con Escape, con el botón Cerrar y con clic en el fondo.
- [ ] Devolver el foco al botón Imprimir al cerrar.
- [ ] Bloquear el scroll del body mientras la vista previa está abierta.
- [ ] Deshabilitar **Imprimir documento** mientras `cargandoExpediente` o mientras las imágenes no terminan de cargar.
- [ ] Actualizar la prueba existente: ahora el primer clic abre la vista previa y el segundo llama a `window.print()`.

**Aceptación:** el flujo es accesible, no imprime la interfaz y no pierde el foco.

### Tarea 4 — Plantillas del bloque de ingreso y antecedentes

**Archivos:**
- `DatosPacienteImpresion.jsx`, `AnamnesisImpresion.jsx`, `CuestionarioSaludImpresion.jsx`, `AntecedentesImpresion.jsx`

**Detalles:**
- `DatosPaciente`: operador, anamnesis (DNI y fecha de registro), filiación, ubicación, contacto, informante/acompañante/tutor y filiación parental.
- `Anamnesis`: motivo, tipo de atención, historia de la enfermedad, estado general, ectoscopía, estados psicológicos y observaciones.
- `CuestionarioSalud`: tabla de 24 preguntas con Sí/No, detalle y detalle adicional. La pregunta 21 sólo se imprime si la 20 se respondió "Sí"; las demás se imprimen siempre, aunque estén sin responder.
- `Antecedentes`: cinco bloques con las mismas agrupaciones de la pantalla. Los hábitos y prótesis se imprimen como opciones marcadas.

**Aceptación:** el texto impreso coincide con lo que el usuario ve en pantalla y no hay campos duplicados ni inventados.

### Tarea 5 — Plantillas de examen

**Archivos:**
- `ExamenClinicoImpresion.jsx`, `ExamenExtraoralImpresion.jsx`, `ExamenIntraoralImpresion.jsx`, `OclusionImpresion.jsx`

**Detalles:**
- `ExamenClinico`: signos vitales en una fila de tabla; peso, talla e IMC calculado con `calcularImc`; hallazgos por región con su detalle sólo cuando exista alteración.
- `ExamenExtraoral`: opciones marcadas y galería de fotografías.
- `ExamenIntraoral`: tabla de los 10 tejidos con estado y descripción; galería de 6 vistas.
- `Oclusion`: clases, última exodoncia, motivos, prótesis, profesional y diagnóstico presuntivo.

**Aceptación:** las opciones múltiples se leen sin ambigüedad y las fotografías conservan proporción y pie.

### Tarea 6 — Plantillas de síntesis y plan

**Archivos:**
- `ExamenesAuxiliaresImpresion.jsx`, `DiagnosticoImpresion.jsx`, `ModelosImpresion.jsx`, `PlanTratamientoImpresion.jsx`

**Detalles:**
- `ExamenesAuxiliares`: los 8 valores de laboratorio, lista de archivos adjuntos, diagnóstico de laboratorio, tres informes RX y galería de radiografías.
- `Diagnostico`: tabla de diagnósticos estructurados (código, tipo, pieza/región, severidad, evidencia, observaciones), los tres DX libres y el pronóstico con su justificación. Si no hay diagnósticos estructurados, se imprimen los campos libres.
- `Modelos`: informes, planificación y galería.
- `PlanTratamiento`: plan integral y tabla por fase con pieza, procedimiento, prioridad, estado y observaciones.

**Aceptación:** las tablas largas se parten entre páginas sin cortar filas y repiten el encabezado.

### Tarea 7 — Plantillas de cirugía, consentimiento y seguimiento

**Archivos:**
- `ConsentimientoImpresion.jsx`, `CirugiaImpresion.jsx`, `ReporteOperatorioImpresion.jsx`, `SeguimientoImpresion.jsx`

**Detalles:**
- `Consentimiento`: título, datos del paciente y HC, domicilio, fecha, doctor, las 9 cláusulas con su estado aceptado, intervención autorizada, firmas y huella, acompañante y programación. El texto sale de `consentParagraphs`; si en el futuro se versiona, se usa `textosClausulas`.
- `Cirugia`: tres bloques de texto.
- `ReporteOperatorio`: datos precargados (paciente, edad, sexo, domicilio, operador, diagnóstico definitivo y pronóstico), los 12 puntos, tabla de signos vitales pre/intra/post y firmas.
- `Seguimiento`: datos generales, evolución y ficha con columnas Fecha, Procedimiento, Firma del operador y Firma del supervisor.

**Aceptación:** el consentimiento se imprime como documento legal completo y el reporte no repite datos que ya vienen de otras secciones.

### Tarea 8 — Odontograma imprimible

**Archivos:**
- `OdontogramaImpresion.jsx`
- Reutilizar `OdontogramRow`, `CompactTooth`, `odontogramStates` y la leyenda de `GuiaSuperficies.jsx`

**Pasos:**
- [ ] Leer el registro vigente: `localStorage['undac:odontograma:nts188:v1:' + history.codigo]` y `formData.odontograma.registro`; elegir el de mayor `savedAt`.
- [ ] Renderizar ambas arcadas en modo no interactivo, sin botones ni estados de selección.
- [ ] Imprimir la leyenda de estados y la lista de hallazgos por pieza.
- [ ] Si no hay registro, imprimir el gráfico vacío con la leyenda y la nota `Sin hallazgos registrados`.

**Aceptación:** el odontograma impreso se lee sin color y coincide con el último registro guardado.

### Tarea 9 — Endurecimiento y verificación

- [ ] Revisar la paginación en Chrome y Edge con historias largas (cuestionario, antecedentes, consentimiento, reporte).
- [ ] Verificar que las imágenes cargan antes de imprimir y que una imagen rota no rompe la hoja.
- [ ] Probar con una historia sin servidor (`historiaId` local) y con una historia remota.
- [ ] Verificar que el documento no muestra botones, ayudas ni mensajes de validación.
- [ ] Medir el ancho de la hoja en 1920, 1440, 1024 y 768 px; la vista previa debe escalar, no desbordar.
- [ ] Ejecutar `npm test` y `npm run build`.
- [ ] Añadir una nota en la vista previa: para un PDF limpio, desactivar encabezados y pies del navegador.

### Tarea 10 — Opcional: PDF en el backend

Sólo si se decide que la impresión debe ser un archivo oficial:

- [ ] Instalar `barryvdh/laravel-dompdf`.
- [ ] Crear `ServicioImpresionHistoria` en `backend/app/Clinica/Impresion/`.
- [ ] Crear vistas Blade equivalentes a las plantillas del frontend.
- [ ] Añadir ruta `GET historias/{id}/impresion/{seccion}` con `acceso:EXPORTAR_PDF`.
- [ ] Registrar auditoría `IMPRIMIR` por cada documento generado.
- [ ] Añadir el permiso `EXPORTAR_PDF` al catálogo del frontend y a los roles que correspondan.

## 8. Pruebas

**Unitarias (`documentoClinico.test.mjs`):**
- nombre completo y nombre separado;
- DNI, edad, sexo y HC con y sin datos;
- fechas ISO y `datetime-local`;
- opciones simples, múltiples y vacías;
- `texto` devuelve `—` para vacíos.

**De componentes (`ImpresionHistoriaClinica.test.jsx`):**
- abrir la vista previa desde una sección;
- ver el nombre, DNI y código de HC del paciente seleccionado;
- cerrar con Escape y devolver el foco;
- imprimir sólo después del botón **Imprimir documento**;
- renderizar las 17 plantillas con un `formData` de ejemplo sin errores;
- consentimiento con 9 cláusulas y firmas;
- odontograma con un registro de ejemplo.

**Regresión:**
- `HistoriaClinicaModular.test.jsx` actualizado para el nuevo flujo de impresión;
- `npm run build` sin advertencias nuevas.

## 9. Riesgos y decisiones pendientes

1. **Semestre, año académico y C.O.P.** no existen en los datos. Se imprimen vacíos hasta que se decida ampliar la API.
2. **Texto legal del consentimiento.** Si la facultad cambia las cláusulas, el documento impreso debe conservar la versión aceptada. Conviene guardar `textosClausulas` desde ahora.
3. **Imágenes protegidas.** Las fotografías del servidor pasan por la ruta autenticada; la vista previa debe esperar su carga. Si se abre en otra pestaña sin sesión, no cargan.
4. **Encabezados del navegador.** No se pueden desactivar por CSS. La nota de la vista previa lo advierte.
5. **Paginación.** Sin PDF del servidor no hay "Página X de Y" confiable. Si el formato lo exige, la Tarea 10 deja de ser opcional.
6. **Odontograma.** Su estado vive fuera de `formData`; la lectura por `localStorage` es la opción menos invasiva. Si se quiere una única fuente, hay que unificar la persistencia del odontograma con el expediente.
7. **Permisos.** Hoy cualquier rol que ve la historia puede imprimir. Si se requiere restringir, se añade `historias.imprimir` al catálogo y se oculta el botón a quien no lo tenga.

## 10. Estimación

| Fase | Trabajo | Estimación |
| --- | --- | --- |
| 1 | Contrato, hoja, primitivas, CSS | 1.5 días |
| 2 | Vista previa e integración | 1 día |
| 3 | Plantillas de ingreso y antecedentes | 1.5 días |
| 4 | Plantillas de examen | 1 día |
| 5 | Plantillas de síntesis y plan | 1 día |
| 6 | Cirugía, consentimiento y seguimiento | 1.5 días |
| 7 | Odontograma | 0.5 día |
| 8 | Pruebas, paginación y ajustes | 1 día |
| **Total** | | **9 días hábiles** |

La Tarea 10 (PDF en backend) añade entre 2 y 3 días y depende de la decisión sobre el archivo oficial.

## 11. Estado de implementación

Implementado el 23 de octubre de 2026:

- Capa de datos `documentoClinico.mjs` con adaptadores de paciente, asistente, profesional encargado, fechas, opciones y valores vacíos.
- Hoja A4, encabezado neutro, identificación del paciente y pie de página.
- Primitivas de campos, opciones, textos, tablas, firmas, galerías, adjuntos y listas.
- Diecisiete plantillas, una por sección, en `componentes/clinica/impresion/plantillas/`.
- Vista previa en portal, cierre con Escape, bloqueo de scroll, devolución de foco y espera de imágenes antes de imprimir.
- Estilos de pantalla y de impresión en `css/aplicacion/clinica/impresion.css`.
- Indicador `cargandoExpediente` en el contexto para no imprimir mientras llega el expediente remoto.
- Regla de vocabulario aplicada al frontend: “profesional encargado” y “asistente”; sin UNDAC en las vistas y documentos.
- Pruebas unitarias, de integración y de humo para las 17 plantillas.

Pendiente:

- Validación visual en Chrome y Edge con una historia real y fotografías cargadas.
- Revisión de paginación en secciones largas.
- Impresión de la historia completa.
- PDF en el backend si se requiere un archivo oficial numerado y auditado.
- Completar semestre, año académico y C.O.P. cuando exista la fuente de datos.
