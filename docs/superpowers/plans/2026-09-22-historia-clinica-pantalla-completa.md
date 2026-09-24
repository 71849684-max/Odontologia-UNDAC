# Historia clínica en pantalla completa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar la Historia Clínica como un workspace de pantalla completa, con una cabecera mínima y un sidebar clínico plegable en escritorio y móvil.

**Architecture:** `AppLayout` decidirá si monta o no el shell general, mientras `ClinicalWorkspace` será dueño del estado abierto/cerrado de la navegación clínica. `PatientContextBar` ofrecerá los controles y el contexto mínimo; `ClinicalMomentSidebar` renderizará una única navegación adaptable, sin duplicar una variante móvil.

**Tech Stack:** React 19, lucide-react, CSS responsive, Vitest, Testing Library y Vite.

**Spec:** `docs/superpowers/specs/2026-09-22-historia-clinica-pantalla-completa-design.md`

## Global Constraints

- Los seis momentos clínicos deben seguir siendo navegables.
- El título de la sección activa se conserva; sólo desaparece el encabezado redundante del momento clínico.
- No se cambia el esquema de datos, el backend ni el mecanismo de autoguardado.
- No se añaden dependencias.
- Los controles interactivos deben conservar nombre accesible, foco visible y área táctil suficiente.

## Review Focus

- Un `matchMedia` ausente o incompleto en pruebas no debe impedir montar el workspace; el fallback será escritorio abierto.
- Cambiar entre ancho móvil y escritorio no debe dejar simultáneamente overlay y sidebar de escritorio en estados incoherentes.
- Escape y clic en el overlay sólo deben cerrar el drawer cuando está abierto.
- Seleccionar cualquiera de los seis momentos debe mantener la navegación y los datos clínicos existentes.
- Eliminar la presentación de progreso/autoguardado no debe eliminar ni modificar su estado interno.

---

### Task 1: Aislar el shell de Historia Clínica

**Files:**
- Modify: `frontend/src/aplicacion/pruebas/DisenoClaude.test.jsx:11-24`
- Modify: `frontend/src/aplicacion/disenos/AppLayout.jsx:55-72`
- Modify: `frontend/src/aplicacion/disenos/DisenoPanel.jsx:47-58`
- Modify: `frontend/src/css/aplicacion/claude-shell.css`

**Interfaces:**
- Consumes: `modoClinico: boolean` de `AppLayout` y `DisenoPanel`.
- Produces: un shell clínico sin `SidebarHC`, `HeaderBar`, botón móvil general ni lateral vacío.

- [ ] **Step 1: Sustituir la prueba que exige navegación general por una prueba de aislamiento clínico**

```jsx
test('aísla la historia clínica de la navegación y cabecera generales', () => {
  render(
    <AppLayout
      menu={MENU_POR_ROL.administrador}
      usuario={{ nombre: 'Usuario de prueba' }}
      rol="administrador"
      activo="historia-clinica"
      modoClinico
    >
      <p>Contenido clínico</p>
    </AppLayout>,
  );

  expect(screen.queryByRole('complementary', { name: 'Navegación principal' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Abrir menú' })).not.toBeInTheDocument();
  expect(screen.queryByRole('searchbox', { name: 'Buscar paciente o historia' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument();
  expect(screen.getByText('Contenido clínico')).toBeInTheDocument();
});
```

- [ ] **Step 2: Ejecutar la prueba y comprobar el fallo esperado**

Run: `npm test -- src/aplicacion/pruebas/DisenoClaude.test.jsx`

Expected: FAIL porque todavía aparecen `Navegación principal`, `Abrir menú`, búsqueda y `Cerrar sesión`.

- [ ] **Step 3: Evitar el montaje de los elementos globales en modo clínico**

En `AppLayout.jsx`, pasar `null` como `barraLateral` y no montar `HeaderBar` cuando `modoClinico` sea verdadero:

```jsx
barraLateral={modoClinico ? null : (
  <SidebarHC menu={menu} activo={activo} onSelect={handleSelect} />
)}
```

```jsx
{modoClinico ? null : (
  <HeaderBar
    breadcrumb={buscarRuta(menu, activo)}
    usuario={usuario}
    rol={rol}
    onNavigate={handleSelect}
    onLogout={onLogout}
  />
)}
```

En `DisenoPanel.jsx`, montar el botón, overlay y contenedor lateral general sólo cuando `barraLateral` exista. Conservar `diseno-panel--clinical-mode` y `diseno-panel__principal` para no crear una segunda jerarquía de layout.

- [ ] **Step 4: Ajustar el modo clínico a una sola columna**

