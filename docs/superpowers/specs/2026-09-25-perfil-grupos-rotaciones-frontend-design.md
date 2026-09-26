# Perfil, grupos y rotaciones — diseño frontend

## Alcance

Implementar únicamente en frontend:

- corregir la superposición del selector de operador;
- crear una vista de perfil editable;
- crear la administración de cursos, grupos, membresías y rotaciones;
- conservar el historial entre periodos mediante `localStorage`;
- dejar preparada la información para futuras restricciones por cargo, sin implementarlas.

## Modelo

- **Curso:** código, nombre, descripción y estado.
- **Periodo:** código, nombre, fecha inicial, fecha final y estado.
- **Grupo:** código, nombre, ciclo o semestre y estado.
- **Membresía:** persona, grupo, función, vigencia y estado.
- **Rotación:** grupo, curso, periodo, fechas y estado.
- **Docente de rotación:** docente, rotación y función —responsable o colaborador—.
- **Asignación excepcional:** persona y rotación cuando alguien rota sin todo su grupo.

Las relaciones conservarán registros anteriores. Cambiar de periodo, curso o grupo no sobrescribirá el historial.

## Interfaz

### Perfil

Accesible desde el usuario de la cabecera. Permitirá editar nombres, correo y teléfono. Documento y roles serán informativos. Mostrará asignaciones actuales y un historial compacto por periodo, curso, grupo y vigencia.

### Sistema

El menú Sistema incluirá:

- **Grupos académicos:** listado con filtros por periodo, curso y estado; creación y edición.
- **Cursos:** catálogo básico reutilizable.

El detalle de un grupo tendrá bloques para integrantes, rotaciones y docentes. Los formularios permitirán múltiples estudiantes y múltiples docentes.

### Superposición

El diálogo de asignación del operador se renderizará con un portal en `document.body`. Así queda fuera del contexto de apilamiento creado por la cabecera `sticky` y su `backdrop-filter`.

## Estado y persistencia

Un servicio frontend centralizará lectura, validación y escritura de perfil, cursos, grupos, membresías y rotaciones en `localStorage`. Incluirá datos iniciales de demostración y versión del esquema. Las vistas no escribirán directamente en el almacenamiento.

## Navegación y permisos

- Perfil estará disponible para cualquier usuario autenticado.
- Cursos y grupos aparecerán inicialmente en Sistema para administración.
- No se implementarán todavía restricciones por cargo ni cambios backend.

## Errores

Los formularios validarán campos obligatorios, fechas coherentes y duplicados evidentes. Los fallos de almacenamiento se mostrarán en la misma vista sin cerrar el formulario ni perder la edición.

## Verificación

Pruebas esenciales, no exhaustivas:

- navegación a Perfil, Cursos y Grupos;
- edición y persistencia del perfil;
- creación de curso y grupo;
- asignación múltiple de estudiantes y docentes;
- conservación del historial al crear otra rotación;
- diálogo del operador montado fuera de la cabecera;
- compilación de producción.
