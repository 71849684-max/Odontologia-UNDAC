# Plan de implementación: navegador, rendimiento y diseño

Fecha: 8 de noviembre de 2026. Estado: implementación técnica realizada; navegador aprobado en Chromium y Firefox, aceptación de rendimiento nominal pendiente.

## Objetivo y orden

Comprobar los recorridos clínicos en un navegador real, medir la capacidad con usuarios concurrentes y corregir gradualmente los estilos. Este documento describe trabajo futuro: no acredita pruebas ejecutadas ni capacidad de producción.

Orden pendiente: integrar la suite con el entorno aislado existente → recorridos de navegador → carga concurrente y división por vistas → normalización visual → regresión y documentación. El inventario visual puede prepararse durante las primeras fases; los cambios visuales se verifican con la suite de navegador ya disponible.

Entorno verificado durante la implementación: la dirección indicada, `127.0.0.1:5173`, corresponde al frontend de trabajo, conectado a la base `bd_clinica_undac`. Se conservaron sus puertos y datos. Las pruebas se implementaron con bases exclusivas de navegador y rendimiento, usuarios MySQL limitados, almacenamiento propio y puertos separados. Consultar `docs/PRUEBAS_NAVEGADOR.md` y `docs/INFORME_IMPLEMENTACION_2026-11-08.md`.

Referencias locales: `AGENTS.md`, `docs/PLAN_PRUEBAS.md`, `docs/MATRIZ_COMPONENTES.md`, `docs/MATRIZ_INTERFACES_HISTORIA_CLINICA.md`, `docs/superpowers/specs/2026-09-22-historia-clinica-pantalla-completa-design.md` y `docs/odontograma-nts188.md`. Las matrices y algunas notas describen etapas anteriores: contrastar con el código antes de convertirlas en requisitos nuevos. No cambiar campos clínicos, símbolos ni permisos como parte de este plan.

## Punto de partida verificado

- React/Vite y Laravel ya tienen pruebas automatizadas. `backend/tests/E2E/FlujoClinicoCompletoTest.php` ejecuta solicitudes de Laravel, sin navegador.
- `frontend/package.json` no incluye Playwright; no existe infraestructura de integración continua versionada en `.github`.
- Vite dirige `/api` a `http://127.0.0.1:8001`; mantener ese destino para desarrollo.
- `backend/phpunit.xml` utiliza `bd_clinica_undac_test`. Conectar la suite de navegador al entorno aislado existente y comprobar que no interfiera con PHPUnit; no asumir que deba crearse otra base.
- `bd_clinica_undac.sql` contiene `CREATE DATABASE bd_clinica_undac` y `USE bd_clinica_undac`. Elegir una base en la línea de comandos no cambia esas instrucciones.
- Existe `clinica:parches` en `backend/routes/console.php`; reutilizar su mecanismo, comprobando primero su destino efectivo.
- `Aplicacion.jsx` importa las vistas de forma estática. La compilación revisada genera aproximadamente 1,04 MB de JavaScript antes de gzip.
- Los tokens y la escala de capas están en `frontend/src/css/aplicacion/variables.css`; quedan literales y capas numéricas en otras hojas.
- Se corrigió el guardado académico alternativo en el navegador. Mantener sus pruebas y comprobar la persistencia real entre sesiones.

## Fase 1. Entorno existente: referencia de integración

Estado: implementado y comprobado. Se utilizan `PrepararPruebas.php`, `.env.pruebas_navegador`, `.env.pruebas_rendimiento`, `scripts/prepararEntorno.mjs` y `scripts/servidorPruebas.mjs`. Las tareas siguientes conservan el diseño original como trazabilidad; los nombres propuestos se sustituyen por los archivos reales de las guías. No volver a preparar los datos durante una campaña activa.

### Tarea 1.1. Separar procesos, configuración y almacenamiento

