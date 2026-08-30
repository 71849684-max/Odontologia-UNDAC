@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "ERRORES=0"
set "USAR_PHAR=0"
set "NO_PAUSE=0"
if /I "%~1"=="/nopause" set "NO_PAUSE=1"
if /I "%~1"=="--nopause" set "NO_PAUSE=1"

echo.
echo ================================================
echo  Odontologia UNDAC - Verificar e instalar
echo ================================================
echo.

call :agregar_rutas_conocidas

echo [1/4] Herramientas del sistema
echo ------------------------------------------------
call :asegurar_php
if errorlevel 1 goto :fallo_herramientas
call :asegurar_composer
if errorlevel 1 goto :fallo_herramientas
call :asegurar_node
if errorlevel 1 goto :fallo_herramientas
echo.

echo [2/4] Backend Laravel
echo ------------------------------------------------
call :preparar_backend
if errorlevel 1 set "ERRORES=1"
echo.

echo [3/4] Frontend React
echo ------------------------------------------------
call :preparar_frontend
if errorlevel 1 set "ERRORES=1"
echo.

echo [4/4] Comprobacion final
echo ------------------------------------------------
call :comprobar_final
echo.

if "!ERRORES!"=="0" (
    echo ------------------------------------------------
    echo  Todo listo.
    echo  Frontend:  cd frontend ^&^& npm.cmd run dev
    echo  Backend:   cd backend  ^&^& php artisan serve
    echo  UI:        http://127.0.0.1:5173
    echo  API:       http://127.0.0.1:8000
    echo ------------------------------------------------
) else (
    echo ------------------------------------------------
    echo  Termino con avisos. Revisa los mensajes [ERROR] arriba.
    echo ------------------------------------------------
)

if "!NO_PAUSE!"=="0" pause
if "!ERRORES!"=="0" exit /b 0
exit /b 1

:fallo_herramientas
echo.
echo [ERROR] Faltan herramientas del sistema. Instala Laragon o los programas indicados y vuelve a ejecutar este archivo.
if "!NO_PAUSE!"=="0" pause
exit /b 1

rem ------------------------------------------------
:agregar_rutas_conocidas
if exist "%ProgramFiles%\nodejs\npm.cmd" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "%ProgramFiles(x86)%\nodejs\npm.cmd" set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
if exist "C:\laragon\bin\composer" set "PATH=C:\laragon\bin\composer;%PATH%"
if exist "C:\laragon\bin\nodejs" set "PATH=C:\laragon\bin\nodejs;%PATH%"
if exist "C:\laragon\bin\nodejs" (
    for /d %%D in ("C:\laragon\bin\nodejs\node-*") do (
        if exist "%%~D\npm.cmd" set "PATH=%%~D;!PATH!"
    )
)
if exist "C:\laragon\bin\php" (
    for /d %%D in ("C:\laragon\bin\php\php-8.3*") do (
        if exist "%%~D\php.exe" set "PATH=%%~D;!PATH!"
    )
    for /d %%D in ("C:\laragon\bin\php\php-8.4*") do (
        if exist "%%~D\php.exe" set "PATH=%%~D;!PATH!"
    )
    for /d %%D in ("C:\laragon\bin\php\php-8.5*") do (
        if exist "%%~D\php.exe" set "PATH=%%~D;!PATH!"
    )
)
if exist "C:\Herramientas\php83\php.exe" set "PATH=C:\Herramientas\php83;%PATH%"
if exist "C:\Herramientas\php84\php.exe" set "PATH=C:\Herramientas\php84;%PATH%"
if exist "C:\Herramientas\php85\php.exe" set "PATH=C:\Herramientas\php85;%PATH%"
exit /b 0

rem ------------------------------------------------
:asegurar_php
where php >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PHP no esta en el PATH.
    echo         Instala Laragon o PHP 8.3+ y vuelve a ejecutar.
    exit /b 1
)
for /f "tokens=*" %%V in ('php -r "echo PHP_VERSION;"') do set "PHP_VER=%%V"
php -r "exit(version_compare(PHP_VERSION, '8.3.0', '>=') ? 0 : 1);"
if errorlevel 1 (
    echo [ERROR] Se necesita PHP 8.3 o superior. Encontrado: !PHP_VER!
    exit /b 1
)
php -r "exit(extension_loaded('pdo_sqlite') && extension_loaded('openssl') && extension_loaded('mbstring') ? 0 : 1);"
if errorlevel 1 (
    echo [ERROR] PHP !PHP_VER! no tiene extensiones necesarias ^(pdo_sqlite, openssl, mbstring^).
    exit /b 1
)
echo [OK] PHP !PHP_VER!
exit /b 0

