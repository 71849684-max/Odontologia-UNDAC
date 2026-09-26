# Perfil, grupos y rotaciones — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el frontend de perfil, cursos, grupos académicos y rotaciones históricas, y corregir la superposición del selector de operador.

**Architecture:** Un repositorio frontend versionado será la única capa que acceda a `localStorage`. Las vistas consumirán ese repositorio y el enrutador actual; las relaciones entre personas, grupos, cursos, periodos y rotaciones conservarán vigencia e historial. El selector de operador saldrá del contexto visual de la cabecera mediante un portal.

**Tech Stack:** React 19, Vite, Vitest, Testing Library, CSS existente y `localStorage`.

**Spec:** `docs/superpowers/specs/2026-09-25-perfil-grupos-rotaciones-frontend-design.md`

## Global Constraints

- Solo frontend; no crear endpoints, tablas ni migraciones backend.
- Persistir perfil y estructura académica en `localStorage` con datos iniciales de demostración.
- Conservar asignaciones históricas; una rotación nueva no modifica las anteriores.
- No implementar todavía restricciones por cargo.
- Evitar paneles, métricas o textos redundantes.
- Añadir únicamente pruebas esenciales.

## Review Focus

- Un almacenamiento corrupto recupera el estado inicial sin bloquear la aplicación; probar en Task 2.
- Códigos duplicados de curso o grupo se rechazan sin sobrescribir registros; probar en Task 2.
- Una rotación con fecha final anterior a la inicial se rechaza; probar en Task 2.
- Una persona puede conservar asignaciones históricas, pero no duplicarse en la misma rotación activa; probar en Task 2.
- Un usuario sin datos opcionales puede abrir y guardar su perfil sin romper la vista; probar en Task 3.

---

### Task 1: Selector de operador mediante portal

**Files:**
- Create: `frontend/src/aplicacion/componentes/clinica/workspace/OperatorAssignmentDialog.jsx`
- Modify: `frontend/src/aplicacion/componentes/clinica/workspace/PatientContextBar.jsx`
- Test: `frontend/src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx`

**Interfaces:**
- Consumes: `useModalDialog(open, onClose, triggerRef)` y `BusquedaPersonal`.
- Produces: `OperatorAssignmentDialog({ open, value, meta, fecha, triggerRef, onSelect, onClose })` montado en `document.body`.

- [ ] **Step 1: Escribir la prueba fallida** que abre “Cambiar asignación” y comprueba que el diálogo pertenece a un overlay cuyo padre es `document.body`.
- [ ] **Step 2: Ejecutar** `npx vitest run src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx --reporter=dot`; debe fallar porque el diálogo sigue dentro de la cabecera.
- [ ] **Step 3: Implementar** `OperatorAssignmentDialog` con `createPortal`, manteniendo Escape, foco, cancelación y selección ya existentes.
- [ ] **Step 4: Repetir la prueba** y comprobar que pasa.
- [ ] **Step 5: Commit** `fix: render operator dialog outside sticky header`.

### Task 2: Repositorio académico local

**Files:**
- Create: `frontend/src/aplicacion/servicios/repositorioAcademicoLocal.js`
- Create: `frontend/src/aplicacion/servicios/repositorioAcademicoLocal.test.js`

**Interfaces:**
- Produces: `obtenerEstadoAcademico()`, `actualizarPerfil(datos)`, `crearCurso(datos)`, `crearGrupo(datos)`, `guardarMembresias(grupoId, membresias)`, `crearRotacion(datos)` y `guardarDocentesRotacion(rotacionId, docentes)`.
- Estado: `{ version, perfil, personas, cursos, periodos, grupos, membresias, rotaciones, docentesRotacion }`.
- Errores de dominio: `{ codigo, mensaje }` para `DUPLICADO`, `FECHAS_INVALIDAS`, `ASIGNACION_DUPLICADA` y `ALMACENAMIENTO`.

- [ ] **Step 1: Escribir pruebas fallidas** para inicialización, recuperación ante JSON corrupto, persistencia del perfil, duplicados, fechas inválidas, historial y asignación activa duplicada.
- [ ] **Step 2: Ejecutar** `npx vitest run src/aplicacion/servicios/repositorioAcademicoLocal.test.js --reporter=dot`; debe fallar por módulo inexistente.
- [ ] **Step 3: Implementar** el repositorio con clave `undac:academico:frontend:v1`, datos semilla y copias inmutables al leer.
- [ ] **Step 4: Repetir la prueba** y comprobar que pasa.
- [ ] **Step 5: Commit** `feat: add local academic repository`.

### Task 3: Perfil del usuario

**Files:**
- Create: `frontend/src/aplicacion/formularios/perfil/PerfilApp.jsx`
- Create: `frontend/src/aplicacion/paginas/PerfilApp.jsx`
- Modify: `frontend/src/aplicacion/componentes/interfaz/UserMenu.jsx`
- Modify: `frontend/src/aplicacion/componentes/interfaz/HeaderBar.jsx`
- Modify: `frontend/src/aplicacion/Aplicacion.jsx`
- Test: `frontend/src/aplicacion/pruebas/Aplicacion.test.jsx`