Archivos propuestos: `frontend/playwright.config.js`, `frontend/vite.navegador.config.js`, `backend/.env.navegador.example` y `docs/PRUEBAS_NAVEGADOR.md`.

1. Reservar API `127.0.0.1:8011` y frontend `127.0.0.1:5183`. Estos puertos son exclusivos de la suite y parametrizables.
2. Usar una configuración Vite de pruebas que reutilice la base, configure el proxy hacia `8011`, fije el puerto y falle si está ocupado. No modificar el proxy habitual de `8001`.
3. Dar a `vite preview` el mismo proxy cuando se pruebe la compilación. El navegador usará únicamente el origen del frontend para `/api` y cookies.
4. Configurar Laravel con `APP_ENV=pruebas_navegador`, MySQL `bd_clinica_undac_navegador`, sesiones persistentes en archivo y directorios exclusivos de sesiones, caché, registros y archivos clínicos.
5. No usar el modo `testing` que puede omitir CSRF, ni sesiones `array`, ni deshabilitar middleware. Verificar mediante una petición negativa que el proceso servido realmente exige CSRF.
6. Arrancar procesos con comprobaciones de disponibilidad. No reutilizar un servidor existente sin verificar su configuración. Detener solo los procesos iniciados por la suite.
7. Usar un usuario MySQL limitado a la base de navegador. El ejemplo de entorno no incluirá credenciales reales.

Salida: ambos servicios arrancan de manera reproducible y una petición sin sesión a `/api/auth/yo` responde 401 a través del proxy.

### Tarea 1.2. Preparar y reiniciar datos sintéticos

Archivos propuestos: `backend/app/Console/Commands/PrepararPruebasNavegador.php`, `backend/database/seeders/SeederPruebasNavegador.php` y utilidades de preparación SQL si resultan necesarias.

1. Implementar `pruebas:navegador:preparar` con comprobación del entorno y del nombre exacto de base permitido antes de escribir o reiniciar. Rechazar explícitamente la base de desarrollo y la de PHPUnit.
2. Preparar una copia temporal del esquema que adapte únicamente las instrucciones de creación/selección de base. Revisar también referencias calificadas, permisos, disparadores y posibles definidores. Nunca importar el SQL original sin esa adaptación y verificación.
3. Aplicar los parches pendientes sobre la conexión aislada. No utilizar `migrate:fresh`: el esquema clínico se distribuye en SQL.
4. Crear administrador, docente supervisor, alumnos A y B y un segundo administrador para verificar grupos. Preparar roles, permisos, periodo, curso y asignaciones necesarias para que el docente pueda revisar la historia del alumno A.
5. Generar datos deterministas con identificador de ejecución, fechas coherentes y documentos sintéticos que cumplan las validaciones. Reutilizar las reglas de `CreaUsuarios` como referencia, sin depender de una transacción de PHPUnit entre procesos.
6. Separar datos por caso. Comenzar con un trabajador; antes de paralelizar, asignar cuentas y registros por trabajador y evitar reinicios concurrentes de la misma base.
7. Comprobar que la preparación puede repetirse y que la limpieza no toca archivos de desarrollo.

Salida: ejecución repetible, datos exclusivamente ficticios y rechazo probado de un destino no permitido. No exponer endpoints HTTP para preparar datos.

## Fase 2. Suite de navegador con API real

Estado: implementada. Incluye los cinco recorridos, controles CSRF y casos adicionales de concurrencia, apertura, diseño y odontograma. Los resultados finales y las repeticiones se registran en el informe de implementación.

### Tarea 2.1. Incorporar Playwright

