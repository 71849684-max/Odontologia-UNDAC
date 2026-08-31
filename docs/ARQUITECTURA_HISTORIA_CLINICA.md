Resumen ejecutivo
-----------------
Breve: El repositorio contiene una maqueta frontend (React + Vite + Tailwind) ubicada en /frontend y una mínima capa backend Laravel en /backend (Laravel ^13, PHP ^8.3) con migraciones básicas (usuarios). El frontend hoy es mayoritariamente demostrativo, sin integración API. No existe aún módulo de historias clínicas en backend ni modelos de pacientes/historias completos.

1. Arquitectura actual
---------------------
- Frontend: React 19, Vite, TailwindCSS 4, lucide-react para iconos, Vitest para pruebas. Estructura: frontend/src con organización: aplicacion/componentes, paginas, configuracion, css. El frontend funciona como maqueta (estado local, datos estáticos en configuracion/modulosPorPerfil.js).
- Backend: Laravel ^13 (PHP 8.3). Estructura estándar Laravel en /backend: app/, routes/, database/ (migrations, seeders, database.sqlite), public/. Rutas actuales mínimas (routes/web.php con endpoint raíz). Modelos mínimos (App\Models\User).
- DB: existe database/database.sqlite con migraciones iniciales: users, sessions, password_reset_tokens.
- Integración: vite.config.js define proxy '/api' -> backend (http://127.0.0.1:8000) pero no hay llamadas API en frontend.

2. Stack (exacto)
-----------------
Frontend
- Framework: React 19
- Bundler: Vite (^8.0.0)
- Lenguaje: JavaScript (ESM)
- Librerías UI: lucide-react (iconos)
- Estilos: TailwindCSS v4 in devDeps + custom CSS files (src/css/*). Project uses plain CSS modules (arquitectura de CSS por archivos). No component library.
- Estado: local React useState/useEffect. No Redux/Context global específico (hay config files for static data).
- Formularios/Validación: nativo (HTML forms) — no form library.
- Tests: Vitest + Testing Library.

Backend
- Framework: Laravel ^13
- Autenticación: no scaffolding detectado (no Fortify/Sanctum/Passport config). User model extends Authenticatable.
- Rutas: routes/web.php only; no routes/api.php present.
- Controllers: minimal (base Controller only).
- Migrations: users and session tables present. No pacientes/historias migrations.

Base de datos
- Motor: SQLite presente (database/database.sqlite) — probablemente para demo/tests.
- Migraciones visibles: users, sessions, password_reset_tokens.
- Seeders: DatabaseSeeder exists but inspects file for content when needed.

3. Estructura de carpetas (inventario rápido)
--------------------------------------------
- frontend/
  - src/aplicacion/
    - componentes/
    - paginas/
    - configuracion/
    - pruebas/
  - public/, index.html, vite.config.js, package.json
- backend/
  - app/ (Models, Providers, Controllers)
  - routes/ (web.php, console.php)
  - database/ (migrations, seeders, database.sqlite)
  - public/

4. Componentes existentes (extracto)
------------------------------------
Listado principal (ver docs/MATRIZ_COMPONENTES.md para inventario completo). Ejemplos reutilizables detectados en frontend/src:
- Aplicacion (entry state manager)
- PaginaAcceso (login demo)
- PaginaPanel (dashboard)
- BarraLateral, EncabezadoPanel, TablaRegistros, VistaModulo, DialogoSesionExpirada
- Varias tarjetas, tablas y paneles modulares en src/aplicacion/componentes

5. Componentes que deberían crearse (resumen)
--------------------------------------------
- HistoriaClinicaLayout, HistoriaClinicaSidebar, HistoriaClinicaHeader, HistoriaClinicaProgress
- Formularios clínicos por sección: DatosPacienteForm, AnamnesisForm, CuestionarioSaludForm, AntecedentesTabs, ExamenClinicoForm, ExamenExtraoralForm, ExamenIntraoralForm
- GaleriaClinica, RadiografiaViewer, Odontograma (arquitectura), DiagnosticoVersiones, PlanTratamiento, ConsentimientoDigital, FirmaDigital
(Referencia completa en docs/MATRIZ_INTERFACES_HISTORIA_CLINICA.md)

6. Rutas y navegación
---------------------
- Navegación actual: frontend maneja pantalla (acceso/panel) por estado local; no React Router detectado.
- Backend: solo ruta raíz que devuelve JSON simple.
- Observación: la app aún no implementa rutas protegidas, guards ni API RESTful.

7. Autenticación y roles
------------------------
- Frontend: maqueta con selector de "perfil" (alumno/docente/administrador) — no autenticación real.
- Backend: User model existe; no sistema de tokens, sesiones protegidas o middleware de roles detectado.
- Reutilizar: la infraestructura Laravel permite implementar Auth (Sanctum/JWT) más tarde. No tocar hasta diseño de RBAC.

8. API actual
-------------
- No hay endpoints REST para pacientes/historias. El proxy Vite está listo para '/api' pero falta backend REST.
- Recomendación: definir contracto API consistente con la propuesta (formato JSON: {exito,mensaje,datos,errores}) y documentarlo (OpenAPI/Swagger) antes de implementar.

9. Estado y manejo de datos
---------------------------
- Hoy: datos estáticos en archivos de configuración (modulosPorPerfil.js)
- Propuesta: usar React Context + react-query (o similar) para caché y sincronización; mantener la UI desacoplada de llamadas API.

10. Estilos y responsive
------------------------
- Uso mixto: Tailwind v4 aparece en devDependencies pero el proyecto también contiene CSS propios en src/css/*. Se debe consolidar: elegir Tailwind utility-first para nuevos componentes y mantener CSS existente para compatibilidad.
- Responsive: componentes de tablero y tablas están construidos con técnicas CSS responsivas (data-label en celdas) — buena base.

11. Deuda técnica y riesgos principales
--------------------------------------
- Falta de API y modelos clínicos en backend (CRÍTICO).
- Frontend demo sin router ni llamadas API (ALTO) — implica trabajo de integración.
- Sin RBAC/middlewares implementados (ALTO) — crítico para privacidad clínica.
- Posible exposición de datos si se guardan credenciales en localStorage sin encriptación (MEDIO).
- Dependencias node_modules pesadas incluidas en repo (BAJO/operacional) — limpiar .gitignore preferible.

12. Sugerencias de ubicación para configuración central
-----------------------------------------------------
- Frontend: crear frontend/src/configuracion/historiaClinica.js (secciones, orden, estados, permisos UI)
- Backend: crear config/historiaclinica.php en Laravel para secciones/estados/roles compartidos por API y frontend

13. Próximos pasos recomendados (alto nivel)
-------------------------------------------
1. Acordar y versionar el contrato clínico (Fuente A): digitalizar formato institucional — documento definitivo.
2. Diseñar API REST mínima para pacientes/historias/usuarios siguiendo el formato {exito,mensaje,datos,errores}.
3. Añadir RBAC en backend (roles: administrador, docente, alumno) y endpoints de autenticación (Sanctum o JWT).
4. Implementar layouts de Historia Clínica (solo estructura y navegación) en frontend, reutilizando componentes existentes.
5. Iterar por fases (ver docs/PLAN_IMPLEMENTACION_HISTORIA_CLINICA.md).

Anexos
------
- Frontend entry: frontend/src/principal.jsx
- Config proxy para backend: frontend/vite.config.js
- Backend composer.json y Laravel version: ver backend/composer.json

