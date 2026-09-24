# Historia clínica en pantalla completa — Diseño

## Objetivo

Convertir la Historia Clínica en un espacio de trabajo independiente, con el máximo ancho disponible y sin elementos administrativos que distraigan al operador durante el registro clínico.

## Alcance acordado

1. Al abrir una Historia Clínica no se mostrará el sidebar general de módulos ni la cabecera global de la aplicación.
2. La cabecera clínica conservará solamente:
   - el control para regresar a Historias clínicas;
   - el control hamburguesa de los momentos clínicos;
   - los datos identificadores del paciente;
   - el nombre del operador responsable.
3. Se eliminarán de esa cabecera las alertas, el autoguardado, el progreso general, las notificaciones, el usuario autenticado y los badges informativos.
4. El bloque visual `Momento clínico N de 6` se eliminará desde el workspace compartido. Esto aplica a los seis momentos clínicos y a todas sus secciones.
5. Se conservará el encabezado de la sección activa —por ejemplo, `Datos del paciente` u `Odontograma digital`— porque identifica el formulario que se está editando.
6. El sidebar de momentos clínicos tendrá un botón hamburguesa visible en escritorio y móvil:
   - en escritorio estará abierto inicialmente y podrá contraerse para ampliar el formulario;
   - en móvil estará cerrado inicialmente y se abrirá como drawer superpuesto;
   - el botón expondrá `aria-expanded` y `aria-controls`;
   - Escape y el fondo superpuesto cerrarán el drawer móvil;
   - seleccionar un momento cerrará el drawer móvil, pero no contraerá el sidebar de escritorio.
7. Se eliminará el bloque `Ruta de ingreso` de la sección Datos del paciente, junto con sus imports y estilos exclusivos.

## Límites

- No se cambia la estructura de los datos clínicos, el contexto React, el autoguardado interno ni las rutas del backend.
- No se elimina el formulario de asignación/cambio de operador existente dentro de Datos del paciente.
- No se eliminan las pestañas o el selector de secciones que pertenecen a un mismo momento clínico.
- No se añaden dependencias.

## Criterios de aceptación

- Historia Clínica ocupa todo el ancho sin navegación general ni cabecera global.
- La cabecera visible contiene paciente, operador, regreso y hamburguesa; no contiene alertas, progreso, autoguardado, notificaciones ni usuario autenticado.
- Ninguno de los momentos 1 al 6 renderiza el encabezado redundante del momento clínico.
- El sidebar de los seis momentos se puede mostrar y ocultar con teclado o puntero en escritorio y móvil.
- El foco vuelve al botón hamburguesa al cerrar el drawer móvil y el contenido principal no queda operable detrás del overlay.
- `Ruta de ingreso del paciente` ya no aparece.
- Las pruebas de frontend y la compilación terminan correctamente.

