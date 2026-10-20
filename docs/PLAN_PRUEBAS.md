# Plan de pruebas — Sistema de Historia Clínica Odontológica UNDAC

**Producto:** Odontologia-UNDAC (clínica odontológica universitaria)  
**Versión del plan:** 1.0  
**Fecha:** 19 de octubre de 2026  
**Alcance:** frontend React + API Laravel + base MySQL `bd_clinica_undac`  
**Normativa de referencia clínica:** formato institucional de historia clínica (17 secciones / 6 momentos) y NTS N.° 188-MINSA/DGIESP-2022 (odontograma)

Este documento define *qué* se prueba, *con qué herramienta*, *quién* lo ejecuta y *cuándo se da por cerrado*. No sustituye los casos automatizados ya existentes; los usa como base y cubre los huecos.

---

## 1. Propósito

Garantizar que el software:

1. Conserva la integridad del expediente clínico (17 secciones, odontograma, consentimientos, archivos y firmas).
2. Respeta el control de acceso por rol (`ALUMNO`, `DOCENTE`, `ADMINISTRADOR`) y por asignación de historia.
3. Soporta el flujo académico-clínico real: registro de paciente → historia → revisión docente → validación → seguimiento.
4. Protege datos de salud (confidencialidad, no repudio vía bitácora, bloqueo de cuentas).
5. Es usable en consultorio y laboratorio (escritorio y tablet).
6. Es aceptado por coordinación de clínica, docentes y alumnos antes de uso asistencial.

## 2. Sistema bajo prueba

| Capa | Tecnología | Cómo se prueba hoy |
| --- | --- | --- |
| Frontend | React 19, Vite, Vitest, Testing Library, jsdom | `frontend`: `npm test` |
| API | Laravel 13, PHP 8.3, PHPUnit 12 | `backend`: `php artisan test` sobre `bd_clinica_undac_test` |
| Datos | MySQL (`bd_clinica_undac.sql`) | Transacciones por prueba (`DatabaseTransactions`) |
| Autenticación | Sesión web + CSRF, middleware `auth`, `usuario.activo`, `acceso:*`, `rol:ADMINISTRADOR`, `historia.acceso` | Feature tests de sesión y RBAC |

**Actores**

| Rol | Tipo de cuenta | Qué debe poder hacer | Qué no debe poder hacer |
| --- | --- | --- | --- |
| Alumno | `ALUMNO` | Registrar pacientes, abrir y editar historias asignadas, enviar a revisión, cargar evidencias | Ver historias ajenas, validar, administrar usuarios, cambiar estructura académica |
| Docente | `DOCENTE` | Supervisar todas las historias, aprobar/observar secciones, validar, reasignar operador, gestionar cursos/grupos/rotaciones | Entrar al módulo de administración (`/api/admin/*`) |
| Administrador | cuenta docente con rol `ADMINISTRADOR` | Usuarios, permisos, bitácora, parámetros | Desactivar su propia cuenta |

**Estados de historia clínica**

```
BORRADOR → EN_PROCESO → PENDIENTE_REVISION ⇄ OBSERVADA
                       ↘ VALIDADA (estado final; el alumno ya no edita)
```

**Módulos de permiso:** `TABLERO`, `PACIENTES`, `HISTORIAS`, `EXAMEN_CLINICO`, `ODONTOGRAMA`, `EXAMENES_AUXILIARES`, `DIAGNOSTICO_TRATAMIENTO`, `CONSENTIMIENTO`, `PROGRAMACION`, `REPORTE_OPERATORIO`, `SEGUIMIENTO`, `CURSOS`, `PERIODOS`, `GRUPOS`, `ROTACIONES`, `USUARIOS`, `ROLES`, `EXPORTAR_PDF`, `PARAMETROS`, `CATALOGOS_CLINICOS`, `BITACORA`.

## 3. Estrategia

Se usa una pirámide de pruebas. Lo barato y estable se automatiza; lo clínico y legal se valida con personas.

```
                    Aceptación (UAT clínica)
                 Usabilidad  ·  E2E navegador
              Funcionales UI  ·  Seguridad dirigida
           Integración API (PHPUnit Feature)
        Unitarias (reglas, IMC, fechas, transiciones)
```

| Prioridad | Tipo | Automatizar | Frecuencia |
| --- | --- | --- | --- |
| P0 | Unitarias, integración API, seguridad de acceso | Sí | Cada commit / PR |
| P1 | Funcionales de UI, regresión, E2E de flujo clínico | Sí (E2E al CI nocturno) | Cada PR (funcional) / nightly (E2E) |
| P2 | Rendimiento, estrés | Sí, en entorno de carga | Antes de cada entrega y de clínica |
| P3 | Usabilidad, aceptación | Protocolo manual + evidencia | Cierre de sprint e implantación |

**Principio de datos clínicos:** ninguna prueba usa DNI, nombres o imágenes de pacientes reales. Los artefactos (fotos, firmas, RX) son fakes de PHPUnit o blobs de prueba.

## 4. Entorno

| Entorno | Uso | Base | URL típica |
| --- | --- | --- | --- |
| Local | Desarrollo y unitarias | `bd_clinica_undac` | frontend `127.0.0.1:5173`, API `127.0.0.1:8001` |
| Test | PHPUnit | `bd_clinica_undac_test` (copia importada del SQL) | sin UI |
| Staging | E2E, rendimiento, UAT | Copia anonimizada | a definir en Laragon / servidor de clínica |
| Producción | Solo humo post-despliegue | `bd_clinica_undac` | clínica UNDAC |

