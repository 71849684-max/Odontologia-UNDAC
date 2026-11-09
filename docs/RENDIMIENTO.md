# Rendimiento e integridad

La campaña local del cierre de preproducción y los ensayos que no pasaron están documentados en `CIERRE_PREPRODUCCION_2026-11-09.md`; las métricas sin datos clínicos están en `evidencias/cierre-preproduccion-2026-11-09/carga.json`. No equivalen a certificación del servidor definitivo.

Los escenarios están en `backend/pruebas-rendimiento/escenarios.js`, seleccionados mediante `CARGA_ESCENARIO`: `listado`, `lectura`, `autoguardado` o `mixto`. Requieren k6 instalado. Las ejecuciones normales incluyen calentamiento, aumento progresivo y cinco minutos a carga estable. Los ensayos de humo duran doce segundos y no acreditan capacidad clínica.

## Datos exclusivos

Desde `frontend`:

```powershell
npm run pruebas:rendimiento:preparar
```

Genera o reutiliza 48 cuentas, entre ellas 45 alumnos, y 1.000 historias con anamnesis sintéticas de dos tamaños, distribuidas entre estados en proceso, pendientes de revisión, observadas y validadas. La primera historia de cada operador permanece editable para el autoguardado. Las historias tienen propietarios separados. Repetir la preparación reutiliza las historias sintéticas del mismo documento/operador y restablece sus marcadores; no debe ejecutarse durante una medición. El manifiesto incluye contraseñas y permanece en `backend/storage/pruebas-rendimiento/app/manifiesto-pruebas.json`, excluido de Git.

La base permitida es `bd_clinica_undac_rendimiento`, con entorno `pruebas_rendimiento` y almacenamiento separado. Los usuarios no alumnos permiten ampliar la campaña; la carga inicial mide operaciones de alumnos, no reproduce por sí sola toda la actividad de 40 alumnos y 8 docentes.

Para humo local puede iniciar `node scripts/servidorPruebas.mjs rendimiento` desde `frontend`, que sirve en `8012`. Para medir capacidad utilice Apache o PHP-FPM con la misma configuración de pruebas y un generador de carga en otro equipo. No atribuir a producción los tiempos de `php artisan serve`.

## Ejecución

Desde `backend/pruebas-rendimiento`, crear `resultados` si no existe:

```powershell
New-Item -ItemType Directory -Force resultados
$env:CARGA_URL = 'http://127.0.0.1:8012'
$env:CARGA_ESCENARIO = 'mixto'
$env:CARGA_EJECUCION = 'laboratorio-001'
$env:CARGA_HUMO = '1'
k6 run escenarios.js
$codigoCarga = $LASTEXITCODE
node verificarIntegridad.mjs
if ($LASTEXITCODE -ne 0 -or $codigoCarga -ne 0) { throw 'La campaña no pasó los umbrales o la verificación de integridad.' }
```

Para concurrencia preliminar, definir `CARGA_USUARIOS=5`. Para el ensayo nominal eliminar `CARGA_HUMO`; por defecto se utilizan 40 usuarios para listado/mixto y 30 para lectura/autoguardado. Ejecutar cada escenario por separado antes del mixto. La hipótesis nominal y el tamaño de muestra deben acordarse con la facultad antes de acreditar capacidad.

`CARGA_MANIFIESTO` permite indicar un manifiesto exclusivo distinto y `CARGA_INFORME` el destino del resumen. Guardar un resumen por ejecución. Los destinos locales de desarrollo `8001/5173` se rechazan explícitamente; un destino remoto exige verificar previamente que pertenece al entorno de rendimiento.

Cada usuario virtual inicia sesión con CSRF y su propia jarra de cookies. Los errores de sesión, 419, 429 y 5xx se contabilizan. No se relajan los límites de acceso. El autoguardado nominal espera 30 segundos entre iteraciones, fuera del tiempo HTTP medido.

## Umbrales y datos

| Medida | Criterio inicial |
| --- | --- |
| Listado de historias | p95 < 800 ms |
| Lectura de expediente | p95 < 1.200 ms |
| Autoguardado | p95 < 700 ms |
| Errores HTTP | < 1 % |
| Errores 5xx | 0 |
| Comprobaciones e integridad | 100 % |

El proceso sale con error si incumple los umbrales. El informe JSON contiene p50, p95, p99, tamaños de muestra y métricas por operación. Las peticiones se etiquetan como calentamiento, estable o recuperación; los límites de latencia se aplican a la fase estable y exigen al menos 30 muestras por operación en una campaña nominal. Los errores y la integridad se comprueban durante toda la ejecución. El humo exige al menos una muestra estable y no tiene valor estadístico para acreditar percentiles clínicos. Las escrituras incluyen marcadores de ejecución, usuario, historia e iteración. Se comprueba cada escritura mediante una lectura posterior. `verificarIntegridad.mjs` revisa todos los propietarios y marcadores del manifiesto al terminar; comprueba también historias que no hayan sido escritas durante la carga. La suite de navegador y la de Laravel verifican por separado las revisiones obsoletas entre sesiones.

## Recursos y reproducibilidad

Registrar antes de cada campaña: versión del commit, sistema, CPU, RAM, disco, Node/PHP/MySQL/k6, servidor web, configuración de PHP/MySQL, índices, tamaño de datos y perfil de red. Registrar antes y después los contadores de MySQL:

```powershell
# Desde backend
php artisan --env=pruebas_rendimiento pruebas:recursos
```

En Windows, desde `backend/pruebas-rendimiento`, ejecutar en otra terminal:

```powershell
./medirRecursos.ps1 -ProcesosPhp 1234,1235 -ProcesoMysql 5678 -Segundos 480
```

Sustituir los identificadores por los procesos reales del servidor de pruebas. El CSV incluye CPU normalizada al equipo, memoria e hilos. Si Apache ejecuta PHP dentro de sus propios procesos, seleccionar sus procesos. En Linux recoger métricas equivalentes del servicio y MySQL con las herramientas del servidor. Los contadores globales de MySQL y su CPU incluyen otras bases si el servidor es compartido; documentarlo y usar un servidor dedicado para acreditar la referencia de CPU MySQL sostenida < 70 %.

En Windows el medidor utiliza los contadores de rendimiento del sistema si no puede leer el tiempo de CPU de un servicio. `CpuDisponible` y `OrigenCpu` indican la procedencia; un contador no disponible se registra vacío, nunca como cero. No interpretar ausencia de permisos como ausencia de carga.

La medición del frontend está disponible con `npm run medir:compilacion`, después de compilar. Cuenta la entrada y los módulos precargados declarados en `dist/index.html`, con tamaño original y gzip. Las capturas de navegador acreditan apertura funcional; la meta clínica de apertura inferior a cuatro segundos exige medir el equipo/red de referencia y una muestra de tiempos, no solo el tamaño del archivo.
