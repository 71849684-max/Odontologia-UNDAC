# Plan de cierre de pendientes y preparación para producción

Fecha de planificación: 8 de noviembre de 2026, America/Lima.

Actualización de implementación, 9 de noviembre: correcciones, esquema saneado, regresiones, plantillas y ensayos locales ejecutados. Por decisión del usuario, producción permanece como plantilla. Consultar [resultados y límites del cierre](../../CIERRE_PREPRODUCCION_2026-11-09.md); no se consideran completados el CI remoto ni el piloto externo.

## Objetivo y alcance

Resolver los bloqueos de la revisión de preproducción y obtener evidencias suficientes para un piloto. Este documento es un plan: no autoriza ni ejecuta importaciones sobre la base de trabajo, actualizaciones de dependencias, cambios de servidor ni despliegues.

Se mantienen las decisiones funcionales vigentes: roles en español; administrador con acceso general; profesionales y asistentes con acceso por asignación; aprobación y reapertura según las reglas existentes; eliminación clínica lógica. No se amplía el buscador para asignar profesionales como asistentes.

Referencia: [revisión de preproducción](../../REVISION_PREPRODUCCION_2026-11-08.md).

## Base de datos de referencia recibida

Archivo: `bd_clinica_undac.sql`.

| Dato comprobado | Resultado |
| --- | --- |
| Formato | Exportación de phpMyAdmin 5.2.3 |
| Motor indicado | MySQL 8.4.3 |
| Tamaño | 311.902 bytes |
| SHA-256 | `70cf7588e7b9525a501d188c865d99116a6640957122af3b7c31a618f08150bd` |
| Estructura | 81 tablas y 3 estructuras provisionales que luego se convierten en vistas |
| Triggers | 8, con instrucciones `DELIMITER` |
| Datos | 42 tablas con sentencias `INSERT` |
| Vistas | `vista_accesos_rol`, `vista_historia_resumen`, `vista_usuarios_sistema` |
| Destino | No incluye `CREATE DATABASE` ni `USE`; se selecciona externamente al importar |
| Definidores | Las vistas incluyen `DEFINER=root@localhost` y `SQL SECURITY INVOKER` |

El archivo incluye cuentas, pacientes, historias, auditoría y notificaciones. Tratarlo como información sensible; no utilizarlo directamente como dataset de CI ni publicar su contenido en informes o capturas. Los `DROP TABLE IF EXISTS` identificados corresponden a las estructuras provisionales de vistas. Aunque no elimina la base completa, sus `CREATE`, `ALTER` e `INSERT` no son un procedimiento para actualizar una base existente.

Conserva `uq_historia_numero` y las claves únicas de asignación por historia/persona/fecha. Estas restricciones se mantienen: no se eliminan para ocultar errores de aplicación.

**Cambio respecto al formato anterior:** `frontend/scripts/esquemaPhpunit.mjs` intenta sustituir instrucciones de base sin comillas invertidas, y rechaza cualquier referencia restante a `bd_clinica_undac`, incluso el comentario del dump. El archivo actual no tiene aquellas instrucciones y sí contiene el comentario. Es necesario adaptar el generador antes de preparar PHPUnit. `PrepararPruebas.php` también debe dejar de importar los datos operativos del dump.

Si el SQL se vuelve a exportar durante la implementación, recalcular el hash y revisar diferencias antes de reutilizar esta línea base.

## Orden de ejecución

| Fase | Prioridad | Depende de | Resultado exigido |
| --- | --- | --- | --- |
| 0. Proteger y comparar la línea base | P1 | — | Inventario y restauración de ensayo definidos |
| 1. Alinear PHP y dependencias | P1 | 0 | Instalación reproducible y avisos resueltos |
| 2. Esquema de pruebas y parches seguros | P1 | 0, 1 | Bases aisladas reproducibles y actualizador verificable |
| 3. Correlativo seguro | P1 | 2 | Aperturas sin duplicados, incluso después de 999 |
| 4. Persistencia clínica y privacidad local | P1 | 2 | Sin exposición entre usuarios ni altas solo locales |
| 5. Regresión completa e integración continua | P1 | 1–4 | Todas las comprobaciones obligatorias pasan |
| 6. Preproducción y rendimiento | P2 | 5 | Restauración, carga y despliegue ensayados |
| 7. Piloto y salida controlada | P2 | 6 | Criterios operativos aceptados y reversión preparada |

No iniciar el piloto con fases P1 abiertas. Las duraciones se estimarán después de cerrar la preparación de MySQL; no se toma como referencia el número de pruebas actualmente bloqueadas para estimar defectos funcionales.

## Fase 0 — Proteger la línea base

