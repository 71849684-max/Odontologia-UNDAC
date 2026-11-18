# Correcciones de sesión y salida clínica

Se implementan los dos hallazgos P1 de la revisión del 9 de noviembre de 2026. Los cambios son de frontend y se comprobaron contra Laravel y la base aislada de navegador; no se ejecutaron escrituras de pruebas sobre la base clínica de trabajo.

## Cierre de sesión con conexión fallida

- La interfaz retira inmediatamente la sesión y registra un indicador de salida pendiente sin datos personales ni credenciales.
- Mientras la salida esté pendiente, recargar no recupera automáticamente la cuenta anterior: se intenta confirmar el cierre y se mantiene el formulario de acceso si falla.
- El indicador se conserva en almacenamiento y en la URL como respaldo para navegadores que denieguen `localStorage`; se elimina cuando el servidor confirma el cierre, ya responde 401 o se completa una autenticación explícita válida.
- Se informa que no se pudo confirmar el cierre. El usuario puede pulsar «Reintentar cierre de sesión»; también se reintenta al recuperar conectividad. No se afirma que una sesión del servidor haya sido revocada mientras no existe comunicación con él.
- Otra cuenta puede autenticarse explícitamente incluso si la anterior está inactiva y su cierre devuelve 403. Laravel regenera la sesión al iniciar el nuevo acceso.
- Se bloquean recuperaciones de sesión atrasadas mediante una generación de operación; el indicador compartido retira la sesión de otras pestañas abiertas del mismo origen.

Archivos principales: `frontend/src/aplicacion/autenticacion/ContextoSesion.jsx`, `salidaPendiente.js` y el formulario de acceso.

## Cambios clínicos pendientes

- Se compara el contenido actual con el último envío confirmado y se consideran también las escrituras pendientes de la cola de autoguardado.
- Las salidas internas, cambios de historia o sección que desmonten la ficha y la navegación por historial pasan por una protección de salida.
- El diálogo «Hay cambios sin guardar» permite **Permanecer**, **Guardar y salir** o **Descartar y salir**. Si falla el guardado o existe un conflicto de revisión, la ficha permanece abierta y se conserva el contenido en memoria.
- Al cancelar una navegación del historial se restaura la ubicación clínica. Escape permite permanecer y el foco vuelve al control de origen.
- Recargar o cerrar la pestaña con cambios pendientes activa la confirmación nativa del navegador. El navegador decide el texto de esa confirmación; el usuario debe haber interactuado con la página para que pueda mostrarse.
- No se introduce persistencia clínica en `localStorage`. La revocación de autorización sigue retirando los datos y deteniendo futuras escrituras; no se bloquea esa retirada por un cambio pendiente.

Archivos principales: `frontend/src/aplicacion/Aplicacion.jsx`, `utilidades/salidaClinica.js`, el contexto clínico y `DialogoSalidaClinica.jsx`.

## Verificación

- Vitest: 268 pruebas aprobadas en 34 archivos.
- Playwright: 56 recorridos aprobados en una ejecución conjunta de Chromium y Firefox.
- Compilación y verificación de tokens aprobadas.
- La suite ampliada incluye los recorridos habituales y cinco casos nuevos por navegador: cierre fallido/recarga/recuperación de red; autenticación explícita de otra cuenta; permanecer, reintentar, historial y recarga; descarte explícito; salida inmediatamente después de escribir.
- Los casos de navegador usan cookies, CSRF y servidor reales. Las interrupciones de solicitudes se usan únicamente para provocar fallos de red; las confirmaciones de sesión y persistencia se comprueban en Laravel.

Los informes completos permanecen en los directorios privados de resultados de pruebas. El diagnóstico de columnas de índices (P2), CI remoto y el piloto del servidor definitivo siguen siendo trabajos separados; estos cambios no constituyen un despliegue de producción.
