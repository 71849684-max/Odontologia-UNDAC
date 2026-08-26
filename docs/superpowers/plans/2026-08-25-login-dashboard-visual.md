# Login and Adaptive Dashboard Visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished React login and role-adaptive dashboard inside the existing Laravel project without adding authentication, API, database, or business logic.

**Architecture:** Laravel keeps its existing `public/index.php` as the HTTP entry point and serves one Blade shell. Vite mounts a React application from `resources/js/app.js`; all client code lives below `resources/js/app/`, mirroring the modular discipline of ASCIENTIFICOS while respecting Laravel conventions. Role changes and login/dashboard transitions use local React state and local demonstration data only.

**Tech Stack:** Laravel 13, React 19, Vite 8, Tailwind CSS 4 build pipeline, modular CSS, Vitest, Testing Library, Lucide React.

**Spec:** `docs/superpowers/specs/2026-08-25-login-dashboard-visual-design.md`

## Global Constraints

- Work inside `composer/`, the Laravel application root.
- Keep `composer/public/index.php` unchanged; it already is Laravel's canonical HTTP entry point.
- Put the complete React client layer under `composer/resources/js/app/`.
- Do not add controllers, middleware, authentication, API requests, migrations, seeders, models, services, database changes, local storage, or session storage.
- Use only local demonstration data for administrator, docente, and alumno operador.
- Preserve the approved institutional-clinical palette with restrained academic gold accents.
- Do not stage or modify the pre-existing deletion of `.idea/phpunit.xml`.

---

### Task 1: React entry point and visual application shell

**Files:**
- Modify: `composer/package.json`
- Modify: `composer/vite.config.js`
- Modify: `composer/resources/js/app.js`
- Modify: `composer/routes/web.php`
- Create: `composer/resources/views/app.blade.php`
- Create: `composer/resources/js/app/App.jsx`
- Create: `composer/resources/js/app/tests/setup.js`
- Create: `composer/resources/js/app/tests/App.test.jsx`

**Interfaces:**
- Produces: default component `App(): JSX.Element`.
- Produces: Blade element `<div id="odontologia-app"></div>` used by `app.js`.
- Produces: route `GET /` that returns view `app`.

- [ ] **Step 1: Add the failing application-shell test**

```jsx
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders the visual access screen first', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /historia clínica digital/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Configure the test command and verify the test fails**

Add these scripts and packages to `composer/package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "vitest": "^2.1.8"
  }
}
```

Run: `cd composer && npm install`

Run: `npm test -- App.test.jsx`

Expected: FAIL because `../App` does not exist.

- [ ] **Step 3: Configure Vite for React and Vitest**

Add `react()` to the existing Laravel and Tailwind plugins in `composer/vite.config.js` and add:

```js
test: {
  environment: 'jsdom',
  setupFiles: ['./resources/js/app/tests/setup.js'],
  css: true,
},
```

Create `setup.js` with:

```js
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Create the Blade and React entry points**

Use this Blade shell in `app.blade.php`:

```blade
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Sistema de Historia Clínica Digital de Odontología UNDAC">
    <title>Odontología UNDAC</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <div id="odontologia-app"></div>
</body>
</html>
```

Change `/` in `routes/web.php` to `return view('app');`.

Use this mount in `resources/js/app.js`:

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';