Definir `.diseno-panel--clinical-mode { grid-template-columns: minmax(0, 1fr); }` y eliminar reglas responsive que reintroduzcan espacio o padding reservado para la cabecera/sidebar general.

- [ ] **Step 5: Ejecutar la prueba y confirmar que pasa**

Run: `npm test -- src/aplicacion/pruebas/DisenoClaude.test.jsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/aplicacion/pruebas/DisenoClaude.test.jsx frontend/src/aplicacion/disenos/AppLayout.jsx frontend/src/aplicacion/disenos/DisenoPanel.jsx frontend/src/css/aplicacion/claude-shell.css
git commit -m "feat: aislar workspace de historia clinica"
```

### Task 2: Reducir la cabecera clínica a paciente y operador

**Files:**
- Modify: `frontend/src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx:73-93`
- Modify: `frontend/src/aplicacion/componentes/clinica/workspace/PatientContextBar.jsx:1-47`
- Modify: `frontend/src/css/aplicacion/claude-shell.css`

**Interfaces:**
- Consumes: `patient`, `history` y `meta` desde `useHistoriaClinica()`.
- Produces: `PatientContextBar({ onExit, navigationOpen, onToggleNavigation, navigationId })`.

- [ ] **Step 1: Escribir la prueba de cabecera mínima**

```jsx
test('la cabecera clínica conserva paciente y operador sin indicadores redundantes', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  const header = screen.getByRole('banner');
  expect(within(header).getByRole('heading', { name: /Andrea Salazar Huamán/i, level: 1 })).toBeInTheDocument();
  expect(within(header).getByText(/DNI 70000001/i)).toBeInTheDocument();
  expect(within(header).getByText('María Fernández')).toBeInTheDocument();
  expect(within(header).queryByLabelText('Alertas clínicas activas')).not.toBeInTheDocument();
  expect(within(header).queryByLabelText('Progreso de la historia clínica')).not.toBeInTheDocument();
  expect(within(header).queryByLabelText('Autoguardado')).not.toBeInTheDocument();
  expect(within(header).queryByText('Semestre')).not.toBeInTheDocument();
  expect(within(header).queryByText('Estado')).not.toBeInTheDocument();
});
```

La mutación que esta prueba detecta es volver a renderizar cualquiera de los indicadores retirados o perder el nombre del paciente/operador.

- [ ] **Step 2: Ejecutar la prueba y comprobar el fallo esperado**

Run: `npm test -- src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx`

Expected: FAIL porque alertas, progreso, autoguardado, semestre y estado todavía están presentes.

- [ ] **Step 3: Simplificar `PatientContextBar`**

Eliminar los imports y cálculos exclusivos de alertas/progreso/autoguardado (`ShieldAlert`, `clinicalSections`, `SECTION_STATUS`, `AutoSaveIndicator`, `alerts`, `autosaveStatus`, `lastSavedAt`, `sectionStatuses`, `complete`, `progress`). La cabecera conservará el botón de regreso, avatar, nombre, DNI, edad, sexo, código de historia y un único par `Operador / {history.operador}`.

Ampliar la firma para recibir el estado del navegador clínico:

```jsx
export default function PatientContextBar({
  onExit,
  navigationOpen,
  onToggleNavigation,
  navigationId,
})
```

El botón hamburguesa usará `Menu`/`PanelLeftClose`, `aria-expanded={navigationOpen}`, `aria-controls={navigationId}` y un nombre que cambie entre `Mostrar momentos clínicos` y `Ocultar momentos clínicos`.

- [ ] **Step 4: Limpiar estilos exclusivos de indicadores retirados**

Eliminar selectores de `.clinical-patient-bar__alerts`, `.clinical-alert-chip`, `.clinical-patient-bar__save` y `.clinical-history-progress` dentro de `claude-shell.css`. Reorganizar `.clinical-patient-bar__context` para los controles, identidad y operador sin huecos residuales en todos los breakpoints.

- [ ] **Step 5: Ejecutar la prueba y confirmar que pasa**

Run: `npm test -- src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx`

