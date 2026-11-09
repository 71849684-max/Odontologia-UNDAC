# Pruebas de navegador

La suite `frontend/pruebas-navegador/` usa Playwright sobre la compilación de producción, Laravel y MySQL reales. No sustituye respuestas exitosas de la API por mocks. Los casos de fallo de red interrumpen expresamente solicitudes del navegador para comprobar el bloqueo y el reintento; las comprobaciones de persistencia posteriores vuelven a utilizar el servidor real. En el caso de renovación de CSRF, un proxy de la prueba modifica las cabeceras de la primera escritura y reenvía la respuesta real de Laravel sin modificar su estado ni su cuerpo: esto permite verificar el 419 y el reintento real. Laravel 13 también verifica metadatos de origen; el caso fuerza la rama que valida el token. La suite de Laravel `tests/E2E` permanece como prueba del flujo de API y no se presenta como prueba de navegador.

## Preparación

Requiere la instalación local descrita en el README, una clave de aplicación válida y acceso inicial para crear una base exclusiva. Desde `frontend`:

```powershell
npx playwright install chromium firefox
npm run pruebas:navegador:preparar
npm run build
npm run pruebas:navegador
```

La preparación crea `.env.pruebas_navegador` a partir del entorno local únicamente si no existe. Configura `APP_ENV=pruebas_navegador`, `bd_clinica_undac_navegador`, cookie de sesión propia, caché y almacenamiento privados en `backend/storage/pruebas-navegador`. Si la conexión inicial utiliza root local, crea un usuario con permisos limitados a esa base y actualiza únicamente el archivo de entorno de pruebas. Los secretos y el manifiesto se excluyen de Git.

El comando rechaza otros pares entorno/base y DB_URL; extrae estructura, catálogos permitidos y configuración sintética, sin importar cuentas, pacientes, auditoría o notificaciones operativas. No elimina bases existentes. Si encuentra un esquema parcial o sin marcador de saneamiento, se detiene. Para sustituir una base antigua de pruebas, desde `backend` ejecutar explícitamente `php artisan pruebas:esquema bd_clinica_undac_navegador --recrear` y luego repetir la preparación. Importa disparadores respetando delimitadores, conserva vistas INVOKER y aplica los parches pendientes. La preparación reutiliza cuentas sintéticas, renueva contraseñas y escribe un manifiesto privado; no ejecutarla durante la suite.

Playwright inicia y detiene sus propios procesos: API `8011` y vista previa `5183`. Falla si los puertos ya están ocupados; no reutiliza la aplicación de desarrollo de `5173/8001`. No se cambia la conexión de `.env` ni la base `bd_clinica_undac_test` de PHPUnit. No se deshabilitan CSRF, autorización ni límites de acceso.

## Recorridos y comprobaciones

- Inicio de sesión por formulario, recuperación tras recarga y cierre comprobado con 401.
- Cookies reales, rechazo 419 sin token y con token inválido; renovación automática del token y una sola creación confirmada.
- Alta de paciente e historia, autoguardado, recarga y recuperación desde otro contexto del mismo alumno.
- Observación docente, corrección, reenvío y validación; rechazo 409 de la edición posterior del alumno.
- Alumno B obtiene 404 ante historia y expediente de A, sin datos ajenos en el listado.
- Grupo creado desde interfaz y consultado desde otro administrador en contexto independiente.
- Auditoría de aprobación y reapertura: profesional y administrador distintos, sección afectada y detalle legible, usando el servidor y sesiones reales.
- Revisión obsoleta rechazada con error de validación `revision`, sin sobrescribir el cambio confirmado.
- Falta de red inicial sin mostrar borradores heredados; alta fallida sin éxito local; recuperación de un cambio en memoria con «Reintentar guardado» y comprobación tras recarga.
- Cambio de usuario en el mismo navegador sin acceso al expediente de la sesión anterior.
- Salida fallida sin recuperación automática de cuenta al recargar; reintento al recuperar red y autenticación explícita de otra cuenta.
- Protección de cambios pendientes al salir: permanecer, guardar antes de salir, descarte confirmado, historial, recarga y edición inmediatamente anterior a la salida.
- Modal con teclado, Escape y devolución del foco; contraste en claro/oscuro y tres tamaños; panel móvil y vista de impresión; posiciones y selección neutra del odontograma.

Las llamadas directas de comprobación comparten las cookies del actor autenticado. Las escrituras auxiliares envían el token real. Las altas y las transiciones de los cinco recorridos principales se realizan desde la interfaz.

## Comandos adicionales

```powershell
npm run pruebas:navegador:firefox
npm run pruebas:navegador -- --repeat-each=3
npm run pruebas:navegador:interfaz
npm run pruebas:navegador:informe
```

Los reintentos están desactivados. La repetición de cada caso tres veces acredita estabilidad de los casos; no oculta fallos mediante reintentos. Un trabajador evita interferencias entre cuentas y preparación. No aumentar trabajadores sin separar datos y cuentas.

Los informes y las capturas quedan en `frontend/informes-navegador` y `frontend/resultados-navegador`. Contienen datos sintéticos, pero las trazas pueden incluir cookies: no versionarlos ni publicarlos fuera del equipo autorizado. El flujo de integración continua conserva los artefactos durante siete días.

Para un entorno ya servido, configurar `PRUEBAS_URL` y `PRUEBAS_MANIFIESTO` con sus valores reales; no iniciar procesos adicionales. Esta opción exige comprobar previamente que el servidor usa la misma base exclusiva del manifiesto. Nunca usarla con la URL de trabajo ni con pacientes reales. `PRUEBAS_API_URL` permite ajustar el destino del proxy de la configuración Vite de pruebas.

## Concurrencia del expediente

La lectura devuelve `revision`, una huella de los datos del formulario y estados de sección. Los adjuntos y el odontograma se gestionan por endpoints independientes: no invalidan esa huella, y el autoguardado del frontend no reenvía la copia del odontograma recibida al abrir la ficha. La escritura con revisión bloquea la fila de historia, compara la huella y rechaza revisiones obsoletas antes de modificar datos. El frontend serializa sus propias escrituras, conserva borradores y detiene el autoguardado tras detectar un conflicto hasta que se recargue la historia. El campo es opcional para conservar compatibilidad con clientes anteriores; estos clientes no obtienen protección frente a sobrescrituras hasta enviar la revisión. No confundir una transacción de base con protección de un cliente antiguo.