createRoot(document.getElementById('odontologia-app')).render(
  <StrictMode><App /></StrictMode>,
);
```

Create the minimal `App.jsx`:

```jsx
export default function App() {
  return <main><h1>Historia Clínica Digital</h1></main>;
}
```

- [ ] **Step 5: Run the shell test and build**

Run: `npm test -- App.test.jsx`

Expected: PASS.

Run: `npm run build`

Expected: Vite exits with code 0 and emits the production bundle.

- [ ] **Step 6: Commit the shell**

```bash
git add composer/package.json composer/package-lock.json composer/vite.config.js composer/resources/js/app.js composer/resources/js/app composer/resources/views/app.blade.php composer/routes/web.php
git commit -m "feat: configurar interfaz React en Laravel"
```

---

### Task 2: Institutional login page

**Files:**
- Create: `composer/resources/js/app/pages/LoginPage.jsx`
- Create: `composer/resources/js/app/components/ui/BrandMark.jsx`
- Create: `composer/resources/css/app/tokens.css`
- Create: `composer/resources/css/app/login.css`
- Modify: `composer/resources/css/app.css`
- Modify: `composer/resources/js/app/App.jsx`
- Create: `composer/resources/js/app/tests/LoginPage.test.jsx`

**Interfaces:**
- Produces: `LoginPage({ selectedRole, onRoleChange, onEnter }): JSX.Element`.
- Produces: `BrandMark({ compact = false }): JSX.Element`.
- Consumes: role identifiers `'admin' | 'teacher' | 'student'`.

- [ ] **Step 1: Write failing login interaction tests**

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../pages/LoginPage';

test('exposes labeled email, password and demonstration role controls', () => {
  render(<LoginPage selectedRole="student" onRoleChange={() => {}} onEnter={() => {}} />);
  expect(screen.getByLabelText(/correo institucional/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^contraseña$/i)).toHaveAttribute('type', 'password');
  expect(screen.getByLabelText(/perfil de demostración/i)).toHaveValue('student');
});

test('submits the selected demonstration role', async () => {
  const onEnter = vi.fn();
  render(<LoginPage selectedRole="teacher" onRoleChange={() => {}} onEnter={onEnter} />);
  await userEvent.click(screen.getByRole('button', { name: /ingresar al sistema/i }));
  expect(onEnter).toHaveBeenCalledWith('teacher');
});
```

- [ ] **Step 2: Run the login tests to verify failure**

Run: `npm test -- LoginPage.test.jsx`

Expected: FAIL because `LoginPage` does not exist.

- [ ] **Step 3: Implement the presentational login contract**

Create a semantic form with:

```jsx
const ROLE_OPTIONS = [
  { value: 'student', label: 'Alumno operador' },
  { value: 'teacher', label: 'Docente' },
  { value: 'admin', label: 'Administrador' },
];

function handleSubmit(event) {
  event.preventDefault();
  onEnter(selectedRole);
}
```

The page must include visible labels, `autoComplete="email"`, `autoComplete="current-password"`, a password visibility button with an accessible name, a visual recovery link, a remember checkbox, and a select labeled `Perfil de demostración`.

- [ ] **Step 4: Establish the visual tokens and login layout**

Define exact core tokens in `tokens.css`:

```css
:root {
  --ou-navy-950: #0b2239;
  --ou-navy-900: #123451;
  --ou-navy-700: #1c526f;
  --ou-teal-700: #0f7181;
  --ou-teal-100: #dff3f2;
  --ou-gold-500: #b5903f;
  --ou-gold-100: #f5ecd3;
  --ou-surface: #ffffff;
  --ou-canvas: #f3f7f9;
  --ou-text: #17324a;
  --ou-muted: #65798b;
  --ou-border: #dbe4ea;
  --ou-danger: #b42318;
  --ou-shadow: 0 24px 60px rgba(11, 34, 57, .14);
}
```

Implement a two-column desktop layout and a single-column mobile layout at `max-width: 800px`. Keep the institutional panel navy/teal, reserve gold for the seal and small academic accents, and keep the form surface white.

Import both CSS files from `app.css` after the existing Tailwind import:

```css
@import './app/tokens.css';
@import './app/login.css';
```

- [ ] **Step 5: Replace the App stub with login state**

```jsx
const [screen, setScreen] = useState('login');
const [role, setRole] = useState('student');

if (screen === 'login') {
  return <LoginPage selectedRole={role} onRoleChange={setRole} onEnter={() => setScreen('dashboard')} />;
}
```

- [ ] **Step 6: Run the focused tests**

