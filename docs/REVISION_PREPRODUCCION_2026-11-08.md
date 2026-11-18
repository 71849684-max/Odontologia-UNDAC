# Revisión para orientar el paso a producción — 8 de noviembre de 2026

## Resultado

No recomiendo publicar todavía. La interfaz compila y sus pruebas pasan, pero hay bloqueos de integridad, dependencias y verificación. Esta revisión no modifica la lógica de la aplicación, no actualiza dependencias y no ejecuta escrituras de pruebas en la base clínica.

Se revisó el checkout con base en el commit `87b731ea` y los cambios locales del correo de apertura. No se inspeccionó un servidor de producción ni se certificó su configuración.

## Hallazgos prioritarios

### P1 — Numeración de historias: colisión al llegar a 1000 y riesgo con altas simultáneas

Ubicación: `backend/app/Clinica/Historias/ServicioHistorias.php:118`.

El siguiente número se obtiene ordenando `numero_historia` como texto y sumando uno. En MySQL confirmé, mediante un SELECT de constantes sintéticas, que `HC-2026-999` queda antes que `HC-2026-1000` en orden descendente. Con esos registros, el código vuelve a calcular 1000 y encuentra la clave única. Además, dos transacciones pueden leer el mismo último número y calcular el mismo siguiente: la consulta no bloquea un contador común.

Evidencia: [resultado de la consulta sintética](evidencias/revision-produccion-2026-11-08/correlativo.json). El caso de concurrencia es un riesgo identificado por inspección, no una prueba de carga ejecutada en esta revisión.

Cierre: contador numérico anual con incremento serializado o identificador basado en una secuencia segura, manteniendo unicidad. Probar el paso 999→1000→1001 y varias aperturas concurrentes, sin errores ni historias duplicadas.

### P1 — Borradores clínicos locales sin separación por usuario y creación local ante fallos

Ubicaciones: `frontend/src/aplicacion/componentes/clinica/contexto/HistoriaClinicaContext.jsx:88`, `:122`, `:171`, `:206`; `frontend/src/aplicacion/autenticacion/ContextoSesion.jsx:81`; `frontend/src/aplicacion/formularios/nueva-historia/NuevaHistoriaModal.jsx:51` y `:123`.

La clave del borrador usa el identificador de historia, sin identificar la cuenta. Se cargan datos locales antes de confirmar la autorización, y cerrar sesión no elimina estos registros. Los rechazos 401/403/404 ya bloquean y eliminan el borrador de esa historia; errores de red o 500 no activan ese bloqueo. Si existe un borrador en un equipo compartido, puede permanecer visible/editable localmente cuando no se pueda confirmar el acceso del usuario actual.

La apertura de historia también pasa a almacenamiento local si la comprobación inicial de API falla, y conserva un recorrido que comunica creación sin persistencia central. Esto requiere una decisión explícita para uso clínico real.

No se confirmó una escritura no autorizada en MySQL: el problema observado en el código es exposición local y apariencia de cambios guardados sin confirmación del servidor.

Cierre: bloquear la visualización hasta autorizar, evitar altas clínicas locales en producción y definir una política de borradores por cuenta, caducidad y cierre de sesión. Probar cambio de usuario en el mismo navegador con API inaccesible y con respuestas 401, 403, 404 y 500.

### P1 — Dependencias PHP con avisos de seguridad

`composer audit --format=json` reportó 7 avisos en 4 paquetes: `symfony/http-foundation`, `symfony/http-kernel`, `symfony/mime` y `symfony/routing`. El lock fija componentes Symfony 8.1.9. El aviso de MIME identifica la corrección en 8.1.10; los avisos consultados de HTTP Foundation identifican 8.1.11.