1. Añadir `@playwright/test` como dependencia de desarrollo y fijar su resolución en el archivo de bloqueo. Instalar Chromium; ejecutar también Firefox en la campaña ampliada.
2. Crear `frontend/pruebas-navegador/` con ayudas de navegación, inicio de sesión y datos por ejecución. Excluirlo de Vitest para que cada ejecutor descubra únicamente sus pruebas.
3. Proponer comandos `npm run pruebas:navegador`, `npm run pruebas:navegador:interfaz` y `npm run pruebas:navegador:informe`. Documentar instalación del navegador y preparación del entorno.
4. Usar selectores por rol, etiqueta y texto accesible en español. Agregar identificadores de prueba únicamente cuando no exista un selector semántico estable.
5. Esperar respuestas relevantes y estados visibles; no usar pausas arbitrarias para el autoguardado. No interceptar peticiones para fabricar respuestas ni simular `clienteHttp`.
6. Aislar actores con contextos de navegador diferentes. Cada contexto obtiene sus propias cookies mediante el inicio de sesión real. No compartir el estado autenticado entre alumnos.
7. Capturar informe, consola, errores de página, trazas y capturas ante fallos. Excluir cookies persistidas, credenciales e informes generados del repositorio.

### Tarea 2.2. Implementar los cinco recorridos

Archivos propuestos y comprobaciones:

| Archivo | Actores y recorrido | Evidencia de cierre |
| --- | --- | --- |
| `sesion.spec.js` | Alumno inicia sesión por interfaz, recarga, cierra sesión y vuelve a recargar | Sesión conservada tras la primera recarga; `/api/auth/yo` responde 401 después del cierre y no permite reabrir datos privados |
| `pacienteHistoria.spec.js` | Alumno A registra paciente e historia, completa anamnesis, espera guardado y recarga | Identificador y valores exactos coinciden en interfaz y lectura autenticada del expediente; una sesión nueva del mismo alumno recupera esos valores |
| `revisionDocente.spec.js` | Alumno A envía; docente observa con texto; alumno corrige y reenvía; docente valida | Observación y estados persistidos; alumno ya no puede editar; intento real de escritura posterior obtiene el rechazo definido por el contrato |
| `aislamientoAlumno.spec.js` | Alumno B intenta abrir la historia de A mediante URL directa y consultar su expediente | Respuesta 404 conforme al contrato; no aparecen identificadores ni datos clínicos de A en la vista de B |
| `grupoCompartido.spec.js` | Administrador crea grupo; segundo administrador entra en contexto limpio y lo busca | Mismo identificador, código y nombre desde el servidor, sin depender de `localStorage` compartido |

Las solicitudes directas sirven como comprobación complementaria; el alta, las correcciones y las transiciones se realizan desde la interfaz. Obtener identificadores de respuestas reales, sin asumir IDs fijos.

### Tarea 2.3. Demostrar cookies y CSRF reales

1. Verificar la entrega de `XSRF-TOKEN` y la cookie de sesión, y que las escrituras normales envían `X-XSRF-TOKEN` usando el flujo existente.
2. Desde un contexto autenticado, enviar una escritura sin token CSRF y otra con token inválido: esperar 419 y ausencia de cambios. Usar solicitudes sin el reintento automático de `clienteHttp` para esta comprobación negativa.
3. Confirmar después que la escritura normal desde el formulario sí funciona. La respuesta 419 por sí sola no demuestra el recorrido completo.
4. Registrar una recuperación real de token caducado si puede provocarse de manera determinista, sin eliminar la protección del servidor.

Cierre de fase: cinco recorridos y controles CSRF aprobados, tres ejecuciones consecutivas sin reintentos para acreditar estabilidad. Los reintentos diagnósticos no convierten una prueba inestable en aceptada. Conservar las suites actuales de Vitest y PHPUnit.

## Fase 3. Rendimiento con concurrencia e integridad

Estado: instrumentación, generador y carga diferida implementados. Se realizaron ensayos locales preliminares; la acreditación nominal permanece pendiente de un servidor representativo y de la concurrencia acordada. Los scripts propuestos se consolidaron en `escenarios.js`, seleccionando cada recorrido mediante `CARGA_ESCENARIO`.

### Tarea 3.1. Definir el entorno y la muestra

Archivos propuestos: `docs/RENDIMIENTO.md`, `backend/pruebas-rendimiento/` y un generador de datos sintéticos protegido por entorno y base permitidos.

