# Administration Views Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer que Grupos académicos, Permisos por usuario, Cursos y Mi perfil reproduzcan la composición de las referencias aprobadas, sin cambiar sus datos ni servicios.

**Architecture:** Mantener los contenedores React actuales y separar únicamente las piezas visuales que tienen responsabilidades claras: selector de usuarios, editor de permisos y tarjetas de cursos. Reutilizar `Paginacion`, el repositorio académico local y los servicios de administración; CSS específico de cada vista controlará escritorio y responsive sin modificar el shell global.

**Tech Stack:** React 19, Vite, Vitest, Testing Library, Lucide React y CSS existente.

**Spec:** `docs/superpowers/specs/2026-09-26-administration-views-visual-refresh-design.md`

## Global Constraints

- Solo frontend; no crear ni modificar endpoints, tablas o migraciones.
- Conservar las operaciones y datos actuales de cursos, grupos, rotaciones, perfiles y permisos.
- Mantener sidebar, cabecera e identidad visual UNDAC.
- Aplicar `margin-left: 4px` al texto del resumen de paginación, no al contenedor.
- Evitar métricas, textos y paneles que no aparecen en las referencias.
- Añadir pruebas esenciales, no exhaustivas.
- Mantener botones con icono y texto en una sola fila.

## Review Focus

- Una lista con un solo grupo o usuario conserva margen y alineación sin controles pegados al borde; probar en Tasks 1 y 2.
- Nombres, correos y descripciones largas se truncan o envuelven sin desbordar sus paneles; probar en Tasks 2, 3 y 4.
- Un módulo con muchos permisos se desplaza sin quedar oculto bajo las acciones; probar en Task 3.
- Entre 320 px y 767 px las columnas se apilan y las acciones siguen siendo utilizables; comprobar en Tasks 2–5.
- Un botón con icono y texto no se divide aunque la tarjeta o celda sea estrecha; probar en Tasks 1 y 4.

---

### Task 1: Paginación y acciones compartidas

**Files:**
- Modify: `frontend/src/aplicacion/componentes/interfaz/Paginacion.jsx`
- Modify: `frontend/src/aplicacion/componentes/interfaz/Paginacion.test.jsx`
- Keep: `frontend/src/aplicacion/componentes/interfaz/BotonMini.test.jsx`
- Modify: `frontend/src/css/aplicacion/panel.css`
- Modify: `frontend/src/css/aplicacion/claude-vistas.css`

**Interfaces:**
- Consumes: `Paginacion({ elementos, tamanos, inicial, etiqueta, children })`.
- Produces: elemento `.hc-pagination__summary` para el texto `Mostrando …`; `.hc-mini-button` horizontal y sin salto.

- [ ] **Step 1: Escribir la prueba fallida** en `Paginacion.test.jsx` que identifica el resumen por texto, comprueba la clase `hc-pagination__summary` y, con el CSS real importado, espera `margin-left: 4px`; mantener la prueba que espera `display: inline-flex` y `white-space: nowrap` para `.hc-mini-button`.
- [ ] **Step 2: Ejecutar** `npm test -- --run src/aplicacion/componentes/interfaz/Paginacion.test.jsx src/aplicacion/componentes/interfaz/BotonMini.test.jsx`; debe fallar porque el resumen no tiene clase ni margen propio.
- [ ] **Step 3: Implementar** el `span.hc-pagination__summary`, aplicar únicamente su margen izquierdo y conservar el layout horizontal del botón mini.
- [ ] **Step 4: Repetir la prueba dirigida**; debe pasar con 0 fallos.
- [ ] **Step 5: Commit** `fix: align pagination summary and compact actions`.

### Task 2: Grupos académicos maestro–detalle

**Files:**
- Modify: `frontend/src/aplicacion/formularios/grupos-academicos/GruposAcademicosApp.jsx`
- Create: `frontend/src/aplicacion/formularios/grupos-academicos/ListaGrupos.jsx`
- Create: `frontend/src/aplicacion/formularios/grupos-academicos/TablaRotacionesGrupo.jsx`
- Modify: `frontend/src/css/aplicacion/claude-vistas.css`
- Test: `frontend/src/aplicacion/pruebas/Aplicacion.test.jsx`