**Interfaces:**
- Consumes: `obtenerEstadoAcademico()` y `actualizarPerfil(datos)`.
- Produces: ruta `perfil`; `UserMenu` recibe `onNavigate` y abre esa ruta.

- [ ] **Step 1: Escribir la prueba fallida** que pulsa el usuario, abre “Mi perfil”, edita teléfono/correo, guarda y conserva el valor al remontar; incluir usuario sin campos opcionales.
- [ ] **Step 2: Ejecutar** `npx vitest run src/aplicacion/pruebas/Aplicacion.test.jsx --reporter=dot`; debe fallar porque no existe la ruta.
- [ ] **Step 3: Implementar** una vista compacta con datos editables, roles informativos, asignaciones actuales e historial; no añadir métricas decorativas.
- [ ] **Step 4: Repetir la prueba** y comprobar que pasa.
- [ ] **Step 5: Commit** `feat: add editable user profile`.

### Task 4: Catálogo de cursos

**Files:**
- Create: `frontend/src/aplicacion/formularios/cursos/CursosApp.jsx`
- Create: `frontend/src/aplicacion/paginas/CursosApp.jsx`
- Modify: `frontend/src/aplicacion/configuracion/menuPorRol.js`
- Modify: `frontend/src/aplicacion/autenticacion/rutasProtegidas.js`
- Modify: `frontend/src/aplicacion/Aplicacion.jsx`
- Test: `frontend/src/aplicacion/pruebas/Aplicacion.test.jsx`

**Interfaces:**
- Consumes: `obtenerEstadoAcademico()` y `crearCurso(datos)`.
- Produces: ruta administrativa `cursos` en Sistema.

- [ ] **Step 1: Escribir la prueba fallida** que navega a Cursos, crea “Cirugía Dental” y comprueba su persistencia y el error de código duplicado.
- [ ] **Step 2: Ejecutar** la prueba dirigida; debe fallar porque la ruta no existe.
- [ ] **Step 3: Implementar** listado, filtro, estado y diálogo mínimo de creación/edición visual.
- [ ] **Step 4: Repetir la prueba** y comprobar que pasa.
- [ ] **Step 5: Commit** `feat: add frontend course catalog`.

### Task 5: Grupos, integrantes y rotaciones

**Files:**
- Create: `frontend/src/aplicacion/formularios/grupos-academicos/GruposAcademicosApp.jsx`
- Create: `frontend/src/aplicacion/paginas/GruposAcademicosApp.jsx`
- Modify: `frontend/src/aplicacion/configuracion/menuPorRol.js`
- Modify: `frontend/src/aplicacion/autenticacion/rutasProtegidas.js`
- Modify: `frontend/src/aplicacion/Aplicacion.jsx`
- Modify: `frontend/src/css/aplicacion/claude-vistas.css`
- Test: `frontend/src/aplicacion/pruebas/Aplicacion.test.jsx`

**Interfaces:**
- Consumes: todas las operaciones académicas de Task 2.
- Produces: ruta administrativa `grupos-academicos` y una vista con lista/detalle para integrantes, rotaciones y docentes.

- [ ] **Step 1: Escribir la prueba fallida** que crea un grupo, asigna varios estudiantes y docentes, crea una rotación de Rayos X y otra posterior de Cirugía Dental, y verifica que ambas permanecen visibles.
- [ ] **Step 2: Ejecutar** la prueba dirigida; debe fallar porque la ruta no existe.
- [ ] **Step 3: Implementar** filtros por periodo/curso/estado, formulario de grupo, selectores múltiples y bloques de historial; mostrar errores sin cerrar el formulario.
- [ ] **Step 4: Repetir la prueba** y comprobar que pasa.
- [ ] **Step 5: Commit** `feat: add academic groups and rotations`.

### Task 6: Integración y verificación final

**Files:**
- Modify: `frontend/src/aplicacion/pruebas/NavegacionModulos.test.jsx` si sus expectativas de menú requieren actualización.
- Modify: únicamente los estilos directamente necesarios en `frontend/src/css/aplicacion/claude-vistas.css`.

**Interfaces:**
- Consumes: rutas y componentes de Tasks 1–5.
- Produces: frontend integrado y compilable.

- [ ] **Step 1: Ejecutar** `npm test -- --testTimeout=15000 --reporter=dot` y corregir solo regresiones causadas por este plan.
- [ ] **Step 2: Ejecutar** `npm run build`; debe terminar con código 0.
- [ ] **Step 3: Revisar** escritorio y móvil para confirmar ausencia de superposición y formularios utilizables.
- [ ] **Step 4: Commit** `test: verify profile groups and rotations frontend`.
