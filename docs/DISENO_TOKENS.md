# Diseño, temas y capas

Las correcciones adicionales del modo oscuro viven en `modo-oscuro.css`, con selectores restringidos al tema. Los títulos heredados usan texto claro; los campos tienen superficie propia y borde visible, los selectores nativos siguen el esquema oscuro y las tablas distinguen cabecera, selección y paso del puntero. El foco utiliza el acento turquesa. Estas reglas no modifican los colores del modo claro ni el papel de impresión. Se comprobó el contraste de una muestra aislada de formulario, botón, error y tabla con axe en escritorio y móvil; esta comprobación no sustituye los recorridos autenticados completos.

Los colores de interfaz se consumen mediante alias semánticos en `frontend/src/css/aplicacion/variables.css`. Las antiguas definiciones de paleta de otras hojas se centralizaron manteniendo los nombres que ya utilizan las vistas. El botón de tema de la cabecera guarda la preferencia en `undac:tema`; sin preferencia se usa la del sistema. La cabecera clínica conserva el diseño aprobado, sin añadir controles generales.

El modo oscuro conserva la apariencia posterior a la migración. El modo claro recupera los colores del proyecto anteriores a ella, tomando como referencia el commit `2a0feea7`. Las reglas restringidas a `:root:not([data-tema="oscuro"])` recuperan los tonos originales sin modificar las capas, medidas o interacciones. Sus colores están centralizados como `--color-paleta-original-*`; los sufijos hexadecimales identifican el tono y los demás identificadores distinguen transparencias. Las variables de cada componente se siguen resolviendo en su contexto local. El papel de impresión y la simbología clínica conservan sus reglas propias.

Se revisaron cuatro ámbitos: modales/visores, navegación y paneles, formularios/tablas y odontograma/impresión. Los fondos de acciones tienen tokens propios para conservar texto blanco legible cuando los colores de estado se aclaran en el tema oscuro. La cabecera y la barra de navegación usan colores legibles sobre la marca.

La escala `--ou-z-*` es la única fuente de capas numéricas. Las capas locales de contenido elevado/seleccionado/activo permanecen por debajo de los encabezados; el fondo móvil precede al panel lateral y el modal secundario permite superponer la edición del odontograma a su visor. No basta con aumentar números: revisar siempre contexto de apilamiento, contenedores con recorte, portales, `transform` y `inert`.

Los colores rojos/azules de los hallazgos y los colores del papel/tinta no se invierten con el tema. La selección del odontograma continúa gris y no se usa como hallazgo. Los tokens específicos de herramientas conservan sus colores operativos. Los pocos colores literales inventariados en código corresponden a dibujos clínicos y a imágenes rasterizadas de firma/documento; no aplicarles colores de texto o de superficie del modo oscuro.

```powershell
# Desde frontend
npm run verificar:tokens
```

La comprobación analiza CSS y literales de color en código, rechaza cualquier capa fuera de la escala y cualquier aumento respecto de `docs/deuda-tokens-visuales.json`. El detalle por selector se encuentra en `docs/INVENTARIO_TOKENS_VISUALES.md`. `--registrar-inventario` es una operación de mantenimiento tras revisar una migración; no debe ejecutarse en integración continua para aceptar deuda nueva automáticamente.

El [inventario de migración](evidencias/2026-11-08/migracion-tokens.json) conserva, por archivo, selector y contexto, los valores anteriores y actuales y los factores de apilamiento declarados en cada regla. Es un inventario generado del cambio, no una certificación manual de cada selector; las evidencias visuales y funcionales se describen a continuación.

La suite de navegador verifica modal, foco, cierre con Escape y contraste mediante axe en 1280×800, 768×1024 y 390×844, en claro y oscuro. Compara el modal con imágenes de referencia por navegador en `frontend/pruebas-navegador/referencias`, con fuentes cargadas y animaciones desactivadas. Regenerar mediante `npm run pruebas:navegador -- --update-snapshots` únicamente después de revisar un cambio visual; repetir con Firefox cuando corresponda. También comprueba el panel clínico móvil, vista de impresión y neutralidad de selección del odontograma. Las capturas complementarias se adjuntan al informe. La aceptación clínica de simbología y la revisión visual institucional siguen siendo responsabilidad del equipo clínico.