**Interfaces:**
- Consumes: el estado actual `{ grupos, periodos, cursos, membresias, rotaciones, docentesRotacion, personas }` y las operaciones existentes de edición/creación.
- Produces: `ListaGrupos({ grupos, periodos, periodoId, busqueda, grupoId, onPeriodoChange, onBusquedaChange, onSelect })` y `TablaRotacionesGrupo({ estado, grupo })`.

- [ ] **Step 1: Escribir la prueba fallida** que navega a Grupos académicos y comprueba que búsqueda, periodo, contador y lista están dentro del `aside` “Lista de grupos”; al seleccionar un grupo debe mostrar encabezado, cinco pestañas y una tabla con Curso, Periodo, Fechas, Docentes, Estudiantes, Estado y Acciones.
- [ ] **Step 2: Añadir al mismo test** un grupo con nombre largo y una sola página; esperar que el contador siga visible y que la selección continúe operativa.
- [ ] **Step 3: Ejecutar** `npm test -- --run src/aplicacion/pruebas/Aplicacion.test.jsx`; debe fallar porque los filtros aún están en una barra horizontal externa y Rotaciones usa la composición anterior.
- [ ] **Step 4: Implementar** la columna izquierda de `300px`–`340px`, mover búsqueda y periodo dentro de ella, crear el encabezado de detalle y renderizar la tabla de rotaciones con los datos existentes. Mantener Integrantes, Docentes e Historial detrás de sus pestañas actuales.
- [ ] **Step 5: Añadir CSS responsive**: dos columnas desde `901px`; una columna por debajo, lista horizontal/colapsable y acciones con `flex-wrap` sin desbordes.
- [ ] **Step 6: Repetir la prueba dirigida**; debe pasar.
- [ ] **Step 7: Commit** `feat: redesign academic groups master detail view`.

### Task 3: Permisos por usuario con lista y editor modular

**Files:**
- Modify: `frontend/src/aplicacion/formularios/permisos-usuarios/PermisosUsuariosApp.jsx`
- Create: `frontend/src/aplicacion/formularios/permisos-usuarios/ListaUsuariosPermisos.jsx`
- Create: `frontend/src/aplicacion/formularios/permisos-usuarios/EditorPermisosUsuario.jsx`
- Modify: `frontend/src/css/aplicacion/panel.css`
- Modify: `frontend/src/css/aplicacion/claude-vistas.css`
- Test: `frontend/src/aplicacion/pruebas/Administracion.test.jsx`

**Interfaces:**
- Consumes: `listarUsuarios()`, `obtenerPermisosUsuario(id)`, `guardarPermisosUsuario(id, permisos)` y `restaurarPermisosUsuario(id)`.
- Produces: `ListaUsuariosPermisos({ usuarios, seleccionadoId, busqueda, rol, onBusquedaChange, onRolChange, onSelect })` y `EditorPermisosUsuario({ usuario, catalogo, delRol, efectivos, onToggle, onRestore, onSave, guardando })`.

- [ ] **Step 1: Escribir la prueba fallida** que carga usuarios, filtra por rol, cambia el usuario activo y comprueba que el panel derecho actualiza nombre, rol y módulos.
- [ ] **Step 2: Escribir la prueba fallida** que abre un módulo, cambia un interruptor real, guarda y comprueba el arreglo enviado a `guardarPermisosUsuario`; añadir un catálogo largo y verificar que el footer no pertenece al contenedor desplazable de módulos.
- [ ] **Step 3: Ejecutar** `npm test -- --run src/aplicacion/pruebas/Administracion.test.jsx`; debe fallar porque la jerarquía actual usa tarjetas/resúmenes y casillas con la composición anterior.
- [ ] **Step 4: Implementar** la lista izquierda paginada y el resumen compacto del usuario. El botón “Ver perfil” navegará a `perfil` mediante el callback existente de la aplicación.
- [ ] **Step 5: Implementar** acordeones con `activos/total`, barra de progreso e interruptores de permisos en dos columnas; conservar restaurar y guardar sin cambiar los servicios.
- [ ] **Step 6: Añadir CSS responsive**: columna de usuarios de `300px`–`340px` en escritorio, apilada en móvil; footer de acciones visible sin cubrir permisos; truncado de nombre/correo largos.
- [ ] **Step 7: Repetir la prueba dirigida**; debe pasar.
- [ ] **Step 8: Commit** `feat: redesign per-user permissions workspace`.

### Task 4: Cursos en cuadrícula de tarjetas