1. Conservar una copia privada del dump recibido y una referencia del código que se probará. No sobrescribir el archivo aportado para convertirlo en esquema de CI.
2. Inventariar tablas, vistas, columnas, claves únicas, claves foráneas, triggers, autoincrementos y versiones de parches. Comparar con `database/parches`, sin asumir que una fila de `parche_aplicado` demuestra la presencia de la estructura.
3. Separar los respaldos operativos con datos de los artefactos que se pueden versionar. Preparar una versión de estructura y catálogos sin cuentas ni registros clínicos; revisar también auditoría y notificaciones, que pueden contener información del paciente.
4. Incluir los archivos clínicos privados en el procedimiento de respaldo. Un dump de MySQL no respalda los adjuntos físicos.
5. Identificar el servidor de ensayo, el responsable de restauración y las cuentas de instalación/ejecución. No reutilizar credenciales operativas en las pruebas ni reproducirlas en documentos.

**Cierre:** inventario, hash, diferencias de esquema y procedimiento de restauración disponibles; no se han cambiado los registros existentes.

## Fase 1 — PHP, dependencias y configuración de CI

Archivos: `backend/composer.json`, `backend/composer.lock`, `.github/workflows/verificar.yml`, `README.md` y configuración del servidor de ensayo.

1. Fijar una versión de PHP compatible con todas las dependencias. El lock revisado requiere al menos 8.4.1 en varios componentes, aunque el proyecto y el workflow anuncian 8.3. La referencia local probada es PHP 8.5.8.
2. Comprobar PHP de consola y PHP que atiende HTTP por separado. La versión de PHP indicada por phpMyAdmin no confirma la versión del backend Laravel.
3. Actualizar de forma controlada los componentes afectados por los avisos de Composer, con sus dependencias compatibles. Volver a consultar los avisos al implementar; no fijar versiones únicamente por las cifras de la revisión anterior.
4. Alinear CI y documentación con la plataforma elegida. Comprobar PDO MySQL, mbstring, fileinfo y las extensiones usadas por archivos e imágenes. Incluir SQLite para las pruebas en memoria.
5. Ejecutar instalación desde lock en un entorno limpio, sin omitir requisitos de plataforma. Incorporar las auditorías de dependencias como controles de CI.

**Pruebas:** instalación limpia, `composer check-platform-reqs --no-dev`, `composer audit`, `npm audit`, arranque de la API y autenticación con cookies/CSRF reales.

**Cierre:** una misma plataforma documentada y probada; avisos de seguridad resueltos o con evaluación explícita de aplicabilidad y tratamiento, sin excepciones silenciosas al pipeline.

## Fase 2 — MySQL de pruebas y aplicación segura de parches

Archivos principales: `frontend/scripts/esquemaPhpunit.mjs`, `frontend/scripts/prepararEntorno.mjs`, `backend/app/Console/Commands/PrepararPruebas.php`, `backend/app/Clinica/Soporte/AplicadorParches.php`, `backend/routes/console.php` y workflow.

1. Generar un esquema de pruebas a partir del dump actual, sin copiar sus registros operativos. Conservar estructura, restricciones, triggers, vistas y solo los catálogos indispensables mediante una lista explícita de tablas permitidas. Crear cuentas y pacientes sintéticos con los preparadores existentes.
2. Interpretar correctamente delimitadores y el orden de creación de tablas, índices, autoincrementos, triggers y vistas. No separar sentencias únicamente por cada punto y coma ni eliminar indiscriminadamente todas las sentencias `INSERT`, porque también se necesitan catálogos.
3. Seleccionar el destino de importación de manera explícita. Rechazar bases distintas de `bd_clinica_undac_test`, `bd_clinica_undac_navegador` y `bd_clinica_undac_rendimiento` en las herramientas de pruebas, incluidas variantes de `DB_URL` o configuración cacheada que pudieran cambiar el destino.
4. Normalizar los definidores de vistas para el entorno de ensayo, manteniendo `SQL SECURITY INVOKER`. No exigir que exista `root@localhost` ni otorgar privilegios globales al usuario de la aplicación.
5. Resolver con la administración de MySQL los permisos de instalación de vistas/triggers y la configuración de binlog que intervino en el error 1419 anterior. Separar esa cuenta de instalación de las cuentas de uso diario de las bases de pruebas.
6. Endurecer el aplicador de parches: no tolerar el error 1062 de forma general; comprobar qué objeto ya existe y si coincide con la definición requerida. Si falla la creación de una restricción, detener el proceso y no registrar el parche como aplicado.
7. Definir una línea base verificada para instalaciones que ya tengan columnas o índices de los parches antiguos. Repetir la preparación debe ser idempotente y una base parcial debe detectarse antes de continuar.

