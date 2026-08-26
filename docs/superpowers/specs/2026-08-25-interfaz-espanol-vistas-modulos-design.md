# Diseño de interfaz en español y vistas de módulos — Odontología UNDAC

Fecha: 25 de agosto de 2026

## Objetivo

Reorganizar la capa cliente React de Odontología UNDAC para que sus nombres
propios estén en español y diseñar una vista visual diferenciada para cada
opción del menú lateral de los perfiles administrador, docente y alumno
operador.

La entrega continúa siendo estrictamente presentacional. No incorpora
autenticación, rutas de frontend, solicitudes HTTP, permisos, persistencia,
controladores, modelos, migraciones ni reglas clínicas.

## Convención de idioma

Los nombres controlados por el proyecto estarán en español:

- Carpetas de React: `componentes`, `configuracion`, `disenos`, `paginas` y
  `pruebas`.
- Archivos y componentes: `Aplicacion`, `PaginaAcceso`, `PaginaPanel`,
  `BarraLateral`, `TarjetaIndicador` y equivalentes.
- Variables, propiedades, funciones, identificadores de datos, comentarios y
  textos de pruebas.
- Hojas de estilo propias: `variables.css`, `acceso.css`, `panel.css` y
  `modulos.css`.
- Vista Blade propia: `aplicacion.blade.php`.

Se mantienen sin traducir los nombres exigidos o establecidos por las
convenciones de las herramientas:

- Estructura Laravel: `app`, `bootstrap`, `config`, `database`, `public`,
  `resources`, `routes`, `storage`, `tests` y `vendor`.
- Entradas y manifiestos: `app.js`, `app.css`, `package.json`,
  `vite.config.js`, `composer.json` y `index.php`.
- Sufijos reconocidos por Vitest, como `.test.jsx`.
- Propiedades nativas de React, JavaScript, HTML y ARIA.

## Arquitectura seleccionada

Se adopta un diseño híbrido. Cada familia de trabajo tiene una composición
visual específica, mientras que tarjetas, filtros, tablas, estados, botones y
encabezados se reutilizan.

`Aplicacion` mantiene únicamente el perfil y la pantalla demostrativa.
`PaginaPanel` mantiene el módulo activo del menú lateral. El cambio de perfil
restablece el módulo activo a `resumen`. `BarraLateral` entrega el identificador
del módulo seleccionado y no cambia la URL.

Los datos se organizan en dos configuraciones locales:

- `panelesPorPerfil.js`: identidad, navegación, indicadores, actividad y
  acciones rápidas de cada perfil.
- `modulosPorPerfil.js`: contenido demostrativo y tipo de composición para
  cada módulo.

No se usará React Router porque las vistas no representan todavía rutas reales.
Tampoco se usará almacenamiento local; al recargar se volverá al acceso.

## Estructura propuesta

```text
resources/
├── css/
│   ├── app.css
│   └── aplicacion/
│       ├── acceso.css
│       ├── modulos.css
│       ├── panel.css
│       └── variables.css
├── js/
│   ├── app.js
│   └── aplicacion/
│       ├── Aplicacion.jsx
│       ├── componentes/
│       │   ├── interfaz/
│       │   ├── modulos/
│       │   └── panel/
│       ├── configuracion/
│       │   ├── modulosPorPerfil.js
│       │   └── panelesPorPerfil.js
│       ├── disenos/
│       │   └── DisenoPanel.jsx
│       ├── paginas/
│       │   ├── PaginaAcceso.jsx
│       │   └── PaginaPanel.jsx
│       └── pruebas/
└── views/
    └── aplicacion.blade.php
```

La carpeta `composer/app/` continúa reservada para PHP y el backend Laravel.

## Modelo de navegación visual

Cada opción del menú tendrá un identificador estable, una etiqueta visible y
un tipo de composición. El módulo activo se mostrará con el mismo lenguaje de
selección turquesa del resumen actual.

