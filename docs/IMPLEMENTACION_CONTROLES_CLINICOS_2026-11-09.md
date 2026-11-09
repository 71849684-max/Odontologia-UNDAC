# Adecuación técnica de documentos clínicos

Fecha: 9 de noviembre de 2026. Destino previsto: clínica privada. Esta entrega aborda desarrollo; no acredita al establecimiento ni certifica cumplimiento normativo integral.

## Alcance implementado

| Observación | Cambio técnico |
| --- | --- |
| Copias locales del odontograma | En historias del servidor no se lee ni escribe el registro en `localStorage`. No se importan copias antiguas por comparar fechas. Se conservan sin borrarlas para una recuperación supervisada. |
| Fallos de red y concurrencia | Borrador pendiente en memoria de la sesión, reintento explícito, guardados ordenados y revisión del servidor. Una revisión obsoleta se rechaza sin sobrescribir el registro. El indicador general y la protección de salida incluyen el odontograma. |
| Evaluaciones cerradas | Comprobación dentro de la transacción con bloqueo de historia. Cierre por cuenta profesional con COP registrado; nombre, cuenta y fecha de cierre se derivan del servidor. Se preserva la asociación del profesional al reconstruir las filas. |
| Conservación de originales | Tabla `historia_documento_version` con versiones completas, responsable, motivo, fecha y hashes encadenados. Triggers impiden actualización y eliminación desde la aplicación. No constituye firma digital ni protección frente a un administrador que controle completamente la base y sus respaldos. |
| Secciones aprobadas | Se vinculan a su versión conservada. La lectura de una sección aprobada verifica su hash y utiliza ese contenido, incluso si cambia después la ficha general del paciente. Reabrir requiere profesional con COP y motivo; el original permanece disponible. |
| Consentimiento | Registro de otorgamiento, negativa y revocación, con constancias y versión del documento. Una edición posterior prepara otro borrador en lugar de reemplazar el documento anterior. Se conserva el texto de las cláusulas. Riesgos, alternativas y representación tienen campos propios. |
| Finalidades opcionales | La opción de fotografías/docencia se muestra separada del consentimiento asistencial y no es obligatoria para registrar la decisión. Los textos clínicos todavía deben aprobarse para los procedimientos de la clínica. |
| Procedimientos previstos en el odontograma | Ya no pueden crearse como hallazgos. Las indicaciones antiguas permanecen en los datos históricos, se excluyen del gráfico normativo y se muestran en el plan como pendientes de revisión; incorporarlas al plan requiere una acción explícita. |
| Impresión | Consulta la copia del servidor; no toma datos del navegador. Permite imprimir el expediente completo y todas las evaluaciones odontológicas. Se amplía la columna dental y se comprueba el área de corona con estilos de impresión. |
| Consultas y exportaciones | Se registran lecturas de historias y pacientes, consulta/descarga de archivos, preparación de impresión y exportación. La traza de lectura evita copiar el contenido clínico. Respuestas privadas con `Cache-Control: no-store`. |
| Adjuntos reemplazados | Conservación física del original y comprobación de SHA-256 antes de servirlo. Una versión autorizada permite consultar el archivo anterior; perder la asignación vigente también impide usar esas referencias. |
| Entrega de copia | Vista de impresión completa y archivo ZIP con expediente, todas las versiones, adjuntos vigentes y reemplazados, y manifiestos de integridad. Los temporales se generan fuera de la raíz pública y se eliminan al finalizar la entrega. |
| Bitácora | Triggers impiden modificar o eliminar eventos de auditoría desde la aplicación. Las acciones nuevas tienen etiquetas visibles en español. |

## Esquema y despliegue del cambio

Los cambios de esquema están separados del SQL de referencia recibido:

- `backend/database/parches/2026-11-09-proteger-auditoria.sql`
- `backend/database/parches/2026-11-09-versiones-clinicas.sql`
- `backend/database/parches/2026-11-09-versiones-secciones.sql`

No incluyen borrado ni modificación de registros asistenciales existentes. Deben instalarse con una cuenta de despliegue que pueda crear tablas, columnas, restricciones y triggers. La cuenta de ejecución de la aplicación debe mantener permisos limitados; no conceder privilegios globales para resolver un fallo de instalación de triggers.