**Cuentas de prueba (no usar en producción)**

| Usuario sugerido | Rol | Clave de laboratorio |
| --- | --- | --- |
| `alumno.clinica` | ALUMNO | `ClaveDePrueba123*` (mismo patrón que `CreaUsuarios`) |
| `docente.clinica` | DOCENTE | idem |
| `admin.clinica` | ADMINISTRADOR | idem |
| `alumno.inactivo` | ALUMNO desactivado | para negativos de sesión |

**Comandos de referencia**

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && php artisan test
```

---

## 5. Pruebas unitarias

### 5.1 Objetivo

Verificar funciones puras y reglas de negocio **sin red ni base de datos**: validación de secciones, IMC, alertas clínicas, transiciones de estado en UI, fechas, permisos de vista, odontograma (FDI / superficies).

### 5.2 Herramientas

- Frontend: Vitest + Testing Library (cuando el SUT es un componente pequeño).
- Backend: PHPUnit en `backend/tests/Unit` (**suite a crear**; hoy `phpunit.xml` solo declara Feature).

### 5.3 Cobertura actual

| SUT | Archivo | Qué cubre |
| --- | --- | --- |
| IMC, coherencia, validación de sección, alertas | `frontend/.../reglasClinicas.test.js` | DNI 8 dígitos, pregunta 21 condicional a diabetes, alergias |
| Fechas día/mes/año | `frontend/.../fechas.test.mjs` | parseo institucional |
| Resumen terapéutico | `frontend/.../resumenTerapeutico.test.mjs` | pendiente / no / detalle |
| Acciones de estado | `frontend/.../accionesEstado.test.js` | transiciones por rol |
| Permisos de vista | `Sesion.test.jsx` (`puedeVerRuta`) | menú administración |
| Estructura 17 secciones / 6 momentos | `estructuraClinica.test.mjs` | contrato institucional |
| Odontograma NTS 188 | `odontograma.test.jsx` (parte pura) | 32+20 piezas, 5 superficies, hallazgos |
| Porcentaje de progreso | `ProgresoHistoriaTest.php` | 17/17 = 100 % |
| Valores de fecha | `ValoresFechaTest.php` | interpretación día/mes/año |

### 5.4 Casos a ejecutar / completar

| ID | Unidad | Entrada | Resultado esperado | Prioridad |
| --- | --- | --- | --- | --- |
| UNI-01 | `validarSeccion('datos-paciente')` | DNI de 7 dígitos | error «El DNI debe tener 8 dígitos» | P0 |
| UNI-02 | `validarSeccion('datos-paciente')` | fecha de nacimiento futura | rechazo | P0 |
| UNI-03 | `validarSeccion('anamnesis')` | sin motivo ni HEA | dos errores obligatorios | P0 |
| UNI-04 | `validarSeccion('cuestionario-salud')` | q20 = Sí, q21 vacío | pregunta 21 obligatoria | P0 |
| UNI-05 | `calcularImc(70, 165)` | talla en cm | 25.7 Normal | P0 |
| UNI-06 | `calcularImc(70, 1.65)` | talla en m | mismo resultado | P0 |
| UNI-07 | `calcularImc(0, 1.70)` | peso inválido | `null` | P1 |
| UNI-08 | `buildClinicalAlerts` | q13 = Sí (penicilina) | alerta `critical` | P0 |
| UNI-09 | `buildClinicalAlerts` | alergia + HTA + diabetes | critical + warning, sin duplicar | P0 |
| UNI-10 | `cambiosCoherentes` | `ningunHijo = Sí` | limpia conteos de hijos | P1 |
| UNI-11 | `accionesDeEstado` | BORRADOR + alumno | solo `PENDIENTE_REVISION` | P0 |
| UNI-12 | `accionesDeEstado` | PENDIENTE_REVISION + docente | `VALIDADA`, `OBSERVADA` (esta exige texto) | P0 |
| UNI-13 | `accionesDeEstado` | VALIDADA + cualquier rol | sin transiciones | P0 |
| UNI-14 | `vistaPermitida('auditoria')` | sin `BITACORA` | false | P0 |
| UNI-15 | `seccionesPermitidas` | sin `ODONTOGRAMA` | oculta sección odontograma | P0 |
| UNI-16 | `AccesoHistorias::puedeVer` | alumno no asignado | false (**mover a Unit con dobles**) | P0 |
| UNI-17 | `AccesoHistorias::puedeModificar` | alumno + VALIDADA | false | P0 |
| UNI-18 | `AccesoHistorias::seccionesBloqueadas` | sección `approved` | no editable por alumno | P0 |
| UNI-19 | `ServicioHistorias` transiciones | VALIDADA → EN_PROCESO | excepción | P0 |
| UNI-20 | Odontograma | hallazgo en superficie O de 16 | no altera M/D/V/L ni otras piezas | P0 |
| UNI-21 | Odontograma | evaluación cerrada | solo lectura | P0 |
| UNI-22 | `porcentaje(n)` | 0, 16, 17 | 0, 94, 100 | P1 |

### 5.5 Criterios

- Entrada: función aislable, sin I/O.
- Salida: 100 % de UNI-P0 en verde; cobertura de ramas en `reglasClinicas.mjs`, `AccesoHistorias`, transiciones de `ServicioHistorias` ≥ 90 %.
- Fallo bloqueante: regla clínica incorrecta (IMC, alergia, DNI, transición ilegal).

---

## 6. Pruebas de integración

### 6.1 Objetivo

Comprobar que API, sesión, middleware, persistencia MySQL y archivos privados colaboran: el JSON que envía el frontend se materializa en tablas clínicas y vuelve igual al recargar (`ContratoExpedienteTest`).

### 6.2 Herramientas

PHPUnit Feature (`backend/tests/Feature`), `actingAs` + `DatabaseTransactions`, `UploadedFile::fake()`.

### 6.3 Flujos de integración (módulos)

```
SPA  →  /api/csrf + login
     →  pacientes / historias / expediente / odontograma / archivos
     →  estado (revisión / observación / validación)
     →  notificaciones al docente
     →  auditoria
     →  admin (solo ADMINISTRADOR)
