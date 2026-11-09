# Odontologia-UNDAC

- `backend/` — API y aplicación Laravel
- `frontend/` — interfaz React (Vite)

## Instalación local

Requisitos: PHP 8.3 o superior con PDO MySQL, mbstring y GD, Composer, Node.js 24 y MySQL 8. El esquema se mantiene en SQL, no en migraciones Laravel.

1. Crear una base de desarrollo e importar `bd_clinica_undac.sql` **solo en un servidor de desarrollo**: el archivo contiene instrucciones para eliminar y recrear `bd_clinica_undac`.
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

Desde `backend`, `composer test` utiliza `bd_clinica_undac_test`, que debe tener el esquema y sus parches. `php vendor/bin/pint --test` revisa estilo sin escribir.

- [Pruebas reales de navegador](docs/PRUEBAS_NAVEGADOR.md): preparación exclusiva, Chromium, Firefox y estabilidad.
- [Rendimiento e integridad](docs/RENDIMIENTO.md): datos sintéticos, carga concurrente y métricas.
- [Diseño y tokens](docs/DISENO_TOKENS.md): temas, capas, colores clínicos y comprobación de regresiones.
- [Informe de implementación](docs/INFORME_IMPLEMENTACION_2026-11-08.md): evidencias y límites de la validación local.