rem ------------------------------------------------
:asegurar_composer
where composer >nul 2>&1
if not errorlevel 1 (
    set "USAR_PHAR=0"
    echo [OK] Composer en el PATH
    exit /b 0
)
if exist "%BACKEND%\composer.phar" (
    set "USAR_PHAR=1"
    echo [OK] Composer local ^(backend\composer.phar^)
    exit /b 0
)
echo [..] Composer no esta instalado. Descargando composer.phar...
pushd "%BACKEND%"
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
if not exist "composer-setup.php" (
    echo [ERROR] No se pudo descargar el instalador de Composer.
    popd
    exit /b 1
)
php composer-setup.php --filename=composer.phar --quiet
del /q composer-setup.php >nul 2>&1
popd
if not exist "%BACKEND%\composer.phar" (
    echo [ERROR] No se pudo instalar Composer.
    exit /b 1
)
set "USAR_PHAR=1"
echo [OK] Composer instalado en backend\composer.phar
exit /b 0

rem ------------------------------------------------
:run_composer
if "!USAR_PHAR!"=="1" (
    php "%BACKEND%\composer.phar" %*
) else (
    call composer %*
)
exit /b %ERRORLEVEL%

rem ------------------------------------------------
:asegurar_node
where node >nul 2>&1
if errorlevel 1 (
    echo [..] Node.js no esta en el PATH. Intentando instalar con winget...
    where winget >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Node.js no esta instalado y winget no esta disponible.
        echo         Instala Node.js LTS desde https://nodejs.org y vuelve a ejecutar.
        exit /b 1
    )
    winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements --disable-interactivity
    if exist "%ProgramFiles%\nodejs" set "PATH=%ProgramFiles%\nodejs;%PATH%"
)
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js sigue sin detectarse. Cierra esta ventana, abre otra e intenta de nuevo.
    exit /b 1
)
where npm.cmd >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm.cmd no se encontro. Reinstala Node.js.
    exit /b 1
)
for /f "tokens=*" %%V in ('node -v') do set "NODE_VER=%%V"
for /f "tokens=*" %%V in ('call npm.cmd -v') do set "NPM_VER=%%V"
echo [OK] Node !NODE_VER!  /  npm !NPM_VER!
exit /b 0

rem ------------------------------------------------
:preparar_backend
if not exist "%BACKEND%\artisan" (
    echo [ERROR] No se encontro backend\artisan
    exit /b 1
)
pushd "%BACKEND%"

echo [..] Instalando dependencias PHP ^(composer install^)...
call :run_composer install --no-interaction --prefer-dist
if errorlevel 1 (
    echo [ERROR] composer install fallo.
    popd
    exit /b 1
)
echo [OK] Dependencias PHP

if not exist ".env" (
    copy /y ".env.example" ".env" >nul
    echo [OK] Se creo backend\.env
) else (
    echo [OK] backend\.env presente
)

findstr /b /c:"APP_KEY=base64:" ".env" >nul
if errorlevel 1 (
    php artisan key:generate --no-interaction --ansi
    echo [OK] APP_KEY generado
) else (
    echo [OK] APP_KEY presente
)

if not exist "database\database.sqlite" (
    type nul > "database\database.sqlite"
    echo [OK] Se creo database\database.sqlite
) else (
    echo [OK] SQLite presente
)

echo [..] Ejecutando migraciones...
php artisan migrate --force --no-interaction
if errorlevel 1 (
    echo [ERROR] Las migraciones fallaron.
    popd
    exit /b 1
)
echo [OK] Migraciones al dia
popd
exit /b 0

rem ------------------------------------------------
:preparar_frontend
if not exist "%FRONTEND%\package.json" (
    echo [ERROR] No se encontro frontend\package.json
    exit /b 1
)
pushd "%FRONTEND%"
echo [..] Instalando dependencias npm...
call npm.cmd install
if errorlevel 1 (
    echo [ERROR] npm install fallo.
    popd
    exit /b 1
)
echo [OK] Frontend listo
popd
exit /b 0

rem ------------------------------------------------
:comprobar_final
pushd "%BACKEND%"
php artisan --version >nul
if errorlevel 1 (
    echo [ERROR] php artisan no responde
    set "ERRORES=1"
) else (
    for /f "tokens=*" %%V in ('php artisan --version') do echo [OK] %%V
)
popd
if exist "%FRONTEND%\node_modules\vite\bin\vite.js" (
    echo [OK] Vite instalado
) else (
    echo [ERROR] Vite no esta en node_modules
    set "ERRORES=1"
)
exit /b 0
