# Revisión del estado actual — 9 de noviembre de 2026

Actualización posterior: se implementaron las [correcciones de los dos hallazgos P1](CORRECCIONES_SALIDA_SEGURA_2026-11-09.md). Los hallazgos y reproducciones siguientes describen el estado anterior a esa corrección. El hallazgo P2 sobre la verificación de índices permanece pendiente.

## Resultado

El sistema funciona en desarrollo y sus comprobaciones habituales pasan. La base de trabajo ya tiene aplicado el contador anual; el diagnóstico actual informa 82 tablas, 3 vistas y 8 triggers, sin parches pendientes. Hay dos defectos prioritarios de sesión y conservación de cambios, además de un falso positivo del diagnóstico, que deben corregirse antes de publicar.

Se revisó el checkout basado en `28266271`, con los cambios locales de la implementación anterior todavía sin commit. Esta revisión no corrige la aplicación ni modifica datos clínicos: las pruebas escribieron exclusivamente datos sintéticos en bases de pruebas; el ensayo de índice incorrecto utilizó una tabla temporal que se eliminó al finalizar.

## Hallazgos

### P1 — Un cierre de sesión fallido permite recuperar el acceso al recargar

Ubicación: `frontend/src/aplicacion/autenticacion/ContextoSesion.jsx:81`; recuperación automática en el mismo archivo, línea 40.

Si `/api/auth/logout` falla, el proveedor oculta la sesión y muestra el acceso, descarta el error y conserva la cookie válida del servidor. Al recargar, `obtenerSesion()` recupera esa sesión sin solicitar credenciales. El usuario puede creer que cerró su cuenta cuando el siguiente usuario del equipo todavía puede recuperarla.

Reproducción con Chromium, cookies y servidor reales: iniciar sesión; interrumpir únicamente la petición de cierre; comprobar que aparece el formulario de acceso; restaurar la red y recargar. `/api/auth/yo` devuelve 200 y reaparece la interfaz autenticada sin introducir credenciales. La interrupción de red se inyectó en el navegador; no se simuló ninguna respuesta exitosa de Laravel.

Corrección recomendada: distinguir salida solicitada de salida confirmada, informar el fallo y evitar la recuperación automática de la cuenta anterior mientras no se complete el cierre o se exija autenticación explícita. No prometer revocación en el servidor durante una desconexión. Añadir regresión de cierre fallido seguido de recarga en el mismo navegador.

Evidencia: `docs/evidencias/revision-estado-2026-11-09/sesion.json`.

### P1 — Salir de una historia descarta cambios pendientes sin confirmación

Ubicaciones: `frontend/src/aplicacion/componentes/clinica/workspace/PatientContextBar.jsx:32`, `frontend/src/aplicacion/paginas/HistoriaClinicaApp.jsx:12` y `frontend/src/aplicacion/componentes/clinica/contexto/HistoriaClinicaContext.jsx:249`.

Los cambios pendientes permanecen en memoria. El botón «Volver a historias clínicas» navega directamente y desmonta el proveedor, que cancela el guardado pendiente. No hay una protección de salida que permita reintentar, permanecer en la ficha o confirmar que se desea descartar esos cambios.

Reproducción real: abrir una historia sintética, interrumpir sus escrituras, editar el motivo de consulta y esperar «No se pudo guardar». Pulsar «Volver a historias clínicas», restaurar la red y abrir la misma historia. No aparece confirmación de salida y el campo vuelve vacío: el cambio pendiente se perdió. El aviso de guardado fallido existe, pero la navegación sigue descartando el contenido.

Corrección recomendada: identificar cambios pendientes o guardados en curso y proteger la salida interna y la salida del navegador. En navegación controlada, ofrecer permanecer, reintentar o descartar explícitamente. Mantener la restricción de no guardar datos clínicos en `localStorage`.

Evidencia: `docs/evidencias/revision-estado-2026-11-09/cambios-pendientes.json`.