El encabezado del área central cambiará según el módulo e incluirá:

- Ruta contextual del perfil.
- Título y descripción breve.
- Acción principal únicamente visual.
- Controles locales de búsqueda o filtro cuando aporten claridad.

Los botones de crear, revisar, exportar, filtrar, guardar o abrir registros no
ejecutarán operaciones reales. Se conservarán como controles `type="button"`.

## Vistas del administrador

### Resumen

Conserva los indicadores generales, actividad reciente y accesos rápidos ya
aprobados.

### Usuarios y roles

- Indicadores de usuarios activos, docentes, alumnos y accesos pendientes.
- Buscador visual y filtros por rol y estado.
- Tabla con nombre, correo, rol, último acceso y estado.
- Acción principal `Registrar usuario`.
- Bloque lateral con distribución de perfiles.

### Historias clínicas

- Indicadores de historias activas, en revisión, completas e incompletas.
- Filtros por estado, responsable y fecha.
- Tabla con código, paciente, operador, docente, actualización y estado.
- Acción principal `Nueva historia clínica`.

### Pacientes

- Indicadores de pacientes registrados, nuevos del mes, con seguimiento y
  pendientes de actualización.
- Directorio visual con documento, contacto, última atención y responsable.
- Acción principal `Registrar paciente`.
- Panel de próximas atenciones.

### Auditoría

- Resumen de accesos, modificaciones, validaciones y alertas.
- Cronología de eventos con usuario, acción, módulo, fecha y criticidad.
- Filtros visuales por evento y perfil.
- Acción principal `Exportar reporte`.

### Configuración

- Secciones de identidad institucional, parámetros clínicos, notificaciones y
  seguridad.
- Campos, selectores e interruptores presentacionales.
- Aviso claro de que los cambios son demostrativos.
- Acción principal `Guardar configuración` sin persistencia.

## Vistas del docente

### Resumen

Conserva indicadores de supervisión, actividad reciente y accesos rápidos.

### Alumnos asignados

- Indicadores de alumnos activos, en clínica, con pendientes y al día.
- Tabla con alumno, código, ciclo, historias, progreso y estado.
- Panel visual de avance de la cohorte.
- Acción principal `Ver distribución`.

### Historias supervisadas

- Bandeja de historias con paciente, alumno, etapa clínica, última edición y
  prioridad.
- Filtros por alumno, estado y prioridad.
- Acción principal `Revisar siguiente`.
- Resumen lateral de carga de revisión.

### Validaciones

- Cola visual separada en diagnósticos, planes, consentimientos y cierres.
- Tabla de solicitudes con tiempo en espera y prioridad.
- Indicadores académicos en dorado para elementos pendientes.
- Acción principal `Iniciar revisión`.

### Seguimientos

- Agenda semanal demostrativa.
- Lista de controles próximos con paciente, alumno, fecha y motivo.
- Indicadores de hoy, esta semana, reprogramados y vencidos.
- Acción principal `Programar seguimiento`.

### Auditoría académica

- Indicadores de revisiones, observaciones, firmas y cumplimiento.
- Tabla por alumno con historias evaluadas, observaciones y porcentaje.
- Cronología de intervenciones docentes.
- Acción principal `Generar informe`.

## Vistas del alumno operador

### Resumen

Conserva indicadores personales, actividad reciente y accesos rápidos.

### Mis historias clínicas

- Indicadores de historias activas, por validar, completas e incompletas.
- Tabla con paciente, etapa, docente, actualización y estado.
- Barra visual de progreso por historia.
- Acción principal `Nueva historia clínica`.

### Pacientes

- Directorio limitado visualmente a pacientes asignados.
- Indicadores de activos, nuevos, con control y sin atención reciente.
- Próximas citas y recordatorios clínicos.
- Acción principal `Registrar paciente`.

### Seguimientos

- Agenda personal de controles.
- Lista de tareas clínicas con fecha, paciente, tipo y estado.
- Avisos visuales para seguimientos vencidos o próximos.
- Acción principal `Registrar control`.

