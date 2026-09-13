# Organización del frontend

Los formularios viven en `src/aplicacion/formularios/`. Cada carpeta contiene el JSX y los archivos exclusivos de ese formulario. Por ejemplo:

```text
formularios/
  datos-paciente/DatosPacienteSection.jsx
  cuestionario-salud/
    CuestionarioSaludSection.jsx
    cuestionario-salud.config.mjs
  acceso/
    PaginaAcceso.jsx
    acceso.css
  odontograma/
    Odontograma.jsx
    HerramientasOdontograma.jsx
    GraficoOdontograma.jsx
    ShapeEditor.jsx
    odontograma.config.mjs
    opcionesOdontograma.mjs
    odontogramaRegistro.mjs
    odontograma.css
    odontograma.test.jsx
  compartidos/
    ControlesClinicos.jsx
    Subheading.jsx
    useSection.js
    opcionesClinicas.js
  registroFormularios.js
```

La misma organización se aplica a las 17 secciones clínicas, acceso, nueva historia, registro de paciente, usuarios, permisos, configuración y formularios de búsqueda. `paginas/` conserva las entradas de navegación; delegan en los formularios correspondientes. Los servicios y la autenticación siguen compartidos, sin cambios de comportamiento.

`src/css/app.css` es la entrada global, importada por `principal.jsx`: incorpora variables, estilos comunes, distribución y controles. Los estilos exclusivos, como acceso y odontograma, se importan desde su propio formulario. No se crean hojas vacías ni se duplican estilos comunes. Los datos exclusivos se mantienen junto al formulario en archivos `.config.mjs`; si se añaden JSON de animación, también deben colocarse en la carpeta que los utiliza. La configuración clínica conserva reexportaciones para compatibilidad.

## Marcado del odontograma

1. Elegir un hallazgo de la barra y su clasificación o material cuando corresponda.
2. Tocar una superficie para registrar el hallazgo directamente. No se exige dibujar.
3. Ausente (DAO) y extraído por caries (DEX) cubren las cinco superficies, con un único hallazgo por pieza. El selector permite cambiar la clasificación.
4. Consultar permite seleccionar sin modificar. Borrar marca quita primero la ausencia de toda la pieza; de lo contrario, quita el último hallazgo de la superficie o pieza seleccionada. Los hallazgos de conjuntos se quitan desde el listado.
5. Permanente, temporal y mixta cambian solo la vista; se conservan las 52 posiciones y sus registros.

El gráfico compacto es una representación esquemática. Las nuevas marcas directas se identifican como `representation: 'schematic'`; no inventan un contorno clínico. El trazado personalizado queda como opción adicional y conserva sus coordenadas originales. Los registros anteriores siguen siendo legibles. Esta vista interactiva no es una reproducción del formato gráfico oficial para impresión.

Los datos continúan guardándose por historia en el navegador. Las evaluaciones cerradas se consultan sin modificar y los nuevos hallazgos se registran en una nueva evaluación. Este trabajo modifica solo el frontend.

Validación: `npm test -- --maxWorkers=1 --testTimeout=20000` y `npm run build` desde `frontend/`.