1. Utilizar `bd_clinica_undac_rendimiento`, usuario MySQL y almacenamiento separados. No compartirla con las pruebas de navegador ni PHPUnit.
2. Medir en un servidor comparable al despliegue previsto: Apache/PHP o Nginx/PHP-FPM según lo acordado. `php artisan serve` sirve para humo local; no usar sus resultados como capacidad de producción.
3. Registrar CPU, RAM, disco, sistema operativo, versiones, configuración de PHP/MySQL, índices, modo de compilación y red. Ejecutar el generador de carga en otro equipo cuando sea posible.
4. Proponer inicialmente 1.000 pacientes e historias, distribuidos entre operadores y estados válidos; incluir expedientes de tamaños habituales y grandes. Esta muestra y la concurrencia requieren validación con la facultad antes de declarar capacidad clínica.
5. Mantener la hipótesis de referencia del plan existente: 40 alumnos, 8 docentes, 30 historias abiertas y autoguardado cada 30 segundos. Esos perfiles no se suman automáticamente como usuarios adicionales en cada escenario: documentar la distribución efectiva del escenario mixto.

### Tarea 3.2. Implementar escenarios k6

Archivos propuestos: `sesion.js`, `listadoHistorias.js`, `lecturaExpediente.js`, `autoguardado.js`, `escenarioMixto.js` y `verificarIntegridad.js`.

1. Hacer humo con 1 usuario, calentamiento y escalado controlado hasta la carga nominal. Ejecutar escenarios separados antes del mixto; medir al menos 5 minutos estables y ampliar la observación del autoguardado para acumular suficientes muestras.
2. Iniciar sesión por usuario virtual mediante CSRF y cookies reales. No compartir una única cookie entre usuarios. Contabilizar errores de login y 419; no excluirlos silenciosamente.
3. Asignar a cada usuario sus propias historias. No usar la misma historia para todos los escritores, porque produciría contención artificial y sobrescrituras ajenas al escenario nominal.
4. Medir por operación mediante etiquetas; no aceptar solo un percentil global que oculte un endpoint lento. Informar tamaño de muestra, peticiones por segundo, p50, p95, p99 y porcentaje de errores.
5. Medir consumo de PHP y MySQL, conexiones activas, bloqueos y consultas lentas. Separar el tiempo de espera intencional de los tiempos HTTP.
6. En cada escritura usar un marcador único de ejecución/usuario/iteración. Leer después el expediente y comprobarlo. Al finalizar, contrastar historias, propietarios, marcadores y valores persistidos contra el manifiesto esperado.
7. Probar aparte dos sesiones editando la misma historia. Inspeccionar primero el mecanismo de concurrencia existente; si no detecta conflictos, registrar el defecto y resolver el contrato antes de afirmar que no se pierden cambios. Una respuesta 200 no prueba integridad.
8. Mantener las limitaciones de acceso y de frecuencia durante la carga nominal. Contabilizar los 429; solo ajustar límites con una decisión documentada que también sea válida para despliegue.

Metas iniciales tomadas de `docs/PLAN_PRUEBAS.md`:

| Operación | Carga de referencia | Meta |
| --- | --- | --- |
| Listado de historias | 40 usuarios virtuales | p95 < 800 ms |
| Lectura de expediente | 30 usuarios virtuales | p95 < 1.200 ms |
| Autoguardado | 30 escritores, intervalo de 30 s | p95 < 700 ms |
| Escenario nominal | Distribución acordada | Errores inesperados < 1 %, cero 5xx, cero pérdidas o cruces de datos |
| MySQL | Durante carga estable | CPU sostenida < 70 % como referencia del plan existente |

Definir umbrales automáticos que produzcan una salida fallida cuando se incumplen. Si la hipótesis de carga cambia, aprobar y registrar la nueva meta antes de ejecutar; no flexibilizarla después para hacer pasar un resultado.

