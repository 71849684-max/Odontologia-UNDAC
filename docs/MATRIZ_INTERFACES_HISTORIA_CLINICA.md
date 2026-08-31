Matriz de Interfaces — Historia Clínica Odontológica (UNDAC)
============================================================
Instrucciones: cada fila representa una sección institucional (Fuente A) mapeada a la interfaz requerida, componente propuesto, rol y estado inicial (pendiente).

| # | Sección institucional       | Interfaz requerida                       | Componente propuesto               | Rol principal      | Estado     |
|---|-----------------------------|------------------------------------------|------------------------------------|--------------------|------------|
| 1 | Datos personales            | Formulario (lectura/editar)              | DatosPacienteForm                  | Alumno/Docente     | Pendiente  |
| 2 | Anamnesis                   | Formulario (texto rico/checkboxes)       | AnamnesisForm                      | Alumno             | Pendiente  |
| 3 | Cuestionario de salud (24)  | Formulario dinámico (24 ítems)           | CuestionarioSalud                  | Alumno             | Pendiente  |
| 4 | Antecedentes                | Tabs / Secciones                         | AntecedentesTabs                   | Alumno             | Pendiente  |
| 5 | Examen clínico general      | Formulario estructurado                   | ExamenClinicoForm                  | Alumno             | Pendiente  |
| 6 | Examen extraoral            | Formulario + imagen                     | ExamenExtraoralForm + GaleriaClinica| Alumno             | Pendiente  |
| 7 | Examen intraoral            | Formulario + fotos                      | ExamenIntraoralForm + GaleriaClinica| Alumno             | Pendiente  |
| 8 | Fotografías                 | Upload/Preview/Meta                      | GaleriaClinica / FileUpload        | Alumno             | Pendiente  |
| 9 | Oclusión                    | Formulario / select                     | OclusionForm                       | Alumno/Docente     | Pendiente  |
|10 | Pérdida dentaria            | Lista estructurada                       | PerdidaDentariaList                | Alumno             | Pendiente  |
|11 | Prótesis                   | Listado + detalles                       | ProtesisList / ProtesisForm        | Alumno/Docente     | Pendiente  |
|12 | Exámenes auxiliares         | Upload + resultados estructurados       | ExamenesAuxiliaresForm + Viewer    | Alumno/Docente     | Pendiente  |
|13 | Laboratorio                 | Upload / valores numéricos               | LaboratorioForm                    | Alumno/Docente     | Pendiente  |
|14 | Radiografías                | Upload + DICOM-lite viewer               | RadiografiaUpload + RadiografiaViewer| Alumno/Docente   | Pendiente  |
|15 | Modelos (impresiones)       | Upload / Metadatos                       | ModelosUpload                      | Alumno             | Pendiente  |
|16 | Diagnóstico                 | Texto estructurado + versiones           | DiagnosticoVersiones               | Alumno/Docente     | Pendiente  |
|17 | Pronóstico                  | Selector + nota                         | PronosticoField                    | Alumno/Docente     | Pendiente  |
|18 | Plan de tratamiento         | Multisección (procedimientos, tiempos)   | PlanTratamiento                    | Alumno/Docente     | Pendiente  |
|19 | Consentimiento              | Documento + firma digital (placeholder)  | ConsentimientoForm (placeholder)   | Alumno/Docente     | Pendiente  |
|20 | Firmas                      | Firma (imagen/svg) placeholder           | FirmaDigital (arquitectura)        | Docente/Alumno     | Pendiente  |
|21 | Programación de cirugía     | Calendario / agenda                      | ProgramacionCirugiaForm / Agenda   | Alumno/Docente     | Pendiente  |
|22 | Reporte operatorio          | Formulario estructurado                  | ReporteOperatorioForm              | Alumno             | Pendiente  |
|23 | Seguimiento                 | Timeline / agenda / checklist            | SeguimientoTimeline                | Alumno/Docente     | Pendiente  |
|24 | PDF                         | Generación (server-side)                 | PDFExportService (backend)         | Admin/Docente      | Pendiente  |
|25 | Usuarios / RBAC             | Gestión usuarios / roles                 | UsuariosList / UsuarioForm         | Administrador      | Pendiente  |
|26 | Auditoría                   | Cronología / filtro                      | AuditoriaTimeline                  | Administrador      | Pendiente  |

Notas:
- "Componente propuesto" son nombres sugeridos para la implementación modular. No crear aún; definir API y contratos antes.
- Estado "Pendiente" (FASE 1 = auditoría). Implementación por fases según docs/PLAN_IMPLEMENTACION_HISTORIA_CLINICA.md.
- Las interfaces deben mapear fielmente al formato institucional (Fuente A). Cualquier campo clínico NO definido en la fuente A debe marcarse como "DECISIÓN TÉCNICA PENDIENTE".
