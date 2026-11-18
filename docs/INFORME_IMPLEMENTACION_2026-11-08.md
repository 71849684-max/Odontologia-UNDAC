# Informe de implementación — 8 de noviembre de 2026

## Entregado

- Suite Playwright con navegador, Laravel, cookies, protección contra falsificación de peticiones y MySQL reales; 18 casos incluyendo los cinco recorridos principales, concurrencia, apertura, teclado, contraste y odontograma.
- Entornos exclusivos de navegador y rendimiento, datos sintéticos repetibles, usuarios MySQL limitados y almacenamiento separado. La aplicación de desarrollo conserva `5173/8001` y su base.
- Referencias visuales de Chromium y Firefox en claro/oscuro para escritorio, tablet y móvil.
- Escenarios k6 parametrizados, fases de calentamiento/estable/recuperación, umbrales por operación, marcadores de integridad y consulta de recursos.
- Carga diferida de vistas con estado de carga y recuperación tras errores, manteniendo el estado clínico dentro de su proveedor.
- Tokens semánticos y escala de capas centralizados; selector de tema y comprobación que impide aumentar la deuda visual. Quedan siete literales inventariados en gráficos clínicos o generación de imágenes; no son colores nuevos de interfaz.
- Flujo de GitHub Actions para PHPUnit, Vitest, tokens, compilación, Chromium y Firefox; documentación de instalación y ejecución.

## Correcciones detectadas durante las pruebas

1. El parche de codificación buscaba caracteres mediante una comparación que podía coincidir con texto correcto. Ahora usa comparación binaria, comprueba cada campo y conserva el original si no puede convertirlo.
2. La creación de historia podía ejecutarse antes de conocer la disponibilidad de la API. El botón espera a que termine esa comprobación.
3. El formulario clínico permite editar únicamente después de cargar el expediente. Las acciones de revisión también esperan la carga.
4. Las escrituras con una revisión obsoleta se rechazan sin sobrescribir datos. Las escrituras propias del frontend se serializan y los conflictos detienen el autoguardado hasta recargar.
5. Adjuntos y odontograma mantienen su persistencia independiente: no invalidan la huella del formulario y el autoguardado no reenvía un odontograma antiguo.
6. Una petición a la API sin sesión devuelve 401 aunque no incluya `Accept: application/json`, sin intentar redirigir a una ruta de acceso inexistente.

## Evidencias disponibles

| Comprobación | Resultado |
| --- | --- |
| PHPUnit | 120 pruebas aprobadas, 824 aserciones |
| Vitest | 241 pruebas aprobadas en 26 archivos |
| Compilación | Correcta; las vistas se descargan por separado |
| Pint de archivos modificados de backend | Aprobado |
| Tokens | Cero capas numéricas fuera de la escala; siete colores clínicos/raster inventariados |
| Referencias de modales | Seis por navegador, revisadas en claro y oscuro |
| Estabilidad completa de Chromium | 54 comprobaciones aprobadas (18 casos repetidos tres veces, sin reintentos) |
| Pase completo de Firefox | 18 casos aprobados |

La entrada original tenía 217.116 bytes gzip. La medición posterior cuenta tanto la entrada como los módulos precargados del HTML; consultar los [archivos de compilación](evidencias/2026-11-08/compilacion-despues.json) y la [medición inicial](evidencias/2026-11-08/compilacion-antes.json). La reducción de JavaScript inicial ronda el 60 %. El módulo clínico sigue superando el aviso de 500 KB antes de gzip; no se ocultó ni aumentó ese límite.

## Rendimiento: alcance de lo comprobado

Entorno local: Windows 11 (compilación 26300), Intel Core i5-10300H de cuatro núcleos/ocho procesadores lógicos, aproximadamente 24 GB de RAM, PHP 8.5.8, Node 24.22.1, MySQL 8.4.3, k6 2.3.0 y servidor `php artisan serve`. Generador, servidor y otras aplicaciones comparten el equipo y MySQL. No es el servidor clínico de referencia.

Un humo inicial de un usuario pasó y la comprobación posterior validó los marcadores de las 1.000 historias sintéticas. Un ensayo corto con cinco usuarios obtuvo p95 de 548 ms en listado, 841 ms en lectura y 573 ms en guardado, con integridad completa y cero errores HTTP/5xx.

Los ensayos posteriores en este equipo compartido superaron los límites de latencia; conservaron las comprobaciones de integridad y no mostraron errores HTTP/5xx. Los umbrales produjeron salida fallida, como corresponde. Se conservan los resultados, tanto aprobados como fallidos, en [rendimiento preliminar](evidencias/2026-11-08/rendimiento-preliminar.json). No seleccionar solo el ensayo favorable para declarar capacidad. Esas ejecuciones preceden a la separación explícita de fases del script final.

El [humo del script final](evidencias/2026-11-08/rendimiento-script-final.json), con fases separadas y un usuario, aprobó los umbrales y la integridad; la comprobación posterior volvió a validar las 1.000 historias. La muestra es demasiado pequeña para acreditar capacidad. Después se regeneró la muestra final con distribución de estados, manteniendo editables las historias destinadas al autoguardado; su composición consta en [recursos MySQL](evidencias/2026-11-08/recursos-mysql.json).

La instrumentación está implementada, pero el criterio de rendimiento nominal **no está acreditado**. Falta ejecutar los escenarios finales con 30/40 usuarios y cinco minutos estables en un servidor representativo, con la concurrencia acordada con la facultad y recursos observados. La integridad y los tiempos deben aprobarse en la misma campaña.

## Límites y siguiente validación

- El flujo de GitHub Actions está versionado, pero no se ha ejecutado en GitHub desde este trabajo local. Revisar allí también las referencias visuales frente al renderizado del ejecutor Linux.
- La revisión del expediente es opcional por compatibilidad: los clientes anteriores deben empezar a enviarla para obtener protección entre sesiones.
- Las capturas y los contrastes automatizados no sustituyen la aceptación clínica de simbología, formato impreso y usabilidad institucional.
- El aviso de canvas de jsdom permanece en la suite de frontend; no impide las pruebas aprobadas. Las comprobaciones de navegador utilizan canvas real.

Guías: [navegador](PRUEBAS_NAVEGADOR.md), [rendimiento](RENDIMIENTO.md), [diseño](DISENO_TOKENS.md).
