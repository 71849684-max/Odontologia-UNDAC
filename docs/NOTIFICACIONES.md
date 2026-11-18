# Notificaciones del equipo clínico

Protección contra repetición: durante 10 minutos, un mismo destinatario recibe un único aviso por tipo, título, historia y sección. Las repeticiones actualizan su mensaje sin modificar su fecha ni devolverlo a «sin leer». Una observación y una validación se conservan como eventos separados. Después de la ventana puede generarse otro aviso. No se eliminan las trazas de auditoría ni los avisos históricos anteriores a esta protección.

Las rutas de asignación y cambio de estado admiten hasta 6 solicitudes por minuto para una misma cuenta e historia, y 30 por minuto por cuenta entre todas las historias. Al superar el límite se responde 429 con un mensaje en español y la cabecera `Retry-After`. Este límite no se aplica al autoguardado del expediente.

La campana consulta avisos persistidos para el tipo de cuenta y el identificador de la persona autenticada. Marcar un aviso como leído exige ser su destinatario. No se envían correos ni mensajes externos.

- Una nueva asignación avisa al asistente o profesional seleccionado; repetir la asignación vigente no crea otro aviso.
- Reemplazar al responsable también avisa a la persona saliente, con el código de la historia y el autor del cambio. Este aviso no abre el expediente, pues la asignación anterior ya terminó.
- Enviar una sección o historia a revisión avisa a sus profesionales encargados o supervisores.
- Observar o validar una historia avisa a sus asistentes asignados.
- Aprobar una sección, o devolverla a edición por un profesional, avisa a los asistentes con un enlace a esa sección.

El autor no recibe un aviso por su propia acción. Los eventos se generan desde la implementación de esta funcionalidad; no se reconstruyen acciones anteriores. Los mensajes identifican la historia y la sección sin copiar información clínica sensible ni el texto de las observaciones.

La interfaz actualiza los avisos al abrir la campana, recuperar el foco y cada 30 segundos mientras la pestaña esté visible. Se pueden marcar individualmente o todos como leídos. Al abrir un aviso se navega a su historia; el servidor sigue verificando los permisos de acceso. Los fallos de carga o lectura se muestran sin borrar los avisos ya cargados.

Si una asignación termina, todos los avisos antiguos del asistente sobre esa historia pierden su enlace de navegación. El historial del aviso permanece legible. Una respuesta 401, 403 o 404 al cargar o guardar el expediente bloquea la vista, vacía los datos en memoria y elimina el borrador local de esa historia; no se continúa editando una copia local. La vista clínica vuelve a comprobar el acceso al recuperar el foco y cada 30 segundos. El servidor verifica de nuevo la asignación bajo el bloqueo de la historia antes de escribir el expediente o el odontograma, además del middleware de las rutas.

Pruebas: `frontend/src/aplicacion/componentes/interfaz/notificaciones.test.jsx` y `backend/tests/Integration/NotificacionesTest.php`. Las pruebas de integración requieren la base exclusiva `bd_clinica_undac_test`.