Run: `npm test -- LoginPage.test.jsx App.test.jsx`

Expected: PASS.

- [ ] **Step 7: Commit the login page**

```bash
git add composer/resources/js/app composer/resources/css
git commit -m "feat: crear interfaz institucional de acceso"
```

---

### Task 3: Role-adaptive dashboard

**Files:**
- Create: `composer/resources/js/app/config/roleDashboards.js`
- Create: `composer/resources/js/app/layouts/DashboardLayout.jsx`
- Create: `composer/resources/js/app/pages/DashboardPage.jsx`
- Create: `composer/resources/js/app/components/dashboard/Sidebar.jsx`
- Create: `composer/resources/js/app/components/dashboard/DashboardHeader.jsx`
- Create: `composer/resources/js/app/components/dashboard/MetricCard.jsx`
- Create: `composer/resources/js/app/components/dashboard/ActivityTable.jsx`
- Create: `composer/resources/js/app/components/dashboard/QuickActions.jsx`
- Create: `composer/resources/css/app/dashboard.css`
- Modify: `composer/resources/css/app.css`
- Modify: `composer/resources/js/app/App.jsx`
- Create: `composer/resources/js/app/tests/DashboardPage.test.jsx`
- Modify: `composer/resources/js/app/tests/App.test.jsx`

**Interfaces:**
- Produces: `ROLE_DASHBOARDS: Record<'admin' | 'teacher' | 'student', DashboardConfig>`.
- Produces: `DashboardPage({ role, onRoleChange, onLogout }): JSX.Element`.
- `DashboardConfig` fields: `label`, `person`, `headline`, `primaryAction`, `navigation`, `metrics`, `activities`, `quickActions`.

- [ ] **Step 1: Write failing role-variant tests**