```

### 6.4 Casos

| ID | Integración | Pasos | Esperado | Evidencia actual |
| --- | --- | --- | --- | --- |
| INT-01 | Paciente + historia + anamnesis | POST paciente → POST historia → PUT expediente | filas en `paciente`, `historia_clinica`, `anamnesis`, `historia_alumno` OPERADOR | `ClinicaFlujoTest` |
| INT-02 | Segunda HC del mismo paciente | dos POST `/historias` | ambas vigentes, mismo DNI | `ClinicaFlujoTest` |
| INT-03 | Contrato expediente 17 secciones | PUT cada clave FE → GET | round-trip idéntico | `ContratoExpedienteTest` |
| INT-04 | Odontograma + catálogo | PUT hallazgos → GET | normalización NTS 188; cerrado = inmutable | `OdontogramaTest` |
| INT-05 | Archivos clínicos | subir foto → listar → descargar → borrar | storage privado + FK a historia | `ArchivosClinicosTest` |
| INT-06 | Firma de consentimiento | subir `firmaPaciente` dos veces | reemplaza anterior, vinculada a consentimiento | `ArchivosClinicosTest` |
| INT-07 | Equipo clínico | docente reasigna operador | `historia_alumno` actualizado | `EquipoClinicoTest` |
| INT-08 | Aprobación de sección | docente `approved` | alumno recibe 409 al editar esa sección | `EquipoClinicoTest` |
| INT-09 | Seguimiento | POST control + PATCH | persistido; alumno ajeno 404 | `SeguimientosCrudTest` |
| INT-10 | Programación de cirugía | PATCH programacion | fechas/equipo guardados | `SeguimientosCrudTest` |
| INT-11 | Notificación de revisión | alumno envía sección a review | fila en notificaciones del docente | `NotificacionesTest` |
| INT-12 | Académico | docente crea periodo/curso; alumno no | 201 vs 403 | `ClinicaFlujoTest` |
| INT-13 | Administración | CRUD usuario, permisos, auditoría, config | solo admin | `AdministracionModuloTest` |
| INT-14 | Inactivar historia | DELETE historia | `anulado_en` set, oculta en listados | `InactivarHistoriaTest` |
| INT-15 | Observación docente | PATCH OBSERVADA + texto | historial de observaciones | `ObservarHistoriaTest` |
| INT-16 | Perfil y clave | PUT perfil / PUT clave | hash nuevo; admin restablece otra cuenta | `CuentaPropiaTest` |
| INT-17 | Pacientes por asignación | alumno lista | solo asignados; búsqueda DNI exacta | `PacientesAccesoTest` |
| INT-18 | CSRF + sesión | login → `/api/auth/yo` → logout | 200 / 401 | `InicioSesionTest` |

### 6.5 Huecos de integración (a implementar)

| ID | Hueco | Motivo |
| --- | --- | --- |
| INT-19 | Grupos, membresías, rotaciones y docentes de rotación | `ControladorAcademico` tiene endpoints poco cubiertos |
| INT-20 | `GET /api/personal` + asignación concurrente de dos docentes | condición de carrera en operador |
| INT-21 | Autoguardado: dos PUT expediente simultáneos | último escritor vs fusión |
| INT-22 | Marcar notificación leída / leer-todas con throttle | parcial en `NotificacionesTest` |
| INT-23 | Permiso `EXPORTAR_PDF` (si ya hay generación) | submódulo existe; hay que integrar o marcar N/A |
| INT-24 | Catálogos clínicos (`CATALOGOS_CLINICOS`) | configuración |

### 6.6 Criterios

- Toda ruta de `backend/routes/api.php` tiene al menos un caso feliz y un caso de denegación.
- El expediente round-trip no pierde claves del frontend (`MATRIZ_CAMPOS_FE_BE_BD.md`).
- Archivos no se sirven sin sesión ni cruzando `idHistoria`.

---

## 7. Pruebas funcionales

### 7.1 Objetivo

Validar **requisitos de usuario** en la interfaz (lo que el alumno/docente/admin ve y hace), con datos simulados o API mockeada: formularios, workspace clínico, administración, auditoría.

### 7.2 Herramientas

Vitest + Testing Library + `user-event`. Donde hay API, se mockea `clienteHttp` (como en `Administracion.test.jsx`, `Sesion.test.jsx`, `Auditoria.test.jsx`).

### 7.3 Mapa requisito → prueba

| Módulo | Requisito funcional | ID | Archivo / caso |
| --- | --- | --- | --- |
| Acceso | Credencial inválida no abre panel | FUN-01 | `Sesion.test.jsx` |
| Acceso | Bloqueo por intentos se muestra | FUN-02 | `Sesion.test.jsx` |
| Acceso | Sesión se recupera al recargar | FUN-03 | `Sesion.test.jsx` |
| Acceso | Alumno no renderiza admin | FUN-04 | `Sesion.test.jsx` |
| Tablero | KPI navegan a sección clínica | FUN-05 | `estructuraClinica.test.mjs` |
| Pacientes | Alta y precarga en nueva HC | FUN-06 | `NuevaHistoriaApp.test.jsx`, `ComponentesModulos.test.jsx` |
| Paciente | Ubigeo en cascada | FUN-07 | `DatosPacienteSection.test.jsx` |
| Paciente | Edad desde fecha de nacimiento | FUN-08 | `DatosPacienteSection.test.jsx` |
| HC | 17 secciones montan sin placeholder | FUN-09 | `HistoriaClinicaModular.test.jsx` (`test.each`) |
| HC | Seis momentos, drawer móvil, Escape/foco | FUN-10 | `HistoriaClinicaModular.test.jsx` |
| HC | No mezcla datos al cambiar de momento | FUN-11 | `HistoriaClinicaModular.test.jsx` |
| HC | Sección incompleta no se marca completa | FUN-12 | `HistoriaClinicaModular.test.jsx` |
| Salud | Pregunta 21 solo si diabetes | FUN-13 | idem + `reglasClinicas` |
| Revisión | Alumno envía / docente aprueba | FUN-14 | `HistoriaClinicaModular.test.jsx` |
| Autoguardado | Estados guardar/error/imprimir | FUN-15 | `HistoriaClinicaModular.test.jsx` |
| Archivos | Formato, visor, firma vs huella | FUN-16 | `CargaArchivos.test.jsx` |
| Odontograma | Servidor vs local, corrupción | FUN-17 | `odontogramaServidor.test.jsx` |
| Historias | Botones según estado y rol | FUN-18 | `accionesEstado.test.js` |
| Admin | Usuarios, permisos, plantilla de rol | FUN-19 | `Administracion.test.jsx` |
| Auditoría | Separa accesos y acciones de HC | FUN-20 | `Auditoria.test.jsx` |
| Datos demo | No hay pacientes ficticios | FUN-21 | `DatosSimuladosEliminados.test.jsx` |
| Responsive | Panel y workspace | FUN-22 | `DashboardResponsive.test.jsx`, `DisenoClaude.test.jsx` |

### 7.4 Funcionales pendientes (huecos de UI)

| ID | Función | Notas |
| --- | --- | --- |
| FUN-23 | Búsqueda de historias (filtros estado, DNI, operador) | hay API; falta prueba de `HistoriasApp` |
| FUN-24 | Inactivar historia desde UI (`BotonEliminacionClinica`) | backend cubierto |
| FUN-25 | Diálogo de asignación de operador | componente existe |
| FUN-26 | Alertas clínicas visibles en cabecera (penicilina, HTA) | lógica unitaria sí, UI no |
| FUN-27 | Grupos académicos / tabla de rotaciones | `TablaRotacionesGrupo.jsx` |
| FUN-28 | Cambio de contraseña desde perfil | API cubierto |
| FUN-29 | Marcar notificaciones leídas en campana | |
| FUN-30 | Impresión / vista previa del expediente | FUN-15 toca el botón; no valida contenido impreso |
| FUN-31 | Consentimiento: 9 bloques + programación de cirugía | parcial |
| FUN-32 | Reporte operatorio: signos vitales pre/intra/post | |

### 7.5 Criterios

Cada historia de usuario clínica tiene un caso feliz, uno de validación y uno de permiso denegado. Defecto P0: no se puede completar una sección institucional o se pierde dato al navegar.

---

## 8. Pruebas de extremo a extremo (E2E)

### 8.1 Objetivo

Ejercitar el sistema **como en consultorio**: navegador real + API real + MySQL de staging, sin mocks. Hoy **no hay suite E2E** (ni Playwright ni Cypress). Se introduce Playwright (encaja con Vite, permite traza y video).

### 8.2 Herramienta propuesta

- Playwright (Chromium + un pases en Firefox).
- Proyecto: `frontend/e2e/`.
- Arranque: API Laravel en `8001` + Vite preview o `vite dev`.
- Datos: seeder de laboratorio o el mismo `CreaUsuarios` vía artisan.

### 8.3 Escenarios E2E (caminos críticos)

| ID | Nombre | Actores | Pasos resumidos | Resultado |
| --- | --- | --- | --- | --- |
| E2E-01 | Ingreso y sesión | alumno | CSRF → login → tablero → logout → `/api/auth/yo` = 401 | sesión limpia |
| E2E-02 | Alta de paciente | alumno | Pacientes → nuevo → DNI 8 dígitos → guardar → aparece en lista | persistido |
| E2E-03 | Historia completa de ingreso | alumno | Nueva HC → datos paciente → anamnesis → cuestionario (24) → antecedentes | progreso > 0, autoguardado OK |
| E2E-04 | Evaluación estomatológica | alumno | Examen general (IMC) → extraoral foto → intraoral → odontograma pieza 16 O caries → oclusión | expediente y odontograma en GET |
| E2E-05 | Síntesis y plan | alumno | Auxiliares + RX → diagnóstico presuntivo/definitivo → modelos → plan por fases | secciones en `complete` o `review` |
| E2E-06 | Cirugía y consentimiento | alumno | Consentimiento + firma pad + huella imagen → programación → reporte operatorio | archivos privados, no 404 cruzado |
| E2E-07 | Envío a revisión | alumno → docente | Alumno `PENDIENTE_REVISION` → docente ve notificación → observa con texto → alumno corrige → docente `VALIDADA` | alumno ya no edita (409) |
| E2E-08 | Aislamiento entre alumnos | A y B | B busca DNI de paciente de A | 0 resultados; URL directa 404 |
| E2E-09 | Docente aprueba sección | docente | Aprueba anamnesis; alumno intenta editar motivo | campo bloqueado / 409 |
| E2E-10 | Administración | admin | Crea alumno, retira `HISTORIAS`, el alumno pierde el menú | 403 en API |
| E2E-11 | Académico | docente | Periodo → curso → grupo → rotación → asignar alumno | visible en ficha |
| E2E-12 | Recuperación de sesión | alumno | Login → recargar F5 | permanece en panel |
| E2E-13 | Bloqueo de cuenta | atacante | 5+ claves malas | mensaje de bloqueo, sin enumerar usuario |
| E2E-14 | Tablet 768 px | alumno | Drawer de momentos, odontograma modal, carga de foto | usable sin overlay trabado |
| E2E-15 | Humo post-despliegue | todos | login de los 3 roles + listar historias | < 2 min |

### 8.4 Criterios

- P0: E2E-01, 02, 03, 07, 08, 12, 13 en verde en Chromium.
- Evidencia: traza Playwright + captura del estado VALIDADA.
- No se publica video con datos reales.

---

## 9. Pruebas de regresión

### 9.1 Objetivo

Asegurar que un cambio (permisos, odontograma, autoguardado, CSS del workspace) **no rompe** flujos ya cerrados.

### 9.2 Estrategia

| Capa | Suite de regresión | Cuándo |
| --- | --- | --- |
| Automática rápida | `npm test` + `php artisan test` | cada PR (gate) |
| Automática clínica | E2E-01…08 | nightly y antes de tag |
| Manual dirigida | lista de humo de 30 min (anexo A) | cada release a staging |
| Contrato de datos | `ContratoExpedienteTest` + `estructuraClinica.test.mjs` | obligatorio si se toca expediente u odontograma |

### 9.3 Disparadores de regresión total (no negociable)

Cualquier cambio en:

- `AccesoHistorias`, middleware `historia.acceso` / `acceso:` / `rol:`
- `ServicioExpediente`, `ContratoExpedienteTest`
- Odontograma (catálogo NTS 188, cierre de evaluación)
- Login, bloqueo, CSRF
- Autoguardado / conflicto de pestañas
- Permisos de rol o plantillas
- Inactivar historia / archivos privados

### 9.4 Casos de regresión etiquetados

| ID | Tras un cambio en… | Verificar |
| --- | --- | --- |
| REG-01 | Validación de sección | las otras 16 secciones siguen guardando |
| REG-02 | CSS workspace | drawer móvil, foco Escape, hamburguesa (`HistoriaClinicaModular`) |
| REG-03 | Plantilla de rol docente | no pisa excepción personal (`AdministracionModuloTest`) |
| REG-04 | Firma digital | la huella sigue siendo imagen, no pad |
| REG-05 | Listado de historias | inactivas no reaparecen |
| REG-06 | Fecha institucional | edad del paciente y observaciones `dd/mm/aaaa` |
| REG-07 | Proxy Vite `/api` | login SPA no pierde cookie |
| REG-08 | Catálogo odontograma | evaluaciones cerradas no se reabren |

### 9.5 Criterios

Ningún P0/P1 de la última entrega vuelve a fallar. Si falla el contrato de expediente, se detiene el merge.

---

## 10. Pruebas de seguridad

Datos de salud: se trata como información sensible (Ley 29733 y expediente clínico). El objetivo es **confidencialidad, integridad, autenticación y auditoría**, no “encontrar exploits de terceros”.

### 10.1 Controles ya cubiertos (automatizados)

| Control | Prueba |
| --- | --- |
| Mensaje genérico login (no enumeración) | `InicioSesionTest` |
| Usuario inactivo | idem |
| Bloqueo por fallos consecutivos + throttle | idem |
| Contraseña ausente del JSON | idem |
| IP y user-agent en intentos | idem |
| 401 sin sesión | `AccesoAdministracionTest`, `InicioSesionTest` |
| Alumno/docente no entran a `/api/admin` | `AccesoAdministracionTest` |
| Alumno no ve historia ajena (404, no 403) | `AccesoHistoriasTest` |
| Archivo no se baja desde otra historia | `ArchivosClinicosTest` |
| Historia VALIDADA: alumno 409 | `AccesoHistoriasTest` |
| Cabeceras `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Cache-Control: no-store` | `AccesoHistoriasTest` |
| Formatos de archivo no permitidos | `ArchivosClinicosTest` |
| Rol vencido / revocado | `AccesoAdministracionTest` |
| Desactivar o bloquear corta sesión en curso | `AccesoAdministracionTest` |
| Quitar submódulo retira API y menú | admin + `Sesion.test.jsx` |
| Bitácora separa accesos y acciones de HC | `AdministracionModuloTest` |

### 10.2 Casos de seguridad a ejecutar

| ID | Amenaza | Prueba (caja negra / API) | Esperado |
| --- | --- | --- | --- |
| SEG-01 | IDOR de historia | alumno B `GET /api/historias/{idA}` | 404 |
| SEG-02 | IDOR de archivo | B `GET .../archivos/{idA}` | 404 |
| SEG-03 | IDOR de paciente | B `PUT /api/pacientes/{idA}` | 404/403 |
| SEG-04 | Escalada vertical | alumno `GET /api/admin/usuarios` | 403 |
| SEG-05 | Escalada de estado | alumno `PATCH estado=VALIDADA` | 403 |
| SEG-06 | Edición post-validación | alumno PUT expediente | 409 |
| SEG-07 | CSRF | POST login/expediente sin token | rechazo |
| SEG-08 | XSS almacenado | anamnesis `<script>` / `onerror=` | se persiste escapado; no ejecuta en UI |
| SEG-09 | Subida maliciosa | `.php`, `.html`, SVG con script | 422 |
| SEG-10 | Path traversal en archivo | `campo=../../etc` | 422 (`ArchivosClinicosTest` campos desconocidos) |
| SEG-11 | Fuerza bruta | > límite throttle | 429 |
| SEG-12 | Enumeración de usuarios | user inexistente vs clave mala | mismo mensaje |
| SEG-13 | Sesión fijada / logout | logout + reutilizar cookie | 401 |
| SEG-14 | Cache de expediente | GET historia | `no-store` |
| SEG-15 | Clickjacking | cabecera `X-Frame-Options: DENY` | presente |
| SEG-16 | Mass assignment | PUT expediente con `id_alumno` ajeno | se ignora |
| SEG-17 | Permiso fino de sección | sin `ODONTOGRAMA` | 403 PUT odontograma |
| SEG-18 | SQL en búsqueda | `q=' OR 1=1` | 0 o lista autorizada, sin dump |
| SEG-19 | Auditoría de acceso | abrir expediente | fila en `auditoria` |
| SEG-20 | No desactivar cuenta propia | admin contra sí mismo | 422 (`AdministracionModuloTest`) |
| SEG-21 | Storage privado | URL directa `/storage/...` | no público |
| SEG-22 | Política de clave | clave débil al cambiar | 422 |
| SEG-23 | HTTPS / cookie `Secure` `HttpOnly` `SameSite` | staging | cookie de sesión no leíble por JS |
| SEG-24 | Revisión de dependencias | `composer audit`, `npm audit` | sin CVE alta sin mitigar |