### Tarea 3.3. Dividir el frontend por vistas

Archivos a revisar: `frontend/src/aplicacion/Aplicacion.jsx`, `frontend/src/aplicacion/configuracion/seccionesHistoriaClinica.js` y los módulos que concentren peso según la compilación.

1. Guardar medición inicial de tamaño transferido, JavaScript inicial y tiempos de apertura de acceso, tablero e historia, usando compilación de producción y condiciones repetibles.
2. Cambiar las importaciones de vistas a carga diferida con `React.lazy` y `Suspense`, manteniendo el enrutamiento por fragmento y la verificación de permisos.
3. Mantener el estado clínico y el autoguardado fuera de límites de montaje que puedan reiniciarlos. Cargar secciones clínicas por separado únicamente si la medición justifica ese segundo paso.
4. Ofrecer un estado de carga accesible y un error en español recuperable si falla la descarga de un fragmento.
5. Validar entrada directa a historia, recarga, navegación entre vistas, cambio de sesión e impresión. No aumentar el límite de advertencia de Vite para ocultar el tamaño.
6. Comparar antes/después. Proponer una reducción mínima del 30 % del JavaScript inicial comprimido, ajustándola únicamente con evidencia de la medición inicial. Mantener la meta existente de apertura clínica inferior a 4 segundos bajo un perfil documentado.

Cierre de fase: informe reproducible con umbrales cumplidos en la carga acordada, comprobaciones de integridad aprobadas y evidencia de menor carga inicial. Los ensayos locales son preliminares hasta medir el entorno representativo.

## Fase 4. Normalización visual gradual

Estado: estilos migrados a tokens, capas centralizadas y temas implementados. Se añadieron comprobación estática, referencias de modal por navegador y pruebas de contraste, foco, panel móvil e impresión. Las excepciones clínicas/raster se documentan en el inventario.

### Tarea 4.1. Inventariar y clasificar

Crear `docs/INVENTARIO_TOKENS_VISUALES.md` con archivo, selector, valor, función visual, token propuesto, contexto de apilamiento y validación pendiente.

1. Buscar hexadecimales, `rgb`, `rgba`, `hsl`, colores nombrados, estilos en JSX y `z-index` numéricos. Separar definiciones de paleta de usos directos.
2. Revisar `claude-shell.css`, `historia-clinica.css`, `panel.css`, `modulos.css` y las demás hojas importadas por `app.css`.
3. Inspeccionar `position`, `transform`, `opacity`, `isolation`, contenedores con recorte y portales. Asignar capas según dónde se renderiza cada elemento, no únicamente por el número actual.
4. Distinguir colores de interfaz de los colores clínicos del odontograma. Los colores clínicos y de impresión tienen significado propio; centralizarlos con tokens específicos y conservar su significado en ambos temas.

### Tarea 4.2. Aplicar por lotes revisables

| Lote | Alcance | Comprobación principal |
| --- | --- | --- |
| 1 | Modales, visor de archivos, fondos y menús superpuestos | Modal encima del encabezado; foco contenido y devolución al cerrar |
| 2 | Navegación clínica, cabecera fija y panel móvil | Panel y fondo en orden correcto; Escape y teclado; contenido de fondo no operable |
| 3 | Formularios, tablas y tarjetas | Texto, bordes, campos deshabilitados, errores y foco legibles en ambos temas |
| 4 | Odontograma e impresión | Colores clínicos intactos, selección distinguible y salida impresa sin regresiones |

Usar los alias semánticos existentes. Agregar un token solo si expresa una necesidad distinta; definir su comportamiento claro/oscuro. Mantener los números de las capas únicamente en `variables.css`; documentar cualquier nueva función de capa sin introducir números en componentes.

### Tarea 4.3. Verificar aspecto y accesibilidad