```jsx
import { render, screen } from '@testing-library/react';
import DashboardPage from '../pages/DashboardPage';

test.each([
  ['admin', 'Registrar usuario', 'Usuarios y roles'],
  ['teacher', 'Revisar pendientes', 'Historias supervisadas'],
  ['student', 'Nueva historia clínica', 'Mis historias clínicas'],
])('renders the %s dashboard variant', (role, action, navigation) => {
  render(<DashboardPage role={role} onRoleChange={() => {}} onLogout={() => {}} />);
  expect(screen.getByRole('button', { name: action })).toBeInTheDocument();
  expect(screen.getByText(navigation)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the dashboard tests to verify failure**

Run: `npm test -- DashboardPage.test.jsx`

Expected: FAIL because `DashboardPage` does not exist.

- [ ] **Step 3: Define exact local role data**

Create `ROLE_DASHBOARDS` with these identity records:

```js
export const ROLE_DASHBOARDS = {
  admin: {
    label: 'Administrador', person: 'Carlos Mendoza', headline: 'Control general del sistema',
    primaryAction: 'Registrar usuario',
    navigation: ['Resumen', 'Usuarios y roles', 'Historias clínicas', 'Pacientes', 'Auditoría', 'Configuración'],
    metrics: [
      { id: 'users', label: 'Usuarios activos', value: '86', tone: 'clinical' },
      { id: 'records', label: 'Historias registradas', value: '248', tone: 'neutral' },
      { id: 'activity', label: 'Acciones hoy', value: '34', tone: 'neutral' },
      { id: 'alerts', label: 'Alertas', value: '03', tone: 'academic' },
    ],
    activities: [
      { id: 'a1', patient: 'Rosa Huamán', record: 'HC-2026-0048', type: 'Actualización', date: 'Hoy, 09:30', status: 'Registrada' },
      { id: 'a2', patient: 'Luis Espinoza', record: 'HC-2026-0041', type: 'Validación', date: 'Hoy, 08:45', status: 'Por revisar' },
      { id: 'a3', patient: 'Ana Salazar', record: 'HC-2026-0037', type: 'Auditoría', date: 'Ayer, 16:10', status: 'Completa' },
    ],
    quickActions: ['Gestionar usuarios', 'Consultar auditoría', 'Ver historias clínicas'],
  },
  teacher: {
    label: 'Docente', person: 'Dra. Elena Salazar', headline: 'Supervisión académica y clínica',
    primaryAction: 'Revisar pendientes',
    navigation: ['Resumen', 'Alumnos asignados', 'Historias supervisadas', 'Validaciones', 'Seguimientos', 'Auditoría académica'],
    metrics: [
      { id: 'students', label: 'Alumnos asignados', value: '36', tone: 'neutral' },
      { id: 'reviews', label: 'Historias por revisar', value: '12', tone: 'academic' },
      { id: 'signatures', label: 'Firmas pendientes', value: '04', tone: 'academic' },
      { id: 'controls', label: 'Controles del día', value: '07', tone: 'clinical' },
    ],
    activities: [
      { id: 't1', patient: 'Luis Espinoza', record: 'HC-2026-0041', type: 'Diagnóstico', date: 'Hoy, 10:00', status: 'Por revisar' },
      { id: 't2', patient: 'Ana Salazar', record: 'HC-2026-0037', type: 'Consentimiento', date: 'Hoy, 11:30', status: 'Firma pendiente' },
      { id: 't3', patient: 'Diego Torres', record: 'HC-2026-0032', type: 'Seguimiento', date: 'Ayer, 15:20', status: 'Validada' },
    ],
    quickActions: ['Revisar historias', 'Firmar consentimientos', 'Consultar alumnos'],
  },
  student: {
    label: 'Alumno operador', person: 'María Quispe', headline: 'Tu actividad clínica de hoy',
    primaryAction: 'Nueva historia clínica',
    navigation: ['Resumen', 'Mis historias clínicas', 'Pacientes', 'Seguimientos', 'Recursos clínicos'],
    metrics: [
      { id: 'active', label: 'Historias activas', value: '24', tone: 'clinical' },
      { id: 'validation', label: 'Pendientes de validación', value: '08', tone: 'academic' },
      { id: 'today', label: 'Controles del día', value: '05', tone: 'clinical' },
      { id: 'incomplete', label: 'Registros incompletos', value: '03', tone: 'neutral' },
    ],
    activities: [
      { id: 's1', patient: 'Rosa Huamán', record: 'HC-2026-0048', type: 'Cirugía bucal', date: 'Hoy, 09:30', status: 'En curso' },
      { id: 's2', patient: 'Luis Espinoza', record: 'HC-2026-0041', type: 'Seguimiento', date: 'Ayer, 16:10', status: 'Por validar' },
      { id: 's3', patient: 'Ana Salazar', record: 'HC-2026-0037', type: 'Diagnóstico', date: '22 ago.', status: 'Completa' },
    ],
    quickActions: ['Registrar paciente', 'Continuar historia', 'Ver seguimientos'],
  },
};
```

Render navigation and quick-action strings with the unique label as the React key. Activity and metric records already expose explicit stable `id` values.

- [ ] **Step 4: Implement focused dashboard components**

Use semantic boundaries:

```jsx
<DashboardLayout sidebar={<Sidebar items={config.navigation} />}>
  <DashboardHeader config={config} role={role} onRoleChange={onRoleChange} />
  <section aria-label="Indicadores principales">
    {config.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
  </section>
  <ActivityTable activities={config.activities} />
  <QuickActions actions={config.quickActions} />
</DashboardLayout>
```

Use Lucide icons passed by identifier from a local icon map. Buttons for unavailable modules must use `type="button"` and must not navigate or imitate completed functionality.

- [ ] **Step 5: Connect dashboard and logout visual transitions**

In `App.jsx`, render:

```jsx
return (
  <DashboardPage
    role={role}
    onRoleChange={setRole}
    onLogout={() => setScreen('login')}
  />
);
```

Extend `App.test.jsx` to select `Docente`, enter the dashboard, assert `Revisar pendientes`, click `Cerrar sesión`, and assert the login heading returns.

- [ ] **Step 6: Implement dashboard responsive CSS**

Import `dashboard.css` in `app.css`. Use a fixed desktop sidebar column, a sticky topbar, a four-column metric grid that collapses to two and then one column, and activity rows that become labeled blocks below `680px`. Use teal for clinical actions and gold only for validation or academic review states.

- [ ] **Step 7: Run dashboard and application tests**

Run: `npm test -- DashboardPage.test.jsx App.test.jsx`

Expected: PASS.

- [ ] **Step 8: Commit the dashboard**

```bash
git add composer/resources/js/app composer/resources/css
git commit -m "feat: crear dashboard visual adaptable por rol"
```

---

### Task 4: Visual states, accessibility, and final verification

**Files:**
- Create: `composer/resources/js/app/components/ui/LoadingState.jsx`
- Create: `composer/resources/js/app/components/ui/EmptyState.jsx`
- Create: `composer/resources/js/app/components/ui/ErrorState.jsx`
- Create: `composer/resources/js/app/components/ui/SessionExpiredDialog.jsx`
- Create: `composer/resources/js/app/tests/VisualStates.test.jsx`
- Modify: `composer/resources/css/app/dashboard.css`
- Modify: `composer/README.md`

**Interfaces:**
- Produces: four presentational state components with no timers, requests, or persistence.
- Produces: README commands `npm run dev`, `npm test`, and `npm run build`.

- [ ] **Step 1: Write failing accessibility tests for visual states**

```jsx
test('announces an error state', () => {
  render(<ErrorState title="No pudimos cargar la información" />);
  expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar la información');
});

test('labels the session-expired demonstration dialog', () => {
  render(<SessionExpiredDialog onReturn={() => {}} />);
  expect(screen.getByRole('dialog', { name: /sesión expirada/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the state tests to verify failure**

Run: `npm test -- VisualStates.test.jsx`

Expected: FAIL because the state components do not exist.

- [ ] **Step 3: Implement the state components**

Use `role="status"` and `aria-live="polite"` for loading, a normal region for empty state, `role="alert"` for error, and native `<dialog open aria-labelledby="session-expired-title">` for the demonstration dialog. Each component accepts only text and callback props; none may call an API.

- [ ] **Step 4: Document the frontend structure**

Add a `Frontend visual React` section to `composer/README.md` containing:

```text
resources/js/app/ contiene la capa cliente React.
npm run dev inicia Vite.
npm test ejecuta las pruebas de componentes.
npm run build genera los recursos de producción.
La entrega actual usa datos demostrativos y no implementa autenticación ni persistencia.
```

- [ ] **Step 5: Run complete automated verification**

Run: `npm test`

Expected: all Vitest suites PASS.

Run: `npm run build`

Expected: Vite exits with code 0 without unresolved imports or CSS errors.

Run: `php artisan test`

Expected: existing Laravel tests PASS and no backend feature was added.

- [ ] **Step 6: Perform browser visual verification**

Run: `composer run dev`

Verify at desktop and mobile widths:

- Login has no clipping at 1440px, 768px, 390px, and 320px.
- Password toggle, profile selector, and login transition are keyboard accessible.
- Administrator, docente, and alumno variants show distinct navigation and metrics.
- Sidebar opens and closes on mobile without horizontal overflow.
- Activity rows remain readable at 320px.
- Focus indicators remain visible.

- [ ] **Step 7: Confirm scope isolation and commit**

Run: `git diff --name-only`

Expected: only frontend files, `composer/routes/web.php`, `composer/package*.json`, `composer/vite.config.js`, `composer/README.md`, the design spec, and this plan appear; no controllers, migrations, models, services, or database files appear.

```bash
git add composer/resources composer/routes/web.php composer/package.json composer/package-lock.json composer/vite.config.js composer/README.md docs/superpowers
git commit -m "feat: completar interfaz visual de odontologia undac"
```