### P2 — El diagnóstico no comprueba las columnas de los índices únicos

Ubicación: `backend/app/Console/Commands/VerificarInstalacion.php:41`.

`clinica:verificar` comprueba el nombre del índice y `Non_unique=0`, pero no sus columnas. Por ello puede declarar correcta una instalación que no tenga la restricción de unicidad esperada sobre el número de historia. Esto limita su uso como control de aceptación de un despliegue.

Reproducción aislada: crear una copia temporal vacía de `historia_clinica` en `bd_clinica_undac_test`; sustituir únicamente en esa tabla el índice `uq_historia_numero` por otro del mismo nombre sobre `id_historia_clinica`. El comando devolvió código 0 y `aprobado`, aunque el índice ya no protegía `numero_historia`. La tabla temporal se descartó; no se retiró ninguna restricción de las tablas persistentes. Esta prueba demuestra un defecto del diagnóstico, no que el índice de la base clínica actual esté mal.

Corrección recomendada: comparar columnas, orden y carácter único contra la definición esperada de cada índice obligatorio; incorporar este caso negativo a las pruebas del diagnóstico.

Evidencia: `docs/evidencias/revision-estado-2026-11-09/diagnostico-indice.json`.

## Comprobaciones ejecutadas de nuevo

| Área | Resultado |
| --- | --- |
| Frontend `5173` | HTTP 200 |
| API `8001/up` | HTTP 200 |
| Proxy `/api/auth/yo` sin sesión | HTTP 401 esperado; sin conexión rechazada |
| Esquema de trabajo | 82 tablas, 3 vistas, 8 triggers; diagnóstico aprobado |
| Laravel / MySQL | 151 pruebas aprobadas, 1.076 aserciones |
| Frontend | 262 pruebas aprobadas, 33 archivos |
| Chromium y Firefox | 44 recorridos habituales aprobados en una ejecución conjunta |
| Casos exploratorios adicionales | Reproducidos los dos defectos de sesión y navegación; no son pruebas de aceptación aprobadas |
| Pint | Aprobado |
| Tokens | Aprobado; siete colores inventariados, ninguna capa numérica fuera de escala |
| Compilación | Aprobada; chunk clínico de 611,93 kB, 98,95 kB gzip; mantiene aviso de tamaño |
| Dependencias | Composer y npm sin vulnerabilidades informadas; requisitos de plataforma aprobados |

Los nuevos casos no están incluidos en las 44 pruebas habituales. Sus reproducciones quedaron en `tmp`, excluidas de Git; las evidencias versionables contienen únicamente resultados, sin cookies, credenciales ni registros clínicos. Conviene convertirlos en regresiones permanentes al corregirlos.

## Pendientes para producción

1. Resolver los dos defectos P1 y ampliar las regresiones; corregir el diagnóstico de índices.
2. Revisar y confirmar en Git todos los archivos de la versión candidata, incluidos los nuevos comandos, el inventario de estructura y el parche. El commit actual no representa por sí solo el estado completo probado.
3. Ejecutar CI remoto sobre esa versión candidata y validar las plantillas en el servidor definitivo. No se desplegó un servidor en esta revisión; producción continúa como plantilla por decisión del usuario.
4. Conciliar los borradores clínicos heredados de los navegadores y verificar el respaldo operativo de base y archivos antes del piloto.
5. Repetir la carga en el servidor representativo. No se volvió a ejecutar una campaña prolongada en esta revisión. La última campaña local continua guardada pasó con 40 usuarios e intervalo de 30 segundos: p95 de 558,8 ms en listado, 470,0 ms en lectura y 639,5 ms en autoguardado. Los humos de escrituras cada segundo excedieron umbrales y las campañas interrumpidas siguen excluidas de la referencia válida; no se considera certificada la capacidad de producción.

El siguiente trabajo prioritario es corregir sesión y salida con cambios pendientes, manteniendo las verificaciones de acceso del servidor y la persistencia confirmada.