### 10.3 Fuera de alcance de este plan

No se entregan procedimientos de explotación, payloads de ataque ni pruebas ofensivas contra sistemas ajenos. Las pruebas SEG-* se limitan a **verificar que el control existe** (respuesta 401/403/404/409/422, cabeceras, auditoría).

### 10.4 Criterios

P0 de acceso (SEG-01 a SEG-07, SEG-11, SEG-12, SEG-21) en verde. Hallazgo de IDOR o archivo clínico público **detiene el pase a clínica**.

---

## 11. Pruebas de rendimiento

### 11.1 Objetivo

Medir tiempos bajo carga **esperada de clínica** (no de saturación). Meta: el alumno no espera el autoguardado ni el odontograma en una ficha típica.

### 11.2 Hipótesis de carga (ajustar con coordinación)

| Perfil | Estimación inicial |
| --- | --- |
| Alumnos concurrentes en laboratorio | 40 |
| Docentes concurrentes | 8 |
| Historias abiertas simultáneas | 30 |
| Autoguardado | 1 PUT expediente / 30 s por ficha abierta |
| Listado | 20 consultas/min de `/api/historias` |
| Adjuntos | fotos 1–3 MB; RX hasta 8 MB |

### 11.3 Herramienta propuesta

k6 (scripts en `backend/tests/performance/`) contra staging. Alternativa académica: Apache JMeter.

