# Corrección del guardado y los estados clínicos

## Causas identificadas

- Aprobar cambiaba el estado local antes de confirmar la respuesta del servidor. Un rechazo dejaba la pantalla bloqueada como si la sección estuviera aprobada.
- Reabrir cambiaba el estado mediante el autoguardado y compartía el motivo con solicitudes pendientes, en vez de confirmar una operación explícita.
- El formulario completo estaba dentro de un `fieldset` deshabilitado: también impedía desplegar apartados y consultar controles.
- Una cuenta profesional sin COP podía recibir un rechazo al guardar otra sección por reenviar estados ya aprobados, aunque no estuviera solicitando una aprobación nueva.

## Comportamiento corregido

La aprobación exige un guardado confirmado, sin cambios pendientes ni errores. La aprobación, reapertura y envío a revisión esperan la respuesta del servidor; si falla, se mantiene el estado anterior. La reapertura conserva el motivo para reintentar y muestra el error dentro del diálogo.

El autoguardado y las transiciones usan la misma cola. Se cancelan temporizadores pendientes al iniciar una transición, se evitan solicitudes repetidas sin cambios y el motivo se entrega a la operación concreta. Los errores muestran la explicación del servidor. Los errores y cargas pendientes del odontograma también impiden aprobar.

En modo de consulta se pueden desplegar apartados, enfocar y seleccionar texto, navegar e inspeccionar adjuntos. Los controles de edición y las operaciones de carga, retirada y dibujo de firmas quedan protegidos. El backend mantiene la congelación del contenido aprobado y exige COP y motivo para reabrir.

## Ubicación del historial

Las versiones se conservan en MySQL, tabla `historia_documento_version`, enlazadas por `id_historia_clinica`. El campo `contenido` contiene la copia JSON; los demás campos identifican al responsable, fecha, evento, motivo y huellas de integridad. `historia_seccion_estado.id_version_aprobada` identifica la versión aprobada.

Los adjuntos se conservan en el disco privado `local`, bajo `backend/storage/app/private/clinica/{idHistoria}` en el entorno habitual. El historial no depende del almacenamiento del navegador.

## Verificación

Se comprobaron el guardado fallido y su recuperación, la aprobación pendiente de respuesta, la reapertura fallida sin desbloqueo anticipado, la conservación del motivo y la consulta de campos aprobados. Los recorridos de navegador interrumpen o retienen peticiones y posteriormente continúan contra Laravel y la base aislada; no simulan respuestas correctas.

También se comprobó que una petición inválida no guarda ni aprueba parcialmente, que la revisión sigue vigente después de aprobar y reabrir, y que conservar un estado aprobado no equivale a solicitar una aprobación nueva.

Resultados: 166 pruebas del backend y 277 del frontend correctas. Tras ajustar la consulta del odontograma aprobado, pasaron de nuevo las 34 pruebas de guardado y odontograma. Se verificaron 8 recorridos en Chrome contra el entorno aislado, incluidos integridad documental, protección de salida y recuperación ante fallos de red. Compilación de producción, revisión de tokens y estilo PHP correctos.