Fuentes primarias consultadas: [HTTP Foundation, CVE-2026-118514](https://symfony.com/cve-2026-118514), [MIME, CVE-2026-45070](https://symfony.com/cve-2026-45070), [aviso oficial de rutas frente a PHP](https://github.com/symfony/symfony/security/advisories/GHSA-3h27-hjv7-fqjx).

Esto no demuestra que los siete avisos sean explotables en esta aplicación Laravel: algunos dependen de funciones de Symfony o de configuración de proxies que no se han confirmado aquí. Sí impide afirmar que las dependencias están libres de avisos conocidos.

Evidencia completa: [Composer audit](evidencias/revision-produccion-2026-11-08/composer-audit.json).

Cierre: actualizar de forma controlada las versiones afectadas, revisar los avisos aplicables y volver a ejecutar auditoría, backend y navegador con el nuevo lock.

### P1 — Plataforma de CI incompatible con el lock

Ubicaciones: `.github/workflows/verificar.yml:23`, `backend/composer.lock:3366`, `README.md:8`.

CI instala PHP 8.3, mientras componentes fijados en el lock, como `symfony/console` 8.1.9, requieren PHP >=8.4.1. La instalación desde ese lock no es compatible con el PHP del workflow. La revisión local usa PHP 8.5.8 y allí `composer check-platform-reqs --no-dev` pasa; esto no valida el workflow de PHP 8.3. El README también anuncia 8.3 como requisito suficiente.

Cierre: fijar una plataforma compatible y coherente en servidor, CI y documentación, o resolver deliberadamente un lock compatible con la plataforma objetivo. Nunca omitir los requisitos de Composer para hacer pasar el despliegue.

### P1 — La integración MySQL y los recorridos completos aún no están acreditados

La ejecución actual de backend descubrió 141 pruebas: 22 pasaron y 119 terminaron con errores por la ausencia de `bd_clinica_undac_test`. No equivale a 119 errores funcionales comprobados; son pruebas que no pudieron validar la aplicación.

Además hay pruebas desactualizadas respecto a la visibilidad por asignación. Por ejemplo, `backend/tests/Integration/EquipoClinicoTest.php:26` espera que un docente recién creado y no asignado pueda reasignar una historia del alumno. El recorrido `frontend/pruebas-navegador/revisionDocente.spec.js:13` inicia una sesión docente y trata de observar una historia nueva del alumno sin asignar antes a ese docente. Con la política actual debe recibir rechazo. Restablecer las bases no basta: también deben corregirse los datos de prueba, conservando las comprobaciones negativas de acceso.

Se descubren 36 casos de navegador en 9 archivos para los dos proyectos Chromium/Firefox. No se ejecutó de nuevo esa suite en esta revisión, pues la preparación y aceptación del entorno aislado siguen pendientes. Las evidencias antiguas no acreditan todas las modificaciones posteriores.

Cierre: preparar la base y triggers exclusivos, ajustar los casos a las asignaciones actuales, pasar toda la suite MySQL y repetir navegador, cookies y CSRF reales. Incluir revocación de acceso, regreso de un asistente el mismo día, cambio de rol y correo de paciente existente.

### P2 — El aplicador de parches puede ocultar un error de integridad

Ubicación: `backend/app/Clinica/Soporte/AplicadorParches.php:16` y `:41`.

El código 1062 se tolera para cualquier sentencia y el parche se marca como aplicado al terminar. Si un `ALTER TABLE ... ADD UNIQUE` falla porque ya existen datos duplicados, podría registrarse el parche sin que exista la restricción esperada. La tolerancia no distingue ese caso de una inserción repetida que sí fuera idempotente.

Cierre: tolerar únicamente operaciones y estados comprobados, verificar la condición posterior del parche y detener la actualización ante conflictos de datos. Ensayar los parches sobre una copia anonimizada y comprobar restauración antes del despliegue.

## Comprobaciones ejecutadas

| Comprobación | Resultado actual |
| --- | --- |
| Frontend | 262 pruebas, 33 archivos: pasan |
| Compilación | Pasa; el módulo clínico produce un chunk de aproximadamente 611,5 kB sin comprimir y 98,8 kB gzip |
| Tokens | Pasa; 7 literales ya inventariados y 0 capas numéricas fuera de la escala |
| Auditoría npm | 0 vulnerabilidades reportadas en esta ejecución; no es una garantía de ausencia de riesgos |
| Backend completo | 141 descubiertas; 22 pasan, 119 bloqueadas por base MySQL ausente |
| Plataforma local de producción | Requisitos Composer sin dependencias de desarrollo: pasan con PHP 8.5.8 |
| Auditoría Composer | 7 avisos en 4 paquetes |
| Estilo PHP global | Pint informa 15 archivos pendientes; no se reescribieron en esta revisión |
| Numeración | Reproducción de orden textual en MySQL con constantes, sin datos clínicos |
| Navegador | 36 casos descubiertos; ejecución completa actual pendiente |

## Ruta de salida a producción

1. Resolver numeración, tratamiento de borradores y dependencias; alinear PHP y CI. Cada corrección debe quedar acompañada de su prueba de regresión.
2. Restablecer un entorno aislado reproducible y pasar backend, navegador y auditorías. No ejecutar las pruebas contra `bd_clinica_undac`.
3. Ensayar sobre una copia anonimizada los parches SQL, cambios de rol, permisos, reasignaciones, eliminación lógica y restauración de una copia de seguridad. El SQL raíz contiene operaciones destructivas y no debe importarse sobre datos productivos.
4. Definir despliegue: frontend `dist` estático y backend con raíz en `backend/public`, preferiblemente con `/api` bajo el mismo origen. El proxy de Vite a 8001 es de desarrollo. Documentar HTTPS, cookies seguras/HttpOnly/SameSite, proxies de confianza, `APP_ENV=production`, `APP_DEBUG=false`, credenciales con privilegios mínimos y protección de archivos clínicos privados. Estos parámetros del servidor destino no han sido inspeccionados.
5. Medir concurrencia e integridad en infraestructura representativa con el plan de rendimiento existente; acordar usuarios esperados. La compilación y las mediciones locales no certifican capacidad productiva.
6. Preparar respaldo de base y archivos privados, procedimiento de restauración, monitoreo de errores y plan de reversión. Hacer un piloto con cuentas y datos de prueba antes de abrir a toda la facultad.

## Alcance de los cambios de esta revisión

Únicamente se añadieron este informe y evidencias sanitizadas de dependencias y numeración. Los cambios de aplicación que ya estaban en el checkout se conservaron. No se hizo despliegue, migración, instalación de paquetes ni actualización automática de dependencias.