### 11.4 Casos

| ID | Escenario | Carga | Umbral (staging) |
| --- | --- | --- | --- |
| PER-01 | Login | 20 rps × 2 min | p95 < 500 ms, error < 1 % |
| PER-02 | Listar historias | 40 VU, 5 min | p95 < 800 ms |
| PER-03 | GET expediente completo | 30 VU | p95 < 1.2 s |
| PER-04 | PUT expediente (autoguardado) | 30 VU cada 30 s | p95 < 700 ms, 0 pérdida de datos |
| PER-05 | GET/PUT odontograma | 20 VU | p95 < 900 ms |
| PER-06 | Subida foto 2 MB | 10 VU | p95 < 3 s |
| PER-07 | Dashboard + notificaciones | 40 VU | p95 < 400 ms |
| PER-08 | Auditoría paginada | 5 VU admin | p95 < 1.5 s |
| PER-09 | Frontend: TTI historia | Lighthouse / Playwright | TTI < 4 s en desktop laboratorio |
| PER-10 | Impresión expediente | 5 concurrentes | < 5 s a vista previa |

### 11.5 Criterios

Ningún umbral P0 (PER-02, PER-03, PER-04) superado. CPU MySQL < 70 % sostenido. Sin errores 5xx.

---

## 12. Pruebas de estrés

