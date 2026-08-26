# Interfaz en español y vistas de módulos — Plan de implementación

> **Para ejecución:** usar `superpowers:executing-plans` y completar cada tarea con pruebas antes de avanzar. Los pasos usan casillas (`- [ ]`) para registrar el progreso.

**Objetivo:** Traducir la capa cliente React propia al español y crear una vista visual diferenciada para cada opción del menú lateral de administrador, docente y alumno operador.

**Arquitectura:** Laravel conserva sus nombres convencionales y sirve una vista Blade denominada `aplicacion`. React permanece montado desde `resources/js/app.js`; la aplicación usa estado local para pantalla, perfil y módulo activo. El catálogo `modulosPorPerfil.js` entrega datos demostrativos a composiciones reutilizables de listado, auditoría, agenda, configuración y recursos.

**Tecnologías:** Laravel 13, React 19, Vite 8, CSS modular, Lucide React, Vitest y Testing Library.

**Especificación:** `docs/superpowers/specs/2026-08-25-interfaz-espanol-vistas-modulos-design.md`

## Restricciones globales

- No agregar autenticación, API, base de datos, persistencia, rutas React, controladores, middleware, modelos, migraciones ni servicios.
- Mantener `resources/js/app.js`, `resources/css/app.css` y las carpetas convencionales de Laravel.
- Usar nombres en español para carpetas, archivos, componentes, variables, funciones y datos propios de React.
- Mantener `.test.jsx` porque es un sufijo técnico reconocido por Vitest.
- Todos los botones de módulos son visuales y usan `type="button"`.
- Conservar intacta la eliminación preexistente de `.idea/phpunit.xml`.

---

### Tarea 1: Traducir la estructura y los contratos existentes

**Archivos:**
- Crear: `composer/resources/js/aplicacion/Aplicacion.jsx`
- Crear: `composer/resources/js/aplicacion/paginas/PaginaAcceso.jsx`
- Crear: `composer/resources/js/aplicacion/disenos/DisenoPanel.jsx`
- Crear: `composer/resources/js/aplicacion/componentes/interfaz/*.jsx`
- Crear: `composer/resources/js/aplicacion/componentes/panel/*.jsx`
- Crear: `composer/resources/js/aplicacion/configuracion/panelesPorPerfil.js`
- Crear: `composer/resources/js/aplicacion/pruebas/*.test.jsx`
- Crear: `composer/resources/css/aplicacion/{variables,acceso,panel}.css`
- Crear: `composer/resources/views/aplicacion.blade.php`
- Modificar: `composer/resources/js/app.js`
- Modificar: `composer/resources/css/app.css`
- Modificar: `composer/routes/web.php`
- Eliminar después de verificar: `composer/resources/js/app/`, `composer/resources/css/app/` y `composer/resources/views/app.blade.php`

**Interfaces:**
- Produce `Aplicacion(): JSX.Element`.
- Produce `PaginaAcceso({ perfilSeleccionado, alCambiarPerfil, alIngresar })`.
- Produce `DisenoPanel({ barraLateral, children })`.
- Produce `PANELES_POR_PERFIL` con propiedades `etiqueta`, `persona`, `encabezado`, `accionPrincipal`, `navegacion`, `indicadores`, `actividades` y `accionesRapidas`.

- [ ] Escribir pruebas que importen los componentes con nombres españoles y verifiquen acceso, perfiles y estados.
- [ ] Ejecutar Vitest y confirmar el fallo por módulos inexistentes.
- [ ] Crear la estructura española conservando el comportamiento aprobado.
- [ ] Cambiar la entrada React, Blade, ruta e importaciones CSS.
- [ ] Ejecutar las pruebas enfocadas y confirmar que pasan.
- [ ] Buscar identificadores propios ingleses remanentes y corregirlos.

### Tarea 2: Crear el contrato de navegación entre módulos

**Archivos:**
- Crear: `composer/resources/js/aplicacion/configuracion/modulosPorPerfil.js`
- Crear: `composer/resources/js/aplicacion/paginas/PaginaPanel.jsx`
- Crear: `composer/resources/js/aplicacion/componentes/panel/BarraLateral.jsx`
- Crear: `composer/resources/js/aplicacion/pruebas/NavegacionModulos.test.jsx`

**Interfaces:**
- Produce `MODULOS_POR_PERFIL` con claves `administrador`, `docente` y `alumno`.
- Cada módulo expone `id`, `etiqueta`, `tipo`, `titulo`, `descripcion`, `accion`, `indicadores` y el contenido requerido por su composición.
- `BarraLateral({ elementos, moduloActivo, alSeleccionar, etiquetaPerfil })`.
- `PaginaPanel({ perfil, alCambiarPerfil, alCerrarSesion })` restablece `resumen` al cambiar de perfil.