**Files:**
- Modify: `frontend/src/aplicacion/formularios/cursos/CursosApp.jsx`
- Create: `frontend/src/aplicacion/formularios/cursos/CursoCard.jsx`
- Modify: `frontend/src/css/aplicacion/claude-vistas.css`
- Test: `frontend/src/aplicacion/pruebas/Aplicacion.test.jsx`

**Interfaces:**
- Consumes: cursos y rotaciones de `obtenerEstadoAcademico()`, más los diálogos actuales de creación/edición.
- Produces: `CursoCard({ curso, rotaciones, onEdit })` dentro de una cuadrícula responsive.

- [ ] **Step 1: Escribir la prueba fallida** que navega a Cursos y espera una región/lista de tarjetas con código, nombre, descripción, estado, rotaciones y botón Editar; buscar un curso debe reducir las tarjetas visibles.
- [ ] **Step 2: Añadir una descripción larga** y comprobar que la tarjeta conserva el botón accesible; el estilo computado del botón debe mantener icono y texto en una sola fila.
- [ ] **Step 3: Ejecutar** `npm test -- --run src/aplicacion/pruebas/Aplicacion.test.jsx src/aplicacion/componentes/interfaz/BotonMini.test.jsx`; debe fallar porque la vista actual usa tabla.
- [ ] **Step 4: Implementar** la barra compacta con búsqueda, estado y tamaño de página, y `CursoCard` con tres columnas en escritorio, dos en tableta y una en móvil.
- [ ] **Step 5: Colocar** resumen y controles en el pie de la cuadrícula usando `Paginacion`; no duplicar contadores fuera del componente.
- [ ] **Step 6: Repetir la prueba dirigida**; debe pasar.
- [ ] **Step 7: Commit** `feat: present courses as responsive cards`.

### Task 5: Perfil y navegación desde permisos

**Files:**
- Modify: `frontend/src/aplicacion/formularios/perfil/PerfilApp.jsx`
- Modify: `frontend/src/aplicacion/formularios/permisos-usuarios/PermisosUsuariosApp.jsx`
- Modify: `frontend/src/aplicacion/Aplicacion.jsx`
- Modify: `frontend/src/css/aplicacion/claude-vistas.css`
- Test: `frontend/src/aplicacion/pruebas/Aplicacion.test.jsx`

**Interfaces:**
- Consumes: ruta `perfil`, `actualizarPerfil(datos)` y datos académicos actuales.
- Produces: navegación `onNavigate('perfil')` desde “Ver perfil” y una página de perfil sin modal ni superposición.

- [ ] **Step 1: Escribir la prueba fallida** que pulsa “Ver perfil” desde Permisos, espera la ruta/vista “Mi perfil”, comprueba que no existe `role="dialog"`, edita teléfono y guarda.
- [ ] **Step 2: Ejecutar** `npm test -- --run src/aplicacion/pruebas/Aplicacion.test.jsx`; debe fallar porque Permisos aún no ofrece ese enlace integrado.
- [ ] **Step 3: Implementar** la navegación y compactar la identidad, formulario y asignaciones del perfil con la misma jerarquía visual de las nuevas vistas.
- [ ] **Step 4: Añadir CSS responsive** para una sola columna en móvil y evitar cualquier solapamiento con la cabecera.
- [ ] **Step 5: Repetir la prueba dirigida**; debe pasar.
- [ ] **Step 6: Commit** `fix: align profile page with administration views`.

### Task 6: Verificación integral y revisión visual

**Files:**
- Modify only if verification finds a regression in files already listed above.

**Interfaces:**
- Consumes: entregables de Tasks 1–5.
- Produces: frontend compilable y vistas verificadas en escritorio y móvil.

- [ ] **Step 1: Ejecutar** `npm test`; debe terminar con 0 pruebas fallidas. Si aparece un fallo no relacionado y preexistente, documentarlo por nombre antes de continuar.
- [ ] **Step 2: Ejecutar** `npm run build`; debe terminar con código 0.
- [ ] **Step 3: Revisar visualmente** `#/grupos-academicos`, `#/permisos-usuarios`, `#/cursos` y `#/perfil` a `1920×1080`, `1366×768` y `390×844`.
- [ ] **Step 4: Confirmar** que el resumen paginado tiene 4px de margen izquierdo, los filtros no se estiran, no hay scroll horizontal y los botones con icono/texto no se dividen.
- [ ] **Step 5: Commit** cualquier ajuste de verificación como `fix: polish responsive administration views`.