### 12.1 Objetivo

Encontrar el **punto de quiebre** y comprobar degradación elegante (429, cola, mensaje de reintento), no el rendimiento nominal.

### 12.2 Casos

| ID | Estrés | Procedimiento | Observar |
| --- | --- | --- | --- |
| STR-01 | Pico de login (inicio de turno) | 100 intentos/s × 1 min | throttle, sin 500, sin enumeración |
| STR-02 | Autoguardado masivo | 80 fichas PUT cada 5 s × 10 min | integridad expediente, locks MySQL |
| STR-03 | Subidas concurrentes | 25 RX de 8 MB a la vez | disco, timeout, rechazo controlado |
| STR-04 | Listados sin índice percibido | `q` amplio + paginación profunda | tiempo y memoria PHP |
| STR-05 | Sesiones abiertas | 200 sesiones idle + 1 GET `/auth/yo` | driver de sesión |
| STR-06 | Odontograma JSON grande | 52 piezas × múltiples hallazgos + trazos | 413 o recorte documentado, nunca JSON truncado a medias |
| STR-07 | Recuperación | tras STR-02, bajar a carga PER | p95 vuelve a umbral en < 5 min |
| STR-08 | Base saturada | conexión max + 1 request clínico | error controlado al usuario, log en `laravel.log` |

