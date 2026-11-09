# Revisión normativa para uso en una clínica odontológica privada

Actualización técnica posterior: se implementaron controles descritos en `docs/IMPLEMENTACION_CONTROLES_CLINICOS_2026-11-09.md`. Los hallazgos de este informe reflejan el estado previo a esa implementación; no deben interpretarse como una certificación ni como evidencia de que todos los pendientes institucionales quedaron resueltos. La doctora todavía no dispone de certificado o proveedor de firma digital.

Fecha: 9 de noviembre de 2026. Alcance: revisión técnica del código y contraste documental de las cinco normas solicitadas. No constituye acreditación de SIHCE ni dictamen jurídico de la clínica.

## Resultado

**No está demostrado el cumplimiento integral y hay brechas técnicas que deben cerrarse antes de utilizar el sistema como expediente clínico oficial de pacientes reales.** La conclusión anterior sobre preparación técnica para producción no equivale a conformidad sanitaria o de protección de datos.

El usuario aclara que lo utilizaría una doctora en su clínica privada, inicialmente sin participación de la UNDAC. No se ha identificado razón social, RUC, dirección, código RENIPRESS, responsable del banco de datos ni expediente oficial en papel o electrónico. No se atribuyen a la UNDAC responsabilidades, autorizaciones o políticas que no se han acreditado.

| Materia | Evaluación actual | Pendiente principal |
| --- | --- | --- |
| Ley 29733 y D. S. 016-2024-JUS | Controles parciales; brechas técnicas y evidencia organizativa pendiente | Copias clínicas locales, trazabilidad de lecturas, información al paciente, banco de datos y seguridad operativa |
| NTS 139 | Cumplimiento integral no demostrado | Autoría profesional, versiones refrendadas, correcciones y conservación documental |
| NTS 188 | Adecuación parcial; conflicto concreto en contenido | El odontograma incorpora extracción programada; faltan validación clínica completa, autoría y comprobación física de impresión |
| Ley 29414 y D. S. 027-2015-SA | Formulario existente, ciclo del consentimiento incompleto | Cierre y conservación del documento, negativa/revocación, representación y entrega de copia completa |
| Ley 30024 y Directiva 373 | No hay evidencia de acreditación; aplicación requiere definir operación de la clínica | El producto tiene funciones propias de gestión de historias; llamarlo complementario no acredita una excepción |

## 1. Quién debe responder por los datos y qué significa IPRESS