Antes de publicar el código, respaldar base y almacenamiento privado, comprobar su recuperación y aplicar, desde `backend`, con la configuración del destino:

```powershell
php artisan clinica:actualizar-documentos --base-esperada=NOMBRE_REAL_DE_LA_BASE
php artisan clinica:verificar
php artisan clinica:verificar-versiones
```

En el servidor definitivo también ejecutar `php artisan clinica:verificar --produccion`. ZIP debe estar habilitado en PHP. El comando de actualización documental aplica únicamente estos tres parches; no ejecuta reparaciones históricas ajenas a esta entrega.

Los tres parches se instalaron en la base local `bd_clinica_undac` y en las tres bases aisladas. Antes de la actualización local se respaldó la estructura en almacenamiento privado. No se alteró el archivo SQL aportado ni se ejecutaron actualizaciones de registros asistenciales. El diagnóstico local quedó aprobado: 83 tablas, tres vistas y doce triggers. No hubo publicación en un servidor externo.

La entrega de un ZIP elimina el temporal al finalizar. Se registró además la tarea diaria `clinica:limpiar-exportaciones`, que retira únicamente temporales de más de 24 horas de su carpeta privada; no elimina expedientes, versiones o adjuntos. En producción debe estar habilitado el planificador de Laravel (`schedule:run`), conforme a la configuración del servidor.

El archivo de versiones empieza al instalar este cambio. **No reconstruye ni firma retrospectivamente actuaciones anteriores.** Las aprobaciones antiguas sin una versión vinculada deben revisarse antes de tratarlas como documentos oficiales refrendados. El código anterior puede ignorar las nuevas tablas, pero una reversión no debe eliminar el archivo ni su bitácora.

## Verificación

Las comprobaciones y resultados finales se consignan en `docs/evidencias/adecuacion-documental-2026-11-09/validacion.json`. Las pruebas utilizan bases exclusivas y datos ficticios, cookies y CSRF reales en navegador. Las mediciones locales no certifican capacidad del servidor que finalmente aloje la clínica.

Se agregan pruebas para conservación y hashes, restricciones de actualización, pérdida de asignación, reapertura con motivo, COP, concurrencia del odontograma, conservación de consentimiento negado, adjuntos históricos, exportación y estabilidad de filiación aprobada tras cambios en el paciente.

La prueba de carga corta genera ráfagas de guardado cada segundo y no sustituye la campaña con intervalo clínico del plan. Los ensayos fallidos también se conservan; no se modifican los umbrales para conseguir un resultado favorable.

Resultados de la campaña nominal local: 40 usuarios virtuales, cinco minutos estables e intervalo de 30 segundos. P95: listado 369,11 ms, lectura 323,14 ms y autoguardado 416,31 ms; cero errores HTTP y conflictos, con 474 verificaciones de integridad correctas. La revisión posterior de las 1.000 historias sintéticas también pasó. El muestreo de recursos conservado corresponde a una prueba corta separada de cinco usuarios, no a toda la campaña nominal.

Se redujeron lecturas duplicadas al guardar y se evitan reescrituras de secciones sin cambios; las secciones con vínculos de firmas mantienen su sincronización. La auditoría compara el antes y el después obtenidos en la misma operación, en lugar de tomar una lectura anterior fuera de su transacción.

## Límites y dependencias pendientes

- La doctora confirmó que todavía no tiene certificado ni proveedor de firma digital. **Esta integración permanece pendiente**; no se implementa una firma ficticia ni se presenta el cierre, la aprobación interna o una imagen como firma digital.
- Registrar un COP permite exigir un perfil profesional en el sistema; no comprueba por sí solo colegiatura o habilitación ante la entidad profesional.
- Falta validar con la responsable sanitaria las plantillas por procedimiento, los casos de representación, excepciones asistenciales y el conjunto de símbolos del odontograma. El software conserva evidencia; no decide la pertinencia clínica de un tratamiento.
- Configuración de producción, recuperación en el servidor definitivo, custodia de copias, conservación aplicable, inscripción del banco, derechos del paciente y alcance/acreditación SIHCE se deben completar antes del uso oficial. La guía operativa y la definición de soporte oficial se trabajarán después, según lo solicitado.

La protección de la aplicación no reemplaza controles de infraestructura: un administrador de base puede retirar triggers o modificar archivos. La custodia de respaldos y registros fuera de su control debe formar parte del despliegue.