### 12.3 Criterios

- No hay corrupción de expediente ni archivos cruzados entre historias.
- El sistema se recupera (STR-07) sin reinicio manual, o el runbook documenta el reinicio.
- El punto de quiebre (VU máximos) queda escrito para capacidad del laboratorio.

**No se ejecuta estrés en producción ni contra pacientes reales.**

---

## 13. Pruebas de usabilidad

### 13.1 Objetivo

Comprobar que un alumno de clínica y un docente pueden completar la historia **sin capacitación especializada de software**, en el tiempo de una atención, con teclado, mouse y tablet.

### 13.2 Método

- 6 participantes: 4 alumnos, 2 docentes (ninguno del equipo de desarrollo).
- Tareas cronometradas + SUS (System Usability Scale) al final.
- Observación: errores, dudas, clics extra, pérdida de datos.
- Breakpoints: 1280×800 (escritorio clínica) y 768×1024 (tablet).
- Accesibilidad: contraste, foco visible, Escape cierra diálogos (ya hay tests de foco), etiquetas de controles (`getByLabelText`).

### 13.3 Tareas

| ID | Tarea | Éxito | Tiempo guía |
| --- | --- | --- | --- |
| USA-01 | Iniciar sesión y ubicar “Mis historias” | sin ayuda | < 1 min |
| USA-02 | Registrar paciente y abrir HC | DNI y filiación correctos | < 4 min |
| USA-03 | Completar anamnesis + cuestionario 24 | pregunta 21 aparece solo si diabetes | < 8 min |
| USA-04 | Marcar caries en 16 oclusal y guardar | leyenda y recarga OK | < 3 min |
| USA-05 | Adjuntar foto extraoral y ver visor | miniatura + modal | < 2 min |
| USA-06 | Enviar a revisión | docente recibe aviso | < 1 min |
| USA-07 | Docente observa y alumno entiende el texto | historial visible | < 3 min |
| USA-08 | Firmar consentimiento en pad | trazo visible, no confundir con huella | < 2 min |
| USA-09 | Navegar 6 momentos en tablet | drawer no tapa guardar | sin callejón |
| USA-10 | Recuperar trabajo tras F5 | autoguardado restauró | 0 datos perdidos |

### 13.4 Métricas de salida

- ≥ 80 % de tareas completadas sin ayuda.
- SUS promedio ≥ 70.
- 0 pérdidas de datos en USA-10.
- Hallazgos de accesibilidad serios (foco atrapado, control sin nombre) = P1.

---

## 14. Pruebas de aceptación

### 14.1 Objetivo

Que **coordinación de clínica, docentes responsables y un representante de alumnos** firmen que el software cumple el formato institucional y el flujo docente-alumno. Criterio de negocio, no de código.

### 14.2 Participantes

| Rol UAT | Decide |
| --- | --- |
| Coordinación de clínica odontológica | expediente usable en rotación |
| Docente supervisor | revisión, observación, validación, congelamiento |
| Alumno de último año / internado | carga en tiempo real de atención |
| Administrador de sistemas / facultad | usuarios, bitácora, respaldos |
| Asesoría legal / calidad (si aplica) | consentimiento, retención, Ley 29733 |

### 14.3 Guion de aceptación (pass/fail)

| ID | Criterio de aceptación | Rol que prueba | Pasa si |
| --- | --- | --- | --- |
| UAT-01 | Las 17 secciones del formato UNDAC existen y en el orden de 6 momentos | coordinación | checklist institucional firmado |
| UAT-02 | El odontograma respeta FDI y hallazgos NTS 188 acordados con odontología | docente clínico | no se usa catálogo ajeno a 6.1 |
| UAT-03 | El alumno solo ve sus pacientes/historias | alumno A y B | aislamiento demostrado |
| UAT-04 | El docente valida y el alumno ya no altera el expediente | par alumno-docente | intento de edición bloqueado |
| UAT-05 | Observación deja rastro leíble y fecha | docente | texto en historial |
| UAT-06 | Consentimiento con firma y huella del paciente/familiar | alumno + docente | constancias visibles |
| UAT-07 | Fotografías y RX quedan en la historia correcta | alumno | visor; no se mezclan fichas |
| UAT-08 | Alertas de alergia a penicilina se ven antes de planificar | docente | badge/alerta crítica |
| UAT-09 | Usuarios y permisos se gestionan sin tocar base | admin | alta, baja, retiro de submódulo |
| UAT-10 | Bitácora muestra quién abrió/editó una HC | admin + coordinación | trazabilidad |
| UAT-11 | Historia inactivada no aparece en búsqueda clínica | docente | ocultamiento |
| UAT-12 | Periodo, curso, grupo y rotación se asignan al operador | docente | ficha académica coherente |
| UAT-13 | Impresión o vista para archivo físico es legible | coordinación | no corta campos obligatorios |
| UAT-14 | El sistema no muestra datos de demostración | todos | `DatosSimuladosEliminados` |
| UAT-15 | Respaldo y restauración de `bd_clinica_undac` ensayados | admin sistemas | restore en laboratorio OK |

### 14.4 Criterios de salida de UAT

- Todos los UAT-P0 (01 a 07, 09, 10, 14) en *pasa*.
- Defectos abiertos: 0 críticos, 0 altos de seguridad, menores documentados con fecha.
- Acta de aceptación firmada (anexo B).

---

## 15. Matriz de trazabilidad (resumen)

