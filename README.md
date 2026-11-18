# Odontologia-UNDAC

- `backend/` — API y aplicación Laravel
- `frontend/` — interfaz React (Vite)

## Instalación local

Requisitos: PHP 8.4.1 o superior (referencia probada: 8.5.8) con PDO MySQL, PDO SQLite para pruebas, mbstring, fileinfo y GD, Composer, Node.js 24 y MySQL 8.4. El esquema se mantiene en SQL, no en migraciones Laravel. Consola y servidor HTTP deben utilizar la misma versión de PHP.

1. Crear una base de desarrollo vacía y seleccionar explícitamente el destino antes de importar `bd_clinica_undac.sql`. El dump actual no selecciona una base e incluye datos operativos sensibles; no importarlo sobre una instalación existente ni usarlo directamente en CI. Para las pruebas se extraen exclusivamente estructura y catálogos con los comandos indicados debajo.
2. Desde `backend`, ejecutar `composer setup`, revisar la conexión MySQL en `.env` y ejecutar `php artisan clinica:parches`.
3. Configurar `ADMIN_CONTRASENA` en `.env` y ejecutar `php artisan db:seed` para crear el primer administrador. No versionar credenciales.
4. Desde `frontend`, ejecutar `npm ci`.
5. En terminales separadas:

```powershell
# Desde backend
php artisan serve --host=127.0.0.1 --port=8001
```

```powershell
# Desde frontend
npm run dev
```

Abrir `http://127.0.0.1:5173/`. Vite dirige `/api` al backend de `8001`; el puerto MySQL se configura por separado en `DB_PORT`.

## Verificación

```powershell
# Desde frontend
npm run test
npm run verificar:tokens
npm run build
npm run medir:compilacion
```

Desde `backend`, preparar la base exclusiva antes de `composer test`:

```powershell
php artisan pruebas:esquema bd_clinica_undac_test --recrear
php artisan clinica:parches --bd=bd_clinica_undac_test
composer test
composer check-platform-reqs
composer audit
php vendor/bin/pint --test
```

`--recrear` borra únicamente la base de pruebas indicada. El instalador rechaza cualquier destino fuera de su lista. Las cuentas de instalación necesitan crear tablas/vistas/triggers; las cuentas de ejecución de navegador y carga quedan limitadas a su base. No cambiar el binlog global para preparar pruebas.

En cualquier instalación, aplicar `php artisan clinica:parches` antes de iniciar la nueva versión. El parche del contador exige suspender aperturas durante la actualización; no importar el dump completo. `php artisan clinica:verificar` comprueba la estructura sin escribir registros.

- [Pruebas reales de navegador](docs/PRUEBAS_NAVEGADOR.md): preparación exclusiva, Chromium, Firefox y estabilidad.
- [Rendimiento e integridad](docs/RENDIMIENTO.md): datos sintéticos, carga concurrente y métricas.
- [Diseño y tokens](docs/DISENO_TOKENS.md): temas, capas, colores clínicos y comprobación de regresiones.
- [Informe de implementación](docs/INFORME_IMPLEMENTACION_2026-11-08.md): evidencias y límites de la validación local.
- [Preparación y despliegue](docs/DESPLIEGUE.md): plantilla de producción, restauración, borradores heredados y reversión.
- [Cierre de preproducción](docs/CIERRE_PREPRODUCCION_2026-11-09.md): resultados de esta implementación y requisitos externos pendientes.
