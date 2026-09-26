# Actualización visual de vistas administrativas

## Alcance

Actualizar únicamente el frontend de **Grupos académicos**, **Permisos por usuario**, **Cursos** y la presentación de **Mi perfil**. Se conservan la navegación, los servicios, la persistencia local y las operaciones existentes.

## Criterio visual común

- Mantener el sidebar, la cabecera y la identidad cromática actuales de UNDAC.
- Usar paneles blancos, bordes suaves, acento turquesa y jerarquía tipográfica compacta.
- Aprovechar el ancho disponible sin estirar controles de búsqueda o filtros más de lo necesario.
- El texto de resumen de paginación tendrá un margen izquierdo de `4px`; el margen pertenece al texto, no al paginador completo.
- Los botones con icono y texto permanecerán en una sola fila.
- En escritorio se prioriza densidad y lectura horizontal; en móvil los bloques se apilan y pueden ocultarse detalles secundarios.

## Grupos académicos

La vista seguirá el patrón maestro–detalle de la referencia:

- columna izquierda con título, búsqueda, filtro de periodo, contador, tarjetas de grupos y paginación;
- panel principal con código, nombre, estado, periodo, número de estudiantes y rotaciones;
- acciones superiores para editar grupo, crear rotación y crear periodo;
- pestañas Resumen, Integrantes, Rotaciones, Docentes e Historial;
- Rotaciones se mostrará como tabla con periodo, curso, fechas, docentes, estudiantes, estado y acciones;
- los filtros de curso y estado dejan de ocupar una barra horizontal completa; la selección principal queda concentrada en la columna izquierda.

## Permisos por usuario

La vista seguirá el patrón de la segunda referencia:

- columna izquierda con búsqueda, filtro de rol, contador, listado paginado y usuario activo;
- panel derecho con resumen del usuario y acceso a su perfil;
- módulos presentados como acordeones, con contador y barra de permisos activos;
- el módulo abierto muestra interruptores en una cuadrícula de dos columnas;
- acciones Restaurar rol y Guardar cambios permanecen visibles al final del panel sin tapar contenido.

## Cursos

La tabla se sustituirá por una cuadrícula de tarjetas como la tercera referencia:

- búsqueda, filtro de estado y tamaño de página en una barra compacta;
- tres tarjetas por fila en escritorio, dos en tableta y una en móvil;
- cada tarjeta muestra código, nombre, descripción, estado, número de rotaciones y fecha de actualización cuando exista;
- el botón Editar conserva icono y texto en una sola fila;
- resumen y controles de paginación se ubican en un pie común.

## Perfil

Mi perfil seguirá siendo una página, no una ventana superpuesta. Tendrá identidad y rol en un bloque compacto, formulario editable sin solapamientos y asignaciones académicas debajo. El acceso “Ver perfil” desde Permisos por usuario reutilizará esta ruta.

## Verificación

Se añadirán pruebas esenciales de estructura e interacción y se validarán las vistas en escritorio y móvil. No se requieren pruebas exhaustivas ni cambios backend.