1. Usar capturas de referencia con datos y fechas estables en 1280×800, 768×1024 y 390×844, con tema claro y oscuro. Confirmar el mecanismo de tema que usa la aplicación antes de automatizarlo.
2. Comprobar manualmente recortes, desplazamiento, apertura simultánea de menú/modal y cabeceras fijas; añadir casos de navegador donde la regresión sea relevante.
3. Verificar teclado, foco visible, etiquetas, `aria-expanded`, `aria-controls` y regiones. Medir contraste: objetivo de 4,5:1 para texto normal y 3:1 para texto grande y límites/estados necesarios de controles.
4. Revisar la impresión en su modo específico; no aplicar automáticamente el tema oscuro al documento impreso.
5. Añadir una comprobación estática que rechace nuevas capas numéricas y nuevos usos de colores literales en interfaz fuera de tokens. Registrar la deuda previa para reducirla por lotes sin bloquear trabajo ajeno.

Cierre de fase: lotes revisados en los seis pares de tamaño/tema, escala centralizada, contraste verificado y ausencia de cambios en datos o simbología clínica.

## Entregas y controles finales

| Entrega | Contenido | Condición para continuar |
| --- | --- | --- |
| 1 | Entornos exclusivos de navegador y rendimiento implementados | Configuración documentada, datos repetibles y usuarios MySQL limitados |
| 2 | Playwright y cinco recorridos | Cookies/CSRF reales, aislamiento entre actores y tres pasadas estables |
| 3 | Generador, escenarios y medición inicial | Carga y muestra registradas; integridad verificable |
| 4 | Carga diferida y optimizaciones justificadas | Mejora medida y recorridos sin regresiones |
| 5 | Cuatro lotes visuales | Evidencia de ambos temas, tamaños y accesibilidad |
| 6 | Documentación e integración continua | Instalación reproducible, informes y criterios de salida actualizados |

En cada entrega ejecutar las pruebas afectadas y `npm run build`; ejecutar regresión clínica al tocar navegación, impresión o guardado. Conservar `composer test` y `vendor/bin/pint --test` como comprobaciones del backend, distinguiendo los problemas de estilo previos de los introducidos.

Crear posteriormente un flujo de integración continua con MySQL aislado: preparación del esquema, arranque de servicios, Vitest/PHPUnit y Chromium. Ejecutar Firefox en una campaña ampliada y rendimiento en un entorno dedicado, no en un ejecutor compartido del que se pretenda deducir capacidad clínica. Publicar informes por ejecución, sin datos reales ni credenciales.

Actualizar `README.md`, `docs/PLAN_PRUEBAS.md` y las guías de cada fase con comandos efectivamente implementados, variables, resultados y limitaciones. La aceptación de estos controles técnicos no sustituye la aceptación clínica institucional descrita en el plan existente.

## Decisiones pendientes antes de acreditar resultados

- Facultad: confirmar usuarios concurrentes, volumen de historias y tiempos aceptables.
- Responsable de infraestructura: definir servidor de referencia y observabilidad disponible.
- Equipo: decidir tratamiento de conflictos entre pestañas si la inspección detecta ausencia de protección.
- Responsable clínico: revisar que los cambios de tokens conserven los colores normativos y la impresión.

Estas decisiones no impiden integrar la suite de navegador con el entorno aislado existente. Las fases técnicas están implementadas. El siguiente paso de aceptación es medir la carga nominal en infraestructura representativa y ejecutar el flujo versionado en GitHub.

## Referencias técnicas

- [Playwright: aislamiento de contextos](https://playwright.dev/docs/browser-contexts): base para separar cookies y almacenamiento de cada actor.
- [Playwright: autenticación](https://playwright.dev/docs/auth): tratamiento de estados autenticados y exclusión de archivos con cookies del repositorio.
- [Grafana k6: cookies](https://grafana.com/docs/k6/latest/using-k6/cookies/): sesiones reales por usuario virtual.
- [Grafana k6: umbrales](https://grafana.com/docs/k6/latest/using-k6/thresholds/): percentiles y errores como criterios automáticos de aprobación.