- [ ] Escribir una prueba parametrizada que seleccione cada opción del sidebar y compruebe el título de su vista.
- [ ] Ejecutar la prueba y confirmar el fallo por falta del contrato.
- [ ] Definir los identificadores y metadatos completos de los 17 módulos.
- [ ] Implementar selección local, `aria-current="page"` y reinicio al cambiar de perfil.
- [ ] Ejecutar pruebas de navegación y cambio de perfil.

### Tarea 3: Construir las composiciones reutilizables de módulos

**Archivos:**
- Crear: `composer/resources/js/aplicacion/componentes/modulos/EncabezadoModulo.jsx`
- Crear: `composer/resources/js/aplicacion/componentes/modulos/BarraFiltros.jsx`
- Crear: `composer/resources/js/aplicacion/componentes/modulos/TablaRegistros.jsx`
- Crear: `composer/resources/js/aplicacion/componentes/modulos/PanelDistribucion.jsx`
- Crear: `composer/resources/js/aplicacion/componentes/modulos/CronologiaEventos.jsx`
- Crear: `composer/resources/js/aplicacion/componentes/modulos/AgendaSeguimientos.jsx`
- Crear: `composer/resources/js/aplicacion/componentes/modulos/PanelConfiguracion.jsx`
- Crear: `composer/resources/js/aplicacion/componentes/modulos/BibliotecaRecursos.jsx`
- Crear: `composer/resources/js/aplicacion/componentes/modulos/VistaModulo.jsx`
- Crear: `composer/resources/css/aplicacion/modulos.css`
- Crear: `composer/resources/js/aplicacion/pruebas/ComponentesModulos.test.jsx`

**Interfaces:**
- `VistaModulo({ modulo })` elige composición por `modulo.tipo`.
- `TablaRegistros({ columnas, filas })` usa claves españolas y genera bloques etiquetados en móvil.
- `BarraFiltros({ busqueda, filtros })` no almacena ni envía datos.
- Cronología, agenda, configuración y biblioteca consumen únicamente arreglos locales.

- [ ] Escribir pruebas semánticas para encabezado, tabla, cronología, configuración y recursos.
- [ ] Ejecutar las pruebas y confirmar que fallan por componentes inexistentes.
- [ ] Implementar componentes presentacionales reutilizables.
- [ ] Añadir estilos responsive y estados clínico, académico, neutro y alerta.
- [ ] Ejecutar las pruebas enfocadas.

### Tarea 4: Completar las vistas del administrador

**Archivos:**
- Modificar: `composer/resources/js/aplicacion/configuracion/modulosPorPerfil.js`
- Modificar: `composer/resources/js/aplicacion/pruebas/NavegacionModulos.test.jsx`

**Contenido requerido:**
- `usuarios-roles`: indicadores, filtros, tabla de usuarios y distribución de perfiles.
- `historias-clinicas`: indicadores, filtros y tabla clínica.
- `pacientes`: directorio, indicadores y próximas atenciones.
- `auditoria`: indicadores, filtros y cronología de eventos.
- `configuracion`: grupos visuales de identidad, clínica, notificaciones y seguridad.

- [ ] Añadir expectativas de título, acción y contenido distintivo de cada vista.
- [ ] Ejecutar las pruebas y confirmar los fallos de contenido.
- [ ] Completar datos demostrativos y composiciones del administrador.
- [ ] Ejecutar las pruebas y confirmar el catálogo completo.

### Tarea 5: Completar las vistas del docente y alumno

**Archivos:**
- Modificar: `composer/resources/js/aplicacion/configuracion/modulosPorPerfil.js`
- Modificar: `composer/resources/js/aplicacion/pruebas/NavegacionModulos.test.jsx`

**Contenido docente:** alumnos asignados, historias supervisadas, validaciones, seguimientos y auditoría académica.

**Contenido alumno:** mis historias clínicas, pacientes, seguimientos y recursos clínicos.

- [ ] Añadir expectativas de título, acción y contenido distintivo de las nueve vistas.
- [ ] Ejecutar las pruebas y confirmar los fallos de contenido.
- [ ] Completar datos y composiciones del docente.
- [ ] Completar datos y composiciones del alumno.
- [ ] Verificar que cada perfil muestre únicamente sus módulos.

### Tarea 6: Documentación y verificación integral

**Archivos:**
- Modificar: `composer/README.md`
- Modificar: `composer/resources/css/aplicacion/*.css` únicamente si la revisión visual detecta defectos.

- [ ] Documentar la estructura en español y aclarar que los módulos siguen siendo demostrativos.
- [ ] Ejecutar `pnpm test` y comprobar todas las suites.
- [ ] Ejecutar `pnpm run build` y comprobar la compilación de producción.
- [ ] Ejecutar PHP standalone con `artisan test` y comprobar las pruebas Laravel.
- [ ] Revisar en navegador acceso, listado, auditoría, configuración, agenda y recursos a 1440, 768, 390 y 320 píxeles.
- [ ] Verificar ausencia de desbordamiento horizontal y funcionamiento del menú móvil.
- [ ] Ejecutar `git diff --check` y revisar que no existan cambios de lógica o base de datos.