Expected: PASS para la nueva prueba y las pruebas clínicas no relacionadas.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx frontend/src/aplicacion/componentes/clinica/workspace/PatientContextBar.jsx frontend/src/css/aplicacion/claude-shell.css
git commit -m "refactor: simplificar cabecera de historia clinica"
```

### Task 3: Unificar y hacer plegable la navegación de los seis momentos

**Files:**
- Modify: `frontend/src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx:39-72`
- Modify: `frontend/src/aplicacion/componentes/clinica/workspace/ClinicalWorkspace.jsx:1-56`
- Modify: `frontend/src/aplicacion/componentes/clinica/workspace/ClinicalMomentSidebar.jsx:1-85`
- Delete: `frontend/src/aplicacion/componentes/clinica/workspace/ClinicalMomentHeader.jsx`
- Modify: `frontend/src/css/aplicacion/claude-shell.css`

**Interfaces:**
- Consumes: `navigateToMoment(momentId)` y `activeMoment` desde `useHistoriaClinica()`.
- Produces: `ClinicalMomentSidebar({ id, open, onNavigate })` y un layout con clase `is-navigation-open` o `is-navigation-closed`.

- [ ] **Step 1: Sustituir la prueba del selector móvil duplicado por una prueba del sidebar plegable compartido**

```jsx
test('muestra y oculta el navegador de los seis momentos con el botón hamburguesa', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  const hide = screen.getByRole('button', { name: 'Ocultar momentos clínicos' });
  expect(hide).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('complementary', { name: 'Momentos de Historia Clínica' })).toBeInTheDocument();

  fireEvent.click(hide);
  expect(screen.getByRole('button', { name: 'Mostrar momentos clínicos' })).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('complementary', { name: 'Momentos de Historia Clínica' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Mostrar momentos clínicos' }));
  const navigation = within(screen.getByRole('complementary', { name: 'Momentos de Historia Clínica' }));
  expect(navigation.getAllByRole('button')).toHaveLength(6);
});
```

La mutación que esta prueba detecta es que el botón deje de controlar la visibilidad real o que el sidebar pierda alguno de los seis momentos.

- [ ] **Step 2: Añadir la prueba que garantiza la eliminación del encabezado en los momentos 1 al 6**

```jsx
test.each(clinicalMoments)('omite el encabezado redundante del momento $number', (moment) => {
  render(<HistoriaClinica historiaId="1" initialSection={moment.sections[0]} />);

  expect(screen.queryByText(new RegExp(`Momento clínico\\s+${moment.number}\\s+de\\s+6`, 'i'))).not.toBeInTheDocument();
  expect(screen.queryByRole('status', { name: `Estado de ${moment.label}` })).not.toBeInTheDocument();
});
```

- [ ] **Step 3: Ejecutar las pruebas y comprobar los fallos esperados**

Run: `npm test -- src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx`

Expected: FAIL porque el navegador todavía no se controla desde la cabecera y `ClinicalMomentHeader` todavía se renderiza.

- [ ] **Step 4: Mover el estado de navegación a `ClinicalWorkspace`**

Crear un id estable con `useId()` y un estado inicial responsive con fallback seguro:

```jsx
const navigationId = useId();
const [navigationOpen, setNavigationOpen] = useState(() => (
  typeof window === 'undefined' || !window.matchMedia
    ? true
    : window.matchMedia('(min-width: 992px)').matches
));
```

Pasar el estado a `PatientContextBar` y `ClinicalMomentSidebar`. Al cerrar, devolver el layout a una columna; al abrir en móvil, renderizar overlay y bloquear la interacción del contenido mediante `inert` siguiendo el patrón ya usado por `DisenoPanel`.

- [ ] **Step 5: Convertir `ClinicalMomentSidebar` en una sola navegación responsive**

Eliminar `mobileOpen`, `ChevronDown` y todo el árbol `.clinical-moment-mobile`. Renderizar solamente el `<aside id={id}>` cuando `open` sea verdadero. Cada botón seguirá usando `navigateToMoment(moment.id)`; después llamará a `onNavigate?.()` para que `ClinicalWorkspace` cierre únicamente el drawer móvil según `matchMedia('(max-width: 991px)')`.

Añadir cierre por Escape, overlay con nombre `Cerrar momentos clínicos` y devolución de foco al botón hamburguesa. No cambiar `momentState()` ni la visualización de los seis estados.

- [ ] **Step 6: Retirar el encabezado compartido de todos los momentos**

Eliminar el import y `<ClinicalMomentHeader />` de `ClinicalWorkspace.jsx`, borrar `ClinicalMomentHeader.jsx` y retirar sus selectores CSS. Esta única eliminación cubre los momentos 1, 2, 3, 4, 5 y 6 porque todos usan el mismo workspace.

- [ ] **Step 7: Crear los estados visuales de escritorio y móvil**

En escritorio, usar dos columnas sólo para `.is-navigation-open`; `.is-navigation-closed` usa una columna. En móvil, el aside será un drawer `position: fixed` con overlay, ancho máximo `min(320px, calc(100vw - 48px))`, altura `100dvh`, scroll vertical y `z-index` superior al contenido clínico. Respetar `prefers-reduced-motion`.

- [ ] **Step 8: Ejecutar las pruebas y confirmar que pasan**

Run: `npm test -- src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx frontend/src/aplicacion/componentes/clinica/workspace/ClinicalWorkspace.jsx frontend/src/aplicacion/componentes/clinica/workspace/ClinicalMomentSidebar.jsx frontend/src/aplicacion/componentes/clinica/workspace/ClinicalMomentHeader.jsx frontend/src/css/aplicacion/claude-shell.css
git commit -m "feat: plegar navegacion de momentos clinicos"
```

### Task 4: Eliminar Ruta de ingreso de Datos del paciente

**Files:**
- Modify: `frontend/src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx:95-106`
- Modify: `frontend/src/aplicacion/formularios/datos-paciente/DatosPacienteSection.jsx:1-66`
- Modify: `frontend/src/aplicacion/formularios/datos-paciente/datos-paciente.css:1-14,88-112`

**Interfaces:**
- Consumes: los mismos `values`, `onChange` y `meta` actuales.
- Produces: el formulario inicia directamente en `Identificación del paciente`.

- [ ] **Step 1: Invertir la prueba existente para exigir que la ruta redundante no aparezca**

```jsx
test('inicia los datos del paciente directamente en el formulario de identificación', () => {
  render(<HistoriaClinica historiaId="1" initialSection="datos-paciente" />);

  expect(screen.queryByLabelText('Ruta de ingreso del paciente')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Identificación del paciente/i })).toBeInTheDocument();
});
```

La mutación que esta prueba detecta es reintroducir el resumen redundante o eliminar accidentalmente el primer bloque real del formulario.

- [ ] **Step 2: Ejecutar la prueba y comprobar el fallo esperado**

Run: `npm test -- src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx`

Expected: FAIL porque `Ruta de ingreso del paciente` todavía existe.

- [ ] **Step 3: Retirar markup, datos derivados e imports exclusivos**

Eliminar `admissionBlocks` y `<section className="clinical-admission-overview">`. Reducir el import de lucide-react a los iconos que sigan usados (`Info`, `ShieldCheck`, `X`) y comprobar con el linter/compilador que no queden imports huérfanos.

- [ ] **Step 4: Retirar CSS obsoleto**

Eliminar `.clinical-admission-overview*` y sus overrides responsive de `datos-paciente.css`. Conservar `.hc-admission` y los estilos de tarjetas/campos que siguen usando el formulario.

- [ ] **Step 5: Ejecutar las pruebas y confirmar que pasan**

Run: `npm test -- src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/aplicacion/pruebas/HistoriaClinicaModular.test.jsx frontend/src/aplicacion/formularios/datos-paciente/DatosPacienteSection.jsx frontend/src/aplicacion/formularios/datos-paciente/datos-paciente.css
git commit -m "refactor: retirar ruta de ingreso redundante"
```

### Task 5: Validación integral y revisión responsive

**Files:**
- Modify: `frontend/src/css/aplicacion/claude-shell.css`
- Modify: `frontend/src/aplicacion/formularios/datos-paciente/datos-paciente.css`

**Interfaces:**
- Consumes: los componentes y estilos resultantes de las tareas 1 a 4.
- Produces: una vista verificable en escritorio, tableta y móvil sin regresiones de compilación.

- [ ] **Step 1: Ejecutar toda la suite del frontend**

Run: `npm test`

Expected: todas las pruebas PASS, sin tests omitidos ni errores no reportados.

- [ ] **Step 2: Compilar producción**

Run: `npm run build`

Expected: exit code 0, sin imports inexistentes ni errores de JSX/CSS.

- [ ] **Step 3: Revisar manualmente anchos representativos**

Ejecutar `npm run dev` y verificar en 1440 px, 1024 px, 768 px y 375 px:

- no aparece el shell general;
- la cabecera sólo muestra regreso, hamburguesa, paciente y operador;
- el título `Momento clínico N de 6` no aparece en ningún momento;
- el título de la sección activa sí aparece;
- el formulario ocupa el ancho liberado al contraer el sidebar;
- el drawer móvil cubre correctamente, tiene scroll y se cierra con Escape/overlay/selección;
- `Ruta de ingreso` no aparece;
- no hay scroll horizontal involuntario.

- [ ] **Step 4: Repetir pruebas después de cualquier corrección visual**

Run: `npm test && npm run build`

Expected: ambos comandos finalizan con exit code 0.

- [ ] **Step 5: Revisar el diff final contra los criterios de aceptación**

Run: `git diff --check && git diff --stat`

Expected: `git diff --check` sin salida y el diff limitado a shell, workspace clínico, Datos del paciente, CSS y pruebas relacionadas.

- [ ] **Step 6: Commit**

```bash
git add frontend/src
git commit -m "test: validar historia clinica en pantalla completa"
```
