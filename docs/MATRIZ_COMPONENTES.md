Matriz de Componentes
=====================
Inventario de componentes relevantes (extraído de frontend/src). Indica si existe, ruta, reutilizable y recomendación.

Formato: Componente | Existe | Ruta actual | Reutilizable | Modificar | Crear | Dependencias | Prioridad

- Aplicacion | Sí | frontend/src/aplicacion/Aplicacion.jsx | No (entry orchestration) | No | - | React | Alto
- PaginaAcceso | Sí | frontend/src/aplicacion/paginas/PaginaAcceso.jsx | Parcialmente (demo) | Sí (hacer real auth) | - | CSS, lucide-react | Alto
- PaginaPanel | Sí | frontend/src/aplicacion/paginas/PaginaPanel.jsx | Parcialmente | Sí (añadir router) | - | Componentes de panel | Alto
- BarraLateral | Sí | frontend/src/aplicacion/componentes/panel/BarraLateral.jsx | Sí | Sí (permitir links y permisos) | - | Iconos | Alto
- EncabezadoPanel | Sí | frontend/src/aplicacion/componentes/panel/EncabezadoPanel.jsx | Sí | Sí | - | - | Medio
- TablaRegistros | Sí | frontend/src/aplicacion/componentes/modulos/TablaRegistros.jsx | Sí | Sí (expandir opciones) | - | CSS | Alto
- VistaModulo | Sí | frontend/src/aplicacion/componentes/modulos/VistaModulo.jsx | Sí | Sí | - | - | Medio
- DialogoSesionExpirada | Sí | frontend/src/aplicacion/componentes/interfaz/DialogoSesionExpirada.jsx | Sí | No | - | - | Medio
- MarcaInstitucional | Sí | frontend/src/aplicacion/componentes/interfaz/MarcaInstitucional.jsx | Sí | No | - | - | Bajo
- TarjetaIndicador | Sí | frontend/src/aplicacion/componentes/panel/TarjetaIndicador.jsx | Sí | No | - | - | Medio
- TablaActividad | Sí | frontend/src/aplicacion/componentes/panel/TablaActividad.jsx | Sí | No | - | - | Medio
- PanelConfiguracion | Sí | frontend/src/aplicacion/componentes/modulos/PanelConfiguracion.jsx | Parcialmente | Sí | - | - | Bajo
- PanelDistribucion | Sí | frontend/src/aplicacion/componentes/modulos/PanelDistribucion.jsx | Sí | No | - | - | Bajo
- AgendaSeguimientos | Sí | frontend/src/aplicacion/componentes/modulos/AgendaSeguimientos.jsx | Parcialmente | Sí | - | - | Medio
- BibliotecaRecursos | Sí | frontend/src/aplicacion/componentes/modulos/BibliotecaRecursos.jsx | Sí | No | - | - | Bajo
- CronologiaEventos | Sí | frontend/src/aplicacion/componentes/modulos/CronologiaEventos.jsx | Sí | No | - | - | Medio

Componentes nuevos requeridos (resumen y prioridad)
- HistoriaClinicaLayout | No | - | Sí (propuesta) | - | Crear | Layout + Sidebar + Header | Crítico
- HistoriaClinicaSidebar | No | - | Sí | - | Crear | RBAC, navegación | Alto
- HistoriaClinicaHeader | No | - | Sí | - | Crear | Firma, progreso | Alto
- HistoriaClinicaProgress | No | - | Sí | - | Crear | Estado de secciones | Medio
- SeccionHistoriaClinica (wrapper) | No | - | Sí | - | Crear | Permitir lazy loading | Alto
- Formularios clínicos (AnamnesisForm, CuestionarioSalud, AntecedentesTabs, ExamenClinicoForm, ExamenExtraoralForm, ExamenIntraoralForm, OclusionForm, ExamenesAuxiliares, DiagnosticoVersiones, PlanTratamientoForm) | No | - | Parcialmente | - | Crear | Formularios, validación | Crítico
- GaleriaClinica / FileUpload | No | - | Sí | - | Crear | Manejo de archivos, previews | Crítico
- RadiografiaViewer | No | - | No | - | Crear | Viewer para imágenes radiográficas | Medio
- Odontograma (arquitectura) | No | - | No | - | Crear (fase futura) | Canvas/SVG | Alto (fase separada)
- FirmaDigital (placeholder) | No | - | No | - | Crear | Integrar con firma images | Medio

Recomendaciones generales
- Reutilizar TablaRegistros y Panel components para listas y tablas.
- Consolidar estilos: definir reglas Tailwind + variables globales; mantener CSS existente y migrar progresivamente.
- Centralizar configuración de secciones en frontend/src/configuracion/historiaClinica.js.

