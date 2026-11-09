# Optimización y estados de carga — 9 de noviembre de 2026

## Cambios

- El odontograma y la vista previa de impresión se descargan cuando se solicitan. Cada carga tiene su límite de errores y permite recargar si falla la descarga del módulo, sin ocultar el resto del expediente mientras se prepara la impresión.
- El formulario utiliza un catálogo de ubicación reducido a identificadores y nombres. Los originales, la licencia, el orden y las relaciones se conservan. `npm run build` regenera la copia automáticamente; para desarrollo tras actualizar el catálogo se ejecuta `node scripts/prepararUbigeo.mjs` desde `frontend/`.
- Historias tiene una única consulta inicial. Las búsquedas agrupan la escritura durante 250 ms y descartan respuestas anteriores. Los errores de carga ofrecen reintento y se distinguen del resultado vacío. No se añade almacenamiento de información clínica en el navegador.
- Sesión, cambio de vista, expediente, odontograma, Historias, Usuarios, Auditoría, Configuración y Permisos comparten un indicador animado. Incluye texto accesible, barras decorativas, colores semánticos para ambos temas y desactiva las animaciones con `prefers-reduced-motion`.

## Medición

Comparación del archivo JavaScript principal `HistoriaClinicaApp` de las compilaciones de producción del mismo checkout:

| Medida | Antes | Después |
| --- | ---: | ---: |
| Tamaño minificado, sin compresión | 629 171 bytes | 216 863 bytes |
| Reducción del archivo principal | — | 65,53 % |
| Consultas iniciales del listado de Historias por montaje en producción | 2 | 1 |

Los módulos diferidos se transfieren al abrir sus funciones; la reducción no representa la descarga acumulada de todas las vistas. La compilación deja de advertir sobre archivos JavaScript superiores a 500 kB. Estas medidas describen transferencia y trabajo evitado, no acreditan una mejora equivalente de latencia del servidor ni capacidad de usuarios concurrentes.

## Verificación

Las pruebas de regresión incluyen apertura de las 17 secciones, impresión y retorno del foco, cascada de ubicación y equivalencia completa del catálogo reducido. Las pruebas de consultas comprueban la llamada inicial única, agrupación de escritura, descarte de respuestas antiguas y recuperación de errores.

Las pruebas de navegador usan Laravel y la base aislada: mantienen temporalmente una petición pendiente y después la envían al servidor real. Comprueban tema claro en escritorio, oscuro en móvil, ausencia de desbordamiento horizontal, animación y movimiento reducido, además de la apertura clínica. No sustituyen las respuestas de la API.

Resultados: 274 pruebas de frontend correctas en 37 archivos; compilación de producción y revisión de tokens correctas. Las pruebas de apertura clínica pasan en Chromium y Firefox. Se revisaron visualmente las capturas del indicador en [escritorio claro](evidencias/optimizacion-2026-11-09/carga-clara-escritorio.png) y [móvil oscuro](evidencias/optimizacion-2026-11-09/carga-oscura-movil.png).

Además, los 8 recorridos de carga y odontograma pasan en Chromium y Firefox: ambos temas, consulta inicial única, movimiento reducido y selección de las 52 posiciones dentales.
