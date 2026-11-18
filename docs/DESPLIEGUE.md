# Preparación del despliegue

La configuración de producción se entrega como plantilla por decisión del usuario. No hay servidor ni dominio configurados y no se ejecutó un despliegue externo. La carga se mide en bases locales aisladas.

## Plataforma y configuración

Referencia comprobada: PHP 8.5.8, Node 24 y MySQL 8.4.3. El lock exige PHP >= 8.4.1. Revisar también PHP-FPM/Apache, no solamente `php -v`. Instalar PDO MySQL, mbstring, fileinfo y GD; SQLite se usa en pruebas. Construir con `composer install --no-dev --prefer-dist --optimize-autoloader` y `npm ci && npm run build` desde sus directorios correspondientes. No utilizar los servidores de Vite o Artisan para producción.

Usar `despliegue/produccion.env.example` y `despliegue/nginx.conf.example` como punto de partida. Completar dominio, certificados, rutas y credenciales privadas. La API y el frontend comparten origen. Solo `backend/public/index.php` atiende `/api`; el resto del backend, `.env`, dumps, informes y almacenamiento privado nunca son raíces públicas. No ejecutar `storage:link` para los adjuntos clínicos. Se descargan por rutas autenticadas y autorizadas del servidor.

La plantilla utiliza sesión/caché en archivos para una instancia y cola síncrona. Varias instancias requieren almacenamiento compartido de sesiones y limitadores, probado antes del piloto. No seleccionar el driver `database` sin instalar sus tablas. Mantener los secretos fuera del repositorio y generar una clave propia una sola vez con `php artisan key:generate`; conservarla entre versiones y en un respaldo privado. No registrar cuerpos clínicos o contraseñas en logs.

Solo el proceso PHP puede escribir en `storage` y `bootstrap/cache`. La cuenta MySQL de ejecución debe limitarse a la base operativa y sus consultas necesarias. Usar una cuenta de instalación distinta para DDL/vistas/triggers. Si TLS termina en un proxy, configurar exclusivamente sus direcciones de confianza y comprobar el reconocimiento de HTTPS; no confiar indiscriminadamente en cabeceras remitidas desde Internet.

En PHP-FPM, ajustar `upload_max_filesize=10M`, `post_max_size=12M`, `memory_limit=256M`, `max_execution_time=60` y OPcache como valores iniciales; contrastarlos con la configuración de archivos de la clínica. Validar Nginx y PHP-FPM antes de reiniciar servicios. Las plantillas no fijan una capacidad de usuarios ni sustituyen el ensayo en el servidor elegido.

## Actualización de una instalación existente

1. Fijar commit, locks, configuración y esquema de partida. Probar primero sobre una copia autorizada en preproducción; el SQL de referencia recibido es sensible y no es un actualizador.
2. Suspender aperturas y escrituras: mantenimiento del backend y página de mantenimiento del servidor web. Respaldar MySQL y todos los archivos privados en el mismo punto de consistencia. La aplicación no elimina ni renumera historias anteriores.
3. Instalar dependencias desde lock y publicar frontend compilado. Ejecutar `php artisan clinica:parches` con la conexión operativa verificada. Un error de duplicados o de definición incompatible detiene el proceso y requiere revisión; no registrar manualmente el parche ni eliminar restricciones para continuar.
4. El parche `2026-11-08-correlativo-historias.sql` crea el contador anual e inicializa el máximo sufijo numérico, incluidas historias inactivas. Mantener aperturas suspendidas hasta activar la nueva versión. Ejecutar `php artisan clinica:verificar --produccion`. Los códigos fuera del patrón requieren revisión, sin renumeración automática.
5. Ejecutar `php artisan config:cache` y `php artisan route:cache`, reiniciar el servicio PHP según el servidor y verificar `/up`, autenticación, cookies Secure/HttpOnly/SameSite, CSRF, listado, expediente, guardado/recarga, adjuntos y acceso por asignación. `/up` solo comprueba vida del proceso; no sustituye el diagnóstico y los recorridos.
6. Habilitar el piloto únicamente con el diagnóstico y los recorridos aprobados. Revisar error HTTP, fallos de guardado, integridad, accesos rechazados y consumo de recursos. Nombrar responsable y canal de incidencias antes de abrirlo.

