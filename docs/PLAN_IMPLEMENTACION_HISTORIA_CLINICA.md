Plan de Implementación — Sistema de Historia Clínica Odontológica (UNDAC)
======================================================================
Resumen: Plan por fases entregable, priorizado para minimizar riesgo e integrar con el repo actual. Cada fase indica objetivo, componentes, páginas, dependencias, pruebas y criterios de aceptación.

Fase 1 — Auditoría (completa)
- Objetivo: Inventario, contrato clínico (Fuente A), diseño de APIs y plan de fases.
- Componentes: documentación (docs/), definición de config central.
- Dependencias: N/A
- Pruebas: revisión documental, validación con stakeholders clínicos.
- Criterios aceptación: Documento de arquitectura aprobado; matriz de interfaces completa.

Fase 2 — Layout (Historia clínica shell)
- Objetivo: Crear HistoriaClinicaLayout y navegación interna (sin campos clínicos completos).
- Componentes: HistoriaClinicaLayout, Sidebar, Header, Progress, SeccionHistoriaClinica wrapper.
- Páginas: /historia/:id (skeleton), /historia/nueva (skeleton)
- Dependencias: reutilizar BarraLateral, TablaRegistros
- Pruebas: visual, responsivity checks en breakpoints listados.
- Criterios aceptación: navegar entre secciones vacías; permisos básicos en UI (mostrar/ocultar acciones por rol demo).

Fase 3 — Pacientes (API + UI básico)
- Objetivo: Modelar paciente en backend, CRUD API y UI de registro/consulta.
- Componentes: DatosPacienteForm, PacientesList, PacienteDetalle
- Backend: migraciones tabla patients, modelo Patient, controller PatientController, rutas api/pacientes
- Dependencias: autenticación mínima (Sanctum) — DECISIÓN TÉCNICA PENDIENTE: elegir método de token
- Pruebas: API unit/integration, UI e2e demos
- Criterios aceptación: crear/editar/listar pacientes; datos persistidos en DB.

Fase 4 — Anamnesis
- Objetivo: Formulario anamnesis fiel al formato institucional.
- Componentes: AnamnesisForm, SeccionHistoriaClinica
- Backend: endpoints para seccion anamnesis en historias
- Pruebas: validación de campos, guardado parcial (autosave opcional)
- Criterios aceptación: campos requeridos y guardado en DB; versiones de sección.

Fase 5 — Antecedentes
- Objetivo: Implementar AntecedentesTabs y almacenamiento.
- Componentes: AntecedentesTabs
- Criterios aceptación: guardar múltiples antecedentes, editables.

Fase 6 — Examen clínico
- Objetivo: ExamenClinicoForm con sub-secciones (general, extraoral, intraoral)
- Componentes: ExamenClinicoForm, ExamenExtraoralForm, ExamenIntraoralForm
- Criterios aceptación: guardar, versionar, soportar imágenes (galería)

Fase 7 — Extraoral (Fotos)
- Objetivo: upload + preview para fotos extraorales
- Componentes: GaleriaClinica, FileUpload
- Backend: endpoints almacenamiento /uploads (protección, almacenamiento privado)
- Criterios aceptación: subir, preview, eliminar; thumbnails.

Fase 8 — Intraoral (Fotos)
- Objetivo: mismo que fase 7 pero para intraoral

Fase 9 — Odontograma (estudio)
- Objetivo: Analizar ClinicaRamos, definir API y arquitectura del odontograma (NO implementar aún)
- Entregable: especificación técnica para odontograma (inputs/outputs)

Fase 10 — Oclusión
- Implementar OclusionForm y relacionarlo con examen intraoral

Fase 11 — Exámenes auxiliares
- Uploads y viewers para radiografías y laboratorio

Fase 12 — Diagnóstico
- DiagnosticoVersiones: multi-version, comentarios docentes, estados (pendiente/observado/validado)

Fase 13 — Tratamiento
- PlanTratamiento con elementos estructurados (procedimientos, prioridad, costo si aplica)

Fase 14 — Consentimiento
- Formularios + PDF plantilla; placeholder para FirmaDigital
- Importante: revisar legal/institucional

Fase 15 — Cirugía (programación)
- ProgramacionCirugiaForm + calendario

Fase 16 — Seguimiento
- SeguimientoTimeline, agenda y recordatorios

Fase 17 — Usuarios/RBAC
- Implementar roles en backend, middleware y UI de administración
- Migraciones roles/permissions, políticas Laravel

Fase 18 — Auditoría
- Registrar cambios sensibles (auditable model events) y UI CronologiaEventos

Fase 19 — PDF
- Generación server-side (dompdf/laravel-snappy) para exportar historia completa

Fase 20 — Integración y QA
- Pruebas de integración, performance, revisión de seguridad

Notas de pruebas y aceptación
- Para cada fase escribir pruebas mínimas (API, UI) y casos clínicos de validación clínica con la Fuente A.
- Entregables: PRs pequeños por fase, documentación de API (OpenAPI), y migraciones.

Criterios de éxito global
- Todas las secciones del formulario institucional disponibles en UI y persistidas.
- RBAC implementado y verificado.
- Archivos (imágenes, radiografías) almacenados de forma segura (storage privado), accesos auditables.

