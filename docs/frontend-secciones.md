# Organización de las secciones clínicas del frontend

Las páginas generales ya se encuentran en `frontend/src/aplicacion/paginas/`. Las vistas de la historia clínica se organizan dentro de `frontend/src/aplicacion/componentes/clinica/`:

```text
clinica/
  HistoriaClinica.jsx           # Navegación, contexto del paciente y estado por sección
  ControlesClinicos.jsx         # Campos, tarjetas y controles visuales reutilizables
  SeccionesClinicas.jsx         # Reexportaciones para compatibilidad
  compartidos/
    useSection.js              # Lectura/escritura del formulario controlado
    Subheading.jsx             # Subtítulos compartidos
    opcionesClinicas.js        # Opciones comunes
  secciones/
    registroSecciones.js       # Relación entre los 17 identificadores y sus componentes
    DatosPacienteSection.jsx
    AnamnesisSection.jsx
    CuestionarioSaludSection.jsx
    AntecedentesSection.jsx
    ExamenClinicoSection.jsx
    ExamenExtraoralSection.jsx
    ExamenIntraoralSection.jsx
    OclusionSection.jsx
    ExamenesAuxiliaresSection.jsx
    DiagnosticoSection.jsx
    ModelosSection.jsx
    PlanTratamientoSection.jsx
    ConsentimientoSection.jsx
    CirugiaSection.jsx
    ReporteOperatorioSection.jsx
    SeguimientoSection.jsx
  Odontograma.jsx              # Módulo especializado, integrado en el mismo registro
  GraficoOdontograma.jsx       # Representación gráfica del odontograma
```

Cada sección importa solamente sus controles y catálogos necesarios. La tabla de signos vitales pertenece a `ReporteOperatorioSection.jsx`, ya que es exclusiva de esa vista. Los catálogos institucionales permanecen en `configuracion/historiaClinica.config.mjs`; el odontograma mantiene su configuración, lógica de registro y CSS independientes.

`HistoriaClinica.jsx` selecciona la vista mediante `componentesSeccion` y le entrega `values`, `onChange` y `meta`, además del contexto de historia/paciente que utiliza el odontograma. Las secciones de formulario notifican `onChange(clave, valor)`; el contenedor conserva sus datos al navegar. El odontograma conserva su almacenamiento local existente.

Para modificar una sección, edite su módulo. Para agregar una nueva, cree su componente, registre su identificador en `registroSecciones.js` y añada la información de navegación en `clinicalSections`. No añada formularios a `HistoriaClinica.jsx` ni a `SeccionesClinicas.jsx`.

Esta refactorización conserva los campos, estilos y comportamiento existentes. No añade persistencia de servidor ni cambia la autenticación.

Validación desde `frontend`: `npm test -- --maxWorkers=1 --testTimeout=20000` y `npm run build`.