### Recursos clínicos

- Biblioteca de protocolos, formatos, guías y material académico.
- Tarjetas por categoría con tipo, fecha y disponibilidad.
- Buscador y filtros presentacionales.
- Bloque de recursos destacados.
- Acción principal `Explorar biblioteca`.

## Componentes reutilizables

- `EncabezadoModulo`: título, ruta contextual, descripción y acción.
- `BarraFiltros`: buscador y selectores configurables.
- `TablaRegistros`: tabla adaptable con columnas y filas locales.
- `TarjetaIndicador`: cifra, etiqueta, tono e icono.
- `PanelDistribucion`: barras de progreso y resumen lateral.
- `CronologiaEventos`: eventos de auditoría o supervisión.
- `AgendaSeguimientos`: agenda y controles próximos.
- `PanelConfiguracion`: grupos de campos e interruptores visuales.
- `BibliotecaRecursos`: tarjetas académicas y categorías.
- `EstadoVacio`, `EstadoCarga`, `EstadoError` y
  `DialogoSesionExpirada`: estados comunes en español.

## Adaptabilidad

- Escritorio: sidebar fijo, área principal amplia y paneles secundarios en una
  columna complementaria.
- Tablet: sidebar desplegable y cuadrículas de dos columnas.
- Móvil: una columna, filtros apilados y tablas convertidas en bloques con
  etiquetas visibles.
- Ninguna vista tendrá desplazamiento horizontal a 320 píxeles.
- Al cambiar de pantalla se restablecerá el desplazamiento vertical.
- El menú móvil conservará cierre por botón y por fondo sombreado.

## Accesibilidad

- Todos los módulos tendrán un único `h1` descriptivo.
- Navegación lateral con `aria-current="page"` en el módulo activo.
- Controles con etiquetas visibles o nombres accesibles.
- Tablas con encabezados semánticos o roles equivalentes.
- Estados de foco visibles y contraste coherente con la identidad aprobada.
- El color no será el único medio para representar un estado.
- Se respetará `prefers-reduced-motion`.

## Estrategia de pruebas

- Verificar que todos los nombres propios de archivos y carpetas React estén en
  español, exceptuando nombres técnicos documentados.
- Verificar que cada perfil muestre exactamente sus módulos autorizados para la
  demostración.
- Recorrer cada elemento de la barra lateral y comprobar el título y la acción
  principal de su vista.
- Verificar que cambiar de perfil restablezca el módulo a `Resumen`.
- Mantener las pruebas del acceso, cambio de perfil, salida y estados visuales.
- Ejecutar la suite completa de Vitest, la compilación Vite y las pruebas
  existentes de Laravel.
- Revisar en navegador las vistas representativas de listado, auditoría,
  configuración, agenda y recursos a 1440, 768, 390 y 320 píxeles.

## Exclusiones

- Rutas reales por módulo o React Router.
- Operaciones CRUD, formularios persistentes o validación de negocio.
- Autorización por rol y ocultamiento seguro de datos.
- Integración con historias clínicas reales, pacientes o usuarios.
- Descarga o generación real de informes.
- Calendarios interactivos, carga de archivos o visualización documental.
- Odontograma y cualquier lógica tomada de `ClinicaRamos.rar`.

## Criterios de aceptación

- La capa React propia utiliza nombres en español de manera consistente.
- Todas las opciones del sidebar abren una vista visual diferenciada.
- Administrador, docente y alumno disponen únicamente de las vistas definidas
  para su demostración.
- El cambio de perfil y el cierre de sesión continúan funcionando localmente.
- La identidad institucional clínica y académica permanece consistente.
- Las vistas son utilizables sin desbordamiento horizontal desde 320 píxeles.
- No se añade lógica de autenticación, API, base de datos ni persistencia.
- Pruebas de componentes, compilación Vite y pruebas Laravel finalizan sin
  errores.