| Requisito de negocio | UNI | INT | FUN | E2E | REG | SEG | PER/STR | USA | UAT |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Login y bloqueo | | INT-18 | FUN-01..03 | E2E-01,12,13 | REG-07 | SEG-07,11-13 | PER-01, STR-01 | USA-01 | |
| RBAC y permisos | UNI-14,15 | INT-13 | FUN-04,19 | E2E-10 | REG-03 | SEG-04,17 | | | UAT-09 |
| Paciente + HC | UNI-01,02 | INT-01,02,17 | FUN-06..08 | E2E-02,03 | | SEG-03 | PER-02 | USA-02 | UAT-01 |
| 17 secciones / validación | UNI-03..10 | INT-03 | FUN-09..13 | E2E-03..06 | REG-01 | SEG-08,16 | PER-03,04 | USA-03 | UAT-01 |
| Odontograma NTS 188 | UNI-20,21 | INT-04 | FUN-17 | E2E-04 | REG-08 | | PER-05, STR-06 | USA-04 | UAT-02 |
| Archivos / firmas | | INT-05,06 | FUN-16 | E2E-06 | REG-04 | SEG-02,09-10,21 | PER-06, STR-03 | USA-05,08 | UAT-06,07 |
| Revisión docente | UNI-11..13,16..19 | INT-08,15 | FUN-14,18 | E2E-07,09 | | SEG-05,06 | | USA-06,07 | UAT-04,05 |
| Aislamiento alumno | UNI-16 | INT-17 | | E2E-08 | | SEG-01 | | | UAT-03 |
| Académico | | INT-12,19 | FUN-27 | E2E-11 | | | | | UAT-12 |
| Auditoría | | INT-13 | FUN-20 | | | SEG-19 | PER-08 | | UAT-10 |
| Inactivar HC | | INT-14 | FUN-24 | | REG-05 | | | | UAT-11 |
| Alertas clínicas | UNI-08,09 | | FUN-26 | | | | | | UAT-08 |

## 16. Criterios globales

**Entrada a una campaña de pruebas**

- Rama integrable, `npm test` y `php artisan test` ejecutables.
- Staging con SQL importado, sin datos reales.
- Cuentas de los tres roles.

**Suspensión**

- Ambiente caído, corrupción de `bd_clinica_undac_test`, o hallazgo SEG de IDOR.

**Salida a clínica (go-live)**

- P0 unitarias + integración + seguridad en verde.
- E2E-01, 02, 03, 07, 08, 12, 13 verdes.
- UAT acta firmada.
- PER-02/03/04 dentro de umbral en staging.
- Backup restaurado al menos una vez.

## 17. Roles de la campaña

| Rol | Responsabilidad |
| --- | --- |
| Equipo de desarrollo | UNI, INT, FUN, REG automática; corrige defectos |
| QA / tesista de pruebas | E2E, matrices, evidencias, regresión manual |
| Docente clínico | UAT-02, 04, 05, 08 y odontograma |
| Coordinación de clínica | UAT institucional e impresión |
| Admin de sistemas | SEG-23/24, respaldos, rendimiento en staging |

## 18. Entregables

1. Este plan (`docs/PLAN_PRUEBAS.md`).
2. Informe de ejecución por tipo (fecha, ambiente, pasados/fallados, defectos).
3. Colección Playwright (cuando se implemente) y reportes k6.
4. Acta de UAT (anexo B).
5. Registro de defectos (crítico / alto / medio / bajo) con ID de caso.

## 19. Riesgos

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| `phpunit.xml` no tiene suite Unit | reglas de `AccesoHistorias` solo se ven por Feature | crear `tests/Unit` y extraer casos UNI-16..19 |
| No hay E2E real | regresiones de SPA+cookie se escapan | Playwright en CI nightly (sección 8) |
| Autoguardado concurrente no cubierto | pérdida de sección | INT-21 + STR-02 |
| UAT con datos reales | filtración | solo staging anonimizado |
| Odontograma local vs servidor | ficha distinta entre PC del laboratorio | FUN-17 + E2E-04 |
| Arquitectura.md desactualizada | pruebas contra un diseño viejo | este plan manda sobre docs de 2026-08 |

## 20. Orden de ejecución recomendado

1. Completar huecos P0 unitarios (transiciones, acceso, alertas UI).
2. Cerrar INT-19..21 y FUN-23..26.
3. Automatizar E2E-01, 02, 03, 07, 08.
4. Pasar SEG-08, 17, 21, 23 en staging.
5. Baseline PER-02..04.
6. Sesión de usabilidad (6 personas).
7. UAT formal y acta.
8. Estrés controlado (STR-01, 02, 07) **después** de UAT funcional, no antes.

---

## Anexo A — Humo manual de 30 minutos (regresión de release)

1. Login alumno / docente / admin.
2. Alta de paciente + HC + anamnesis + guardar.
3. Odontograma: un hallazgo, recargar.
4. Subir foto, abrir visor, borrar.
5. Enviar a revisión; docente observa; alumno corrige; docente valida.
6. Alumno B no ve la ficha.
7. Admin: listar bitácora del paso 5.
8. Logout y F5 no reabre panel.

## Anexo B — Acta de aceptación (plantilla)

- Producto / versión / fecha / ambiente.
- Participantes y roles.
- UAT-01…15: pasa / no pasa / N/A.
- Defectos abiertos.
- Decisión: **aceptado** / **aceptado con reservas** / **rechazado**.
- Firmas: coordinación de clínica, docente supervisor, administrador, desarrollo.
