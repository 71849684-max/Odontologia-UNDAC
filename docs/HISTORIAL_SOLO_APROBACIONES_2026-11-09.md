# Historial de documentos por aprobación

El historial crea una versión únicamente al pasar una sección a **aprobada** por un profesional con COP y acceso vigente. Cada versión conserva solo la sección aprobada, sus adjuntos, el profesional, la fecha y las huellas de integridad.

- Autoguardar, enviar a revisión, reabrir, cargar adjuntos y editar el odontograma no crean versiones del historial.
- Reenviar un estado que ya está aprobado tampoco crea otra versión.
- Una solicitud que aprueba varias secciones crea una versión independiente para cada sección.
- Al reabrir, la versión aprobada permanece intacta. La siguiente aprobación conserva una nueva versión con las correcciones.
- Los guardados ordinarios siguen persistiendo los datos clínicos. Las acciones y los motivos de reapertura continúan en Auditoría.
- Las decisiones del paciente se conservan en el consentimiento y en su evento de auditoría, incluidos motivo y constancias, sin generar una copia adicional en el historial de documentos.

Las versiones antiguas no se borran ni se modifican. El listado identifica cuáles correspondieron a una aprobación comparando los estados históricos y omite los autoguardados. La exportación completa mantiene toda la cadena anterior para comprobar su integridad.

La exportación incluye también todos los documentos de consentimiento, sus cláusulas y firmas, y sus decisiones registradas en auditoría, para conservarlos aunque ya no produzcan versiones del historial.

No requiere cambios de esquema. Para las aprobaciones con adjuntos, la respuesta devuelve la revisión final después de vincular la versión, evitando que la siguiente operación use una revisión obsoleta.

Validación: 168 pruebas del backend, 277 del frontend y 7 recorridos en Chrome. Se comprobaron las aprobaciones por sección, los registros antiguos, la integridad al reabrir, los adjuntos anteriores y la exportación de consentimientos sin crear versiones adicionales. Compilación, tokens y estilo PHP correctos.