**Pruebas:** importación en una base vacía; repetición sin duplicados; rechazo de destino de trabajo; fallo deliberado al añadir una clave única sobre duplicados sintéticos; verificación de vistas, triggers y claves foráneas; ejecución con el usuario limitado previsto.

**Cierre:** las tres bases se preparan de forma reproducible y sin datos operativos; no se modifica `bd_clinica_undac`; un parche incompleto no se marca como aplicado.

## Fase 3 — Correlativo anual seguro

Archivos: `backend/app/Clinica/Historias/ServicioHistorias.php`, nuevo parche incremental del contador y pruebas de concurrencia.

1. Incorporar una tabla de correlativos con año como clave primaria y último número emitido como entero. Mantener `numero_historia` y sus códigos actuales.
2. Inicializar cada año con el máximo sufijo **numérico** de las historias existentes del año, incluidas las inactivas. Detectar códigos fuera del patrón esperado y revisarlos; no renumerar historias ni reutilizar huecos.
3. Incrementar el contador con bloqueo de fila dentro de la misma transacción que crea la historia. Asegurar también el alta concurrente de la primera fila de un año.
4. Sustituir la consulta que ordena el código como texto. Conservar `uq_historia_numero` como defensa final y tratar conflictos inesperados con un error legible y recuperación acotada, sin bucles ilimitados.
5. Ejecutar la inicialización con escrituras de apertura suspendidas durante el paso de despliegue correspondiente, para evitar carreras con la versión antigua.

**Pruebas:** 998→999→1000→1001; inicio de un año sin contador; códigos con huecos e historias inactivas; al menos 20 aperturas simultáneas con conexiones separadas; reversión de una creación fallida.

**Cierre:** ninguna historia se duplica ni pierde; no hay errores SQL expuestos; cada alta confirmada tiene un código único. No se exige ausencia de huecos para considerar válido el correlativo.

## Fase 4 — Persistencia clínica confirmada y privacidad entre sesiones

Archivos: contexto de historia, modal de apertura, servicios de registro local, `ContextoSesion.jsx`, listados y pruebas de acceso revocado.

1. En producción, exigir respuesta exitosa del servidor para crear pacientes e historias. Eliminar el salto automático a altas locales cuando falla la comprobación de API; un fallo de red, sesión o servidor no debe presentarse como creación confirmada.
2. No mostrar una ficha clínica cacheada antes de confirmar autorización. Los errores iniciales de red o 500 deben mostrar un estado de carga fallida con reintento, sin habilitar datos del usuario anterior.
3. Usar memoria de la sesión para cambios todavía no enviados, con aviso visible y posibilidad de reintentar mientras la autorización siga siendo válida. No implantar sincronización offline automática como parte de este cierre.
4. Retirar en producción la persistencia clínica en `localStorage`. Antes de purgar borradores antiguos, distinguir registros locales nunca sincronizados y definir su recuperación por personal autorizado. No atribuir automáticamente a una cuenta un borrador antiguo que no identifica al propietario ni sobrescribir con él la base.
5. Al cerrar sesión, revocar acceso o cambiar de cuenta, vaciar memoria clínica y cancelar guardados pendientes. La limpieza de claves locales heredadas debe ser selectiva; conservar preferencias inocuas como el tema. Evitar `localStorage.clear()` general.
6. Conservar las verificaciones de acceso del servidor y el control de revisión del expediente. No sustituirlos por reglas de interfaz.

**Pruebas:** usuario A→cerrar sesión→usuario B en el mismo navegador; API sin conexión; respuestas 401, 403, 404 y 500; asignación retirada con historia abierta; mensajes antiguos de notificaciones; recarga después de guardar; ausencia de éxito falso y de escritura posterior a la revocación.

**Cierre:** un usuario no ve borradores ajenos; una creación solo se confirma después de persistir; los datos no guardados se identifican claramente y no se pierden por una limpieza silenciosa de registros heredados.

## Fase 5 — Regresión funcional, navegador e integración continua

1. Ajustar los datos de prueba de profesionales: una historia debe asignarse al profesional antes de que pueda observarla, validarla o reasignarla. Mantener casos negativos con profesionales y asistentes ajenos.
2. Cubrir los cambios recientes: asistente A→B→A en el mismo día; historial anterior/nuevo de asignaciones; notificaciones sin duplicados; revocación desde una notificación; cambio de rol; correo de paciente nuevo/existente; validaciones y lotes académicos atómicos.
3. Ejecutar toda la suite MySQL con el esquema y triggers actuales. Los 119 errores de la revisión anterior son bloqueos de entorno; clasificar los defectos funcionales reales solo después de preparar la base.
4. Repetir Chromium y Firefox usando API real, cookies y CSRF. Revisar modo claro, oscuro, móvil, modales, foco y vista de impresión. Actualizar referencias visuales solo después de revisar diferencias intencionales.
5. Corregir los 15 archivos señalados por Pint y ejecutar la verificación global. No desactivar controles para obtener un resultado verde.
6. Añadir al workflow instalación limpia, preparación aislada, pruebas PHP, auditorías, frontend, tokens, compilación y navegador. Cerrar esta fase con una ejecución completa de CI, no solo con el workflow escrito.

