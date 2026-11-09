# Visibilidad de historias para profesionales

## Alcance confirmado

Los profesionales solo pueden consultar historias donde tienen una asignación clínica vigente en las relaciones existentes. El administrador conserva el acceso general. Los alumnos mantienen su restricción por asignación.

Se descartó ampliar el buscador y permitir nuevas asignaciones de profesionales como asistentes. No se modifican tablas, triggers, tipos de participación ni facultades de aprobación.

## Implementación

- Separar visibilidad restringida de las reglas de edición y aprobación que ya existían.
- Filtrar historias y pacientes según la cuenta y su identificador de persona, con asignaciones vigentes en historia_docente o historia_alumno.
- Aplicar la misma regla al acceso directo, expediente, seguimiento, archivos y odontograma mediante el control de acceso compartido.
- Retirar enlaces de avisos antiguos cuando el profesional pierde su asignación.
- Conservar la asignación automática del creador y las reglas actuales de supervisión dentro de historias autorizadas.

## Verificación

Las pruebas VisibilidadProfesionalTest ejecutan las consultas de acceso sobre SQLite en memoria sin usar los datos clínicos locales. Comprueban historias propias y ajenas, participantes existentes, asignaciones retiradas, pacientes, historias inactivas, acceso administrativo, edición autorizada y avisos anteriores.

La integración completa sobre MySQL sigue requiriendo bd_clinica_undac_test. Las pruebas históricas que operaban con un profesional no asignado deben pasar a asignarlo expresamente o comprobar el rechazo 404.