Una IPRESS es una institución prestadora de servicios de salud; también puede ser un consultorio privado. Su condición debe comprobarse con los datos del establecimiento en [RENIPRESS, según SUSALUD](https://www.gob.pe/institucion/susalud/campa%C3%B1as/95866-consulta-el-renipress). El nombre del repositorio y la existencia del programa no permiten verificar esa inscripción. Su ausencia de evidencia tampoco demuestra que la clínica no esté inscrita.

Debe identificarse a la persona natural o jurídica que decide los fines y medios del tratamiento. Podría ser la doctora o la empresa que opera su clínica. El desarrollador no asume automáticamente ese papel por haber construido el programa; si aloja, administra o accede a los datos durante soporte, debe definirse su intervención como encargado cuando corresponda, con instrucciones, confidencialidad y condiciones contractuales.

La clínica debe declarar qué documento integra el expediente oficial y quién lo custodia: papel firmado, documento electrónico refrendado o un esquema combinado con reglas claras. Imprimir algunos formularios no resuelve por sí solo la integridad del resto de la historia.

## 2. Protección de datos: controles existentes y brechas

Hay autenticación con sesión y CSRF, permisos de módulo, restricción por asignación vigente, auditoría de modificaciones, almacenamiento privado de adjuntos y guías de respaldo. Son avances verificables en el código, no evidencia del servidor que finalmente se publique.

### Copias persistentes del odontograma: prioridad crítica

En [Odontograma.jsx](C:/laragon/www/Odontologia-UNDAC/frontend/src/aplicacion/formularios/odontograma/Odontograma.jsx:61), el componente compara la copia del navegador con la del servidor y puede enviar automáticamente la local si su fecha es posterior. También escribe en `localStorage` al guardar. La clave se basa en la identidad de historia, sin separación por sesión clínica.

[OdontogramaImpresion.jsx](C:/laragon/www/Odontologia-UNDAC/frontend/src/aplicacion/componentes/clinica/impresion/plantillas/OdontogramaImpresion.jsx:10) puede preferir esa copia para imprimir. Por tanto, retirar persistencia local del contexto principal no eliminó todas las copias clínicas locales del proyecto.

Riesgos: datos accesibles en un equipo compartido, diferencias entre dispositivos, recuperación de información antigua e impresión distinta del servidor. La comprobación por fecha del cliente no es control de concurrencia del servidor.

**Cierre propuesto:** usar el servidor como fuente del registro e impresión; retirar la sincronización automática por fecha local; resolver conflictos con revisión del servidor; tratar las copias heredadas mediante una migración controlada que no destruya información pendiente sin revisión.

### Consultas y descargas sin trazabilidad funcional completa: prioridad alta

[ControladorHistorias.php](C:/laragon/www/Odontologia-UNDAC/backend/app/Clinica/Http/Controladores/ControladorHistorias.php:187) devuelve expedientes y odontogramas sin registrar su visualización. [ControladorArchivos.php](C:/laragon/www/Odontologia-UNDAC/backend/app/Clinica/Http/Controladores/ControladorArchivos.php:47) sirve archivos; registra subida y eliminación, pero no esa lectura. No se encontró un middleware global que complete ese registro. Una bitácora web ordinaria no acredita automáticamente usuario, historia y operación.

El artículo 46.3 exige trazabilidad también de visualización, importación y exportación, con conservación mínima de dos años. El artículo 47 exige un documento de seguridad aprobado. Deben instrumentarse esos eventos y proteger sus registros; no duplicar innecesariamente el contenido clínico en cada evento. Véase el [Reglamento, artículos 46–47](https://www.sat.gob.pe/TransparenciaV3/Portals/0/Docs/NormasOtrasEntidades/DecretoSupremo016-2024-JUS_ReglamentoLey29733_LeyProteccionDatosPersonales.pdf).

### Evidencia que corresponde a la clínica

Faltan evidencias de inscripción del banco de datos, información de privacidad, bases del tratamiento, atención de derechos, contratos con proveedores y seguridad efectivamente aplicada. Deben verificarse TLS, permisos de infraestructura, respaldos cifrados y restauración en el destino real. Las plantillas del repositorio no prueban su aplicación.

No debe exigirse indiscriminadamente consentimiento para todo tratamiento asistencial: corresponde determinar la base legal y las excepciones sanitarias. Los usos opcionales de fotografías, docencia o investigación requieren evaluación separada. La revocación o solicitud de supresión tampoco autoriza borrar documentos sujetos a conservación legal. Véanse la [Ley 29733](https://www.leyes.congreso.gob.pe/Documentos/Leyes/29733.pdf) y su [reglamento vigente](https://www.gob.pe/institucion/anpd/normas-legales/6554453-n-016-2024-jus).

Debe existir respuesta a incidentes: artículos 34–36 del reglamento, incluida notificación dentro de 48 horas de conocido el incidente en los supuestos previstos y comunicación inmediata del encargado al responsable. La designación del Oficial de Datos Personales debe evaluarse por actividad y supuestos del artículo 37, junto con su calendario progresivo; no se concluye que una clínica pequeña ya esté fuera de plazo sin conocer su clasificación e ingresos.

## 3. NTS 139: integridad, aprobación y conservación

La norma comprende establecimientos privados. Distingue historia clínica informatizada de historia clínica electrónica refrendada digitalmente. Una cuenta autenticada, un estado «aprobado», un hash de revisión y una imagen de firma cumplen funciones diferentes; no prueban por sí solos la firma digital del documento. Referencia: [NTS 139, definiciones y gestión documental](https://portal.inen.sld.pe/wp-content/uploads/2019/06/R.M_214-2018-MINSA.pdf), considerando también su modificatoria R. M. 265-2018/MINSA.

Hallazgos:

- [AccesoHistorias.php](C:/laragon/www/Odontologia-UNDAC/backend/app/Clinica/Historias/AccesoHistorias.php:38) bloquea ciertos cambios al asistente, pero permite modificación al profesional y al administrador con acceso. Esto debe acompañarse de versiones y rectificaciones; una aprobación previa no congela una versión refrendada para todos los actores.
- [ServicioExpediente.php](C:/laragon/www/Odontologia-UNDAC/backend/app/Clinica/Expediente/ServicioExpediente.php:184) deriva la capacidad de aprobar de no ser alumno. Un permiso administrativo no acredita competencia profesional ni habilitación/COP. Deben separarse aprobación asistencial y administración técnica.
- La auditoría de aprobaciones y reaperturas identifica actor y sección, pero falta demostrar preservación de la versión aprobada y protección frente a alteraciones privilegiadas de la bitácora.
- No se encontró gestión documental completa de archivo, conservación, disposición y excepciones. La baja lógica y el respaldo son controles distintos de ese ciclo.

Como referencia ordinaria, la NTS contempla cinco años en archivo activo desde la última atención y quince en pasivo desde su traslado; existen reglas especiales y documentos que deben seguir custodiándose. **No programar un borrado automático a los veinte años.** Definir política, inventario, excepciones y procedimiento autorizado de disposición con el responsable sanitario y de archivo. [NTS 139, administración y conservación](https://portal.inen.sld.pe/wp-content/uploads/2019/06/R.M_214-2018-MINSA.pdf).

**Cierre propuesto:** identidad profesional verificada, refrendo conforme al soporte oficial elegido, conservación de versiones, rectificaciones vinculadas al original con motivo/autor/fecha, y prueba de recuperación de expediente y adjuntos durante el plazo aplicable.

## 4. NTS 188: conflicto encontrado y verificaciones pendientes

Se examinó visualmente el PDF oficial, en particular los numerales 5.2–5.17. Existe catálogo, numeración FDI, colores de hallazgos y evaluaciones diferenciadas. Eso no permite declarar conformidad gráfica integral.

**Conflicto concreto:** el numeral 5.8 reserva el odontograma a hallazgos observados y deriva los procedimientos previstos al plan de tratamiento. El catálogo actual incluye `extraccion-programada`, con símbolo propio, como marca del odontograma en [odontograma.config.mjs](C:/laragon/www/Odontologia-UNDAC/frontend/src/aplicacion/formularios/odontograma/odontograma.config.mjs:93). Debe trasladarse al plan y excluirse de la representación normativa; conservar trazabilidad de registros existentes. Fuente: [NTS 188, PDF oficial, numeral 5.8](https://cdn.www.gob.pe/uploads/document/file/3456674/NTS%20N%C2%BA%20188-MINSA/DGIESP-2022.pdf).

Otros pendientes:

- El numeral 5.3 atribuye responsabilidad al cirujano dentista que firma y sella. Actualmente nombre y COP son datos editables; el cierre declara expresamente que no es firma digital.
- [ServicioOdontograma.php](C:/laragon/www/Odontologia-UNDAC/backend/app/Clinica/Odontograma/ServicioOdontograma.php:58) verifica evaluaciones cerradas antes de adquirir el bloqueo de la historia. Existe una ventana de concurrencia que requiere prueba específica y corrección dentro de la transacción.
- Ese servicio elimina y reconstruye filas; `id_docente_responsable` se deriva del usuario que guarda, incluso cuando reconstruye evaluaciones anteriores. Debe preservarse el autor de cada evaluación y separar autor, revisor y último editor.
- La bitácora de `EDITAR_ODONTOGRAMA` conserva la sección, sin valores clínicos anteriores/nuevos ni una versión documental equivalente.
- El numeral 5.17 requiere área mínima de corona de 0,5 cm². El ancho CSS de columna de 8,4 mm no acredita el área de corona: debe medirse la figura impresa a escala real, sin ajustar a página, y revisar el PDF exportado.
- Hace falta contraste clínico de cada símbolo, superficies, coexistencia de hallazgos y salida impresa con una odontóloga responsable. No se certificaron todos los gráficos en esta revisión.

[Resolución y NTS 188](https://www.gob.pe/institucion/minsa/normas-legales/3304261-559-2022-minsa).

## 5. Consentimiento y derechos del paciente

El formulario sí guarda textos de cláusulas y admite archivos de firma. Sin embargo, [guardarConsentimiento](C:/laragon/www/Odontologia-UNDAC/backend/app/Clinica/Expediente/ServicioExpediente.php:864) actualiza el último documento, reemplaza cláusulas y mantiene `BORRADOR`; no implementa un ciclo de versiones firmadas y revocación.

[consentimiento.config.mjs](C:/laragon/www/Odontologia-UNDAC/frontend/src/aplicacion/formularios/consentimiento/consentimiento.config.mjs:1) mezcla autorización quirúrgica, fotografías para ciencia/docencia y cláusulas económicas. Debe separarse el consentimiento asistencial de las finalidades opcionales y adaptar el documento al procedimiento realmente informado. La pantalla genérica no demuestra que se hayan explicado riesgos y alternativas.

Pendientes: documentar negativa/revocación conservando el original; registrar representante y sustento cuando corresponda; vincular la firma al documento exacto; impedir sustitución silenciosa de un consentimiento ya otorgado; validar en servidor la transición de cierre, además de conservar borradores incompletos.

El artículo 24 regula el consentimiento libre e informado, su constancia escrita y revocación. El artículo 25 exige entrega de copia completa de historia en hasta cinco días hábiles. Debe existir procedimiento y expediente de solicitud/entrega; no exige necesariamente un portal del paciente, pero imprimir una sección aislada no acredita una copia completa. [D. S. 027-2015-SA, artículos 24–25](https://cdn.www.gob.pe/uploads/document/file/1129495/Decreto_Supremo_027-_2015_-_SA.pdf).

## 6. SIHCE: qué se puede concluir

La Directiva 373 incluye IPRESS privadas que utilizan SIHCE. El sistema registra anamnesis, examen, diagnósticos, consentimiento, odontograma, evolución y aprobación: funcionalmente supera una agenda o un directorio administrativo. **La hipótesis de trabajo debe ser evaluar su adecuación como sistema clínico, sin asumir exención por llamarlo complementario.** Es una inferencia de sus funciones, no una acreditación ni resolución de MINSA. [R. M. 164-2025/MINSA y Directiva 373, ámbito y perfiles](https://www.gob.pe/institucion/minsa/normas-legales/6551375-164-2025-minsa).

Si será la única historia oficial digital, deben evaluarse formalmente firma, integridad, seguridad, interoperabilidad y perfiles funcionales aplicables, y el proceso de acreditación con MINSA/autoridad regional. No se encontró certificado de acreditación, integración RENHICE ni implementación de firma digital que permita afirmar cumplimiento.

Si habrá papel firmado o integración con otro SIHCE, documentar qué actos se registran en cada soporte, cuál es la fuente oficial y cómo se garantiza completitud y concordancia. Este escenario debe contrastarse con la autoridad competente; conservar papel no demuestra automáticamente que el software esté fuera del ámbito de la directiva.

Actualizaciones consideradas:

- El reglamento de la Ley 30024 aprobado por D. S. 009-2017-SA fue modificado por el [D. S. 020-2025-SA](https://busquedas.elperuano.pe/dispositivo/NL/2463489-2). La evaluación formal debe utilizar el texto vigente, no únicamente el original de 2017.
- La [R. M. 188-2026/MINSA](https://www.gob.pe/institucion/minsa/normas-legales/7845808-188-2026-minsa) amplía hasta doce meses adicionales los plazos de los numerales 5.10 y 8.1. No es una dispensa general ni permite asignar automáticamente el mismo vencimiento a una clínica que empiece ahora.

No corresponde ordenar que compre otro sistema o instale el software de MINSA sin determinar el alcance. La acreditación tampoco se obtiene pasando las pruebas automatizadas del proyecto.

## 7. Orden propuesto para cerrar pendientes

| Orden | Responsable | Entrega y criterio de cierre |
| --- | --- | --- |
| 1 | Doctora / titular de la clínica | Identificar establecimiento y responsable, verificar RENIPRESS, definir soporte oficial y uso real del software; tramitar consulta de alcance SIHCE cuando corresponda |
| 2 | Desarrollo | Retirar fuente clínica local del odontograma, impresión desde servidor y concurrencia; probar desconexión, dos sesiones y cambio de usuario sin sobrescritura |
| 3 | Desarrollo + responsable sanitario | Autoría por evaluación, versiones cerradas y correcciones; aprobación profesional diferenciada; demostrar imposibilidad de sustituir silenciosamente una versión refrendada |
| 4 | Desarrollo + odontóloga | Separar tratamiento previsto del odontograma, verificar catálogo e impresión; consentimiento por procedimiento, versiones y revocación |
| 5 | Clínica + proveedor de alojamiento/soporte | Banco de datos, privacidad, derechos, contratos, documento de seguridad, incidentes y conservación; verificar obligaciones y plazos del Oficial de Datos Personales |
| 6 | Desarrollo + operación | Trazabilidad de lecturas/descargas/exportaciones, protección y retención de bitácoras, TLS y recuperación comprobada de base y adjuntos en el servidor real |
| 7 | Clínica + desarrollo | Matriz de perfiles/requisitos SIHCE aplicables, evidencia técnica y documental; proceso formal de acreditación si corresponde, antes de presentar el producto como conforme |

## Método y límites de la revisión

Se revisaron rutas, autorización, expediente, consentimiento, odontograma, impresión, auditoría y documentación de despliegue. Se contrastaron fuentes oficiales y copias públicas de las normas. El PDF de NTS 188 se revisó visualmente por carecer de texto extraíble útil.

Se ejecutó `npm run test -- --maxWorkers=1 src/aplicacion/formularios/odontograma/odontogramaServidor.test.jsx`: tres pruebas aprobadas. Una confirma expresamente la sincronización de una copia local más reciente, comportamiento que se identifica aquí como pendiente de adecuación. No se alteraron datos asistenciales ni se ejecutaron pruebas sobre la base operativa. La carrera de cierre del odontograma es un riesgo identificado por revisión de código, aún sin reproducción concurrente en esta evaluación.

No se inspeccionó una instalación de producción, no se realizó peritaje de firmas ni evaluación clínica exhaustiva de símbolos. Las políticas, contratos, inscripciones y habilitaciones de la clínica permanecen sin evidencia; esto se distingue de los defectos técnicos observados. El documento previo `docs/odontograma-nts188.md` conserva referencias a demostración/local que ya no describen toda la integración actual; no debe utilizarse como certificado de conformidad.