**Comandos de aceptación:**

```powershell
# backend, con la base de pruebas configurada
composer check-platform-reqs
composer audit
php artisan test
php vendor/bin/pint --test

# frontend
npm ci
npm audit
npm run test
npm run verificar:tokens
npm run build
npm run pruebas:navegador
npm run pruebas:navegador:firefox
```

**Cierre:** todas las pruebas aplicables pasan en CI; no hay omisiones que oculten reglas clínicas o de acceso; se conservan informes de la versión candidata sin datos operativos.

## Fase 6 — Ensayo de despliegue, restauración y carga

1. Preparar preproducción con las versiones objetivo de PHP y MySQL, frontend compilado, backend con raíz en `backend/public` y `/api` bajo el mismo origen cuando sea posible. No usar Vite ni `php artisan serve` como servidores de producción.
2. Revisar `APP_ENV=production`, `APP_DEBUG=false`, HTTPS, cookies seguras/HttpOnly/SameSite, claves propias del entorno, proxy de confianza, permisos de archivos, límites de subida y acceso privado a adjuntos clínicos.
3. Elegir almacenamiento de sesión y caché apropiado al despliegue. Si hay más de una instancia, los limitadores y sesiones deben usar almacenamiento compartido. No añadir tablas Laravel ausentes únicamente por usar valores por defecto: configurar el driver elegido y probarlo.
4. Ensayar restauración de base y archivos; después aplicar únicamente parches incrementales a la copia restaurada. Verificar cuentas, permisos, vínculos, claves únicas, triggers, vistas y conteos, sin mostrar información clínica en reportes.
5. Ejecutar el plan de rendimiento existente con datos sintéticos, concurrencia acordada con la facultad y PHP-FPM/Apache representativo. Medir p95, errores, CPU/memoria e integridad en listados, lectura y autoguardado.
6. Revisar el chunk clínico de aproximadamente 611,5 kB sin comprimir: medir apertura real antes de decidir una división adicional. No convertir la desaparición del aviso de compilación en una meta por sí sola.

**Cierre:** restauración completada y documentada; carga dentro de los umbrales acordados, sin pérdida ni mezcla de cambios; verificaciones de acceso y cookies correctas en el dominio de ensayo.

## Fase 7 — Piloto y reversión

1. Identificar versión de código, locks, esquema y configuración aprobados. Preparar respaldo verificado y un punto de retorno antes de abrir el piloto.
2. Habilitar un grupo pequeño de usuarios autorizados. Comprobar acceso por asignación, altas, correo, autoguardado, revisión/observaciones/validación, reapertura, archivos, auditoría y notificaciones.
3. Monitorear errores HTTP, fallos de guardado, duplicados, saturación de recursos y accesos rechazados. Definir quién recibe y atiende las incidencias.
4. Detener el piloto ante pérdida de datos, exposición entre cuentas, fallos de autorización o guardados confirmados que no persistan.
5. La reversión debe distinguir código y datos: si ya hubo actividad clínica, no restaurar indiscriminadamente una copia antigua ni eliminar el contador nuevo. Usar una versión compatible o una corrección hacia adelante; reconciliar datos antes de cualquier restauración que pueda perder actividad reciente.

**Cierre:** recorridos del piloto aceptados por los responsables funcionales y operativos, incidentes críticos resueltos y decisión explícita de ampliar el uso.

## Entregables y límites

Entregables: esquema seguro de pruebas, preparadores reproducibles, actualización de plataforma/locks, parches verificables, correlativo seguro, persistencia clínica confirmada, regresiones y CI completas, evidencia de carga/restauración y guía de despliegue/reversión.

Se necesita concretar durante la implementación: servidor y dominio objetivo, responsable de MySQL y respaldos, concurrencia esperada y tratamiento de los borradores locales heredados. Estas decisiones no impiden comenzar con el inventario, las pruebas aisladas y las correcciones de integridad.

No se crearán funciones académicas nuevas ni se ampliarán responsabilidades clínicas como parte del plan. El criterio es cerrar los riesgos identificados y acreditar la versión que se publicará.