El checkout local de trabajo también necesita aplicar el nuevo parche antes de usar el nuevo código. La implementación y las pruebas no actualizan automáticamente `bd_clinica_undac`.

## Respaldo y restauración

Respaldar con `mysqldump --single-transaction --routines --triggers --no-tablespaces` y credenciales suministradas por un archivo privado o gestor de secretos. Guardar fuera de la raíz pública y del repositorio. Respaldar simultáneamente `storage/app/private` y el almacenamiento clínico que esté configurado. Cifrar los respaldos, limitar su acceso y verificar su recuperación; definir retención, frecuencia y tiempos de recuperación con el responsable operativo.

Restaurar primero a una base vacía en un servidor autorizado, sin apuntar a la base activa. Ajustar definidores y permisos para ese servidor, conservar `SQL SECURITY INVOKER`, comprobar restricciones, ocho triggers, tres vistas, conteos, vínculos y hashes de archivos. Aplicar parches y ejecutar el diagnóstico antes de probar recorridos. Un dump SQL por sí solo no restaura adjuntos.

Ensayo sintético reproducible desde `backend`:

```powershell
php artisan pruebas:restauracion --cliente=C:/laragon/bin/mysql/mysql-8.4.3-winx64/bin/mysql.exe --volcador=C:/laragon/bin/mysql/mysql-8.4.3-winx64/bin/mysqldump.exe
```

Utiliza exclusivamente `bd_clinica_undac_rendimiento` como origen saneado y recrea `bd_clinica_undac_restauracion`. Requiere una cuenta de instalación local con esos permisos. Ejecutarlo sin carga ni preparación concurrentes. El respaldo y un adjunto sintético quedan en almacenamiento privado; el JSON de resultados solo contiene conteos y hashes. El ensayo local no acredita una recuperación del futuro servidor ni de sus adjuntos reales.

## Borradores heredados del navegador

La versión nueva no lee ni escribe expedientes, pacientes o historias clínicas en `localStorage` en producción. Los cambios pendientes quedan en memoria, con aviso de guardado fallido y reintento; cerrar o recargar puede perderlos. Una historia no se confirma como creada hasta recibir respuesta satisfactoria del servidor. Un conflicto entre sesiones exige conciliar los cambios en pantalla con la revisión del servidor.

La salida interna se protege con un diálogo para permanecer, guardar o descartar explícitamente los cambios pendientes. La recarga y el cierre de pestaña usan la confirmación nativa del navegador. Si falla cerrar sesión, la interfaz permanece sin autenticar y bloquea su recuperación automática hasta confirmar la salida o completar una autenticación explícita; un indicador sin información clínica conserva esa intención durante la recarga.

Las claves antiguas no se borran automáticamente: algunos borradores podrían no haberse sincronizado y no identifican de forma confiable a su propietario. Antes de liberar un equipo compartido, un responsable autorizado debe inventariar las claves `undac:hc:workspace:v3:*`, `undac:pacientes:frontend:v2` (y la versión `v1` si existe) y `undac:historias:frontend:v1`, recuperar en un archivo privado solo los datos pendientes que se puedan atribuir y conciliarlos con el servidor. No cargar automáticamente esos datos en la cuenta que abra el navegador ni sobrescribir con ellos la base. Después de documentar la recuperación, borrar selectivamente esas claves y verificar que la cuenta siguiente no acceda a ellas. Conservar preferencias como `undac:tema`; no usar `localStorage.clear()`. Hasta completar esa revisión, restringir el acceso físico a los perfiles de navegador antiguos.

## Reversión y piloto

Detener escrituras ante pérdida de datos, exposición entre cuentas, guardado confirmado que no persista o errores de autorización. Conservar evidencias privadas. Si no hubo actividad después del despliegue, restaurar el conjunto consistente de base/archivos y la versión anterior ensayada. Si hubo actividad, no restaurar indiscriminadamente un respaldo antiguo: conservar el contador y usar código compatible o una corrección hacia adelante. Conciliar primero cualquier dato que una restauración pudiera perder.

El piloto necesita servidor/dominio, responsables funcionales y de soporte, concurrencia esperada, respaldo restaurable y aceptación de los recorridos. Esos datos quedan pendientes por decisión de entregar la producción como plantilla; no se considera publicado ni certificado el sistema por aprobar pruebas locales.
