<?php

use App\Http\Controllers\Admin\ControladorAdministracion;
use App\Http\Controllers\Admin\ControladorAuditoria;
use App\Http\Controllers\Admin\ControladorConfiguracion;
use App\Http\Controllers\Admin\ControladorPermisos;
use App\Http\Controllers\Admin\ControladorUsuarios;
use App\Http\Controllers\Auth\ControladorAutenticacion;
use Illuminate\Support\Facades\Route;

/**
 * Entrega la cookie XSRF-TOKEN antes del primer POST del SPA.
 * El grupo "web" la adjunta a cualquier respuesta.
 */
Route::get('csrf', fn () => response()->noContent())->name('csrf');

Route::post('auth/login', [ControladorAutenticacion::class, 'iniciarSesion'])->name('auth.login');

Route::middleware(['auth', 'usuario.activo'])->group(function (): void {
    Route::get('auth/yo', [ControladorAutenticacion::class, 'yo'])->name('auth.yo');
    Route::post('auth/logout', [ControladorAutenticacion::class, 'cerrarSesion'])->name('auth.logout');

    // Modulo de administracion: todo endpoint nuevo nace dentro de este grupo.
    Route::middleware('rol:ADMINISTRADOR')->prefix('admin')->name('admin.')->group(function (): void {
        Route::get('resumen', [ControladorAdministracion::class, 'resumen'])->name('resumen');

        Route::get('roles', [ControladorUsuarios::class, 'roles'])->name('roles');
        Route::get('usuarios', [ControladorUsuarios::class, 'listar'])->name('usuarios.index');
        Route::post('usuarios', [ControladorUsuarios::class, 'crear'])->name('usuarios.store');
        Route::get('usuarios/{idUsuario}', [ControladorUsuarios::class, 'mostrar'])->name('usuarios.show');
        Route::put('usuarios/{idUsuario}', [ControladorUsuarios::class, 'actualizar'])->name('usuarios.update');
        Route::patch('usuarios/{idUsuario}/estado', [ControladorUsuarios::class, 'cambiarEstado'])->name('usuarios.estado');

        Route::get('permisos', [ControladorPermisos::class, 'catalogo'])->name('permisos.catalogo');
        Route::get('usuarios/{idUsuario}/permisos', [ControladorPermisos::class, 'deUsuario'])->name('permisos.show');
        Route::put('usuarios/{idUsuario}/permisos', [ControladorPermisos::class, 'guardar'])->name('permisos.update');
        Route::delete('usuarios/{idUsuario}/permisos', [ControladorPermisos::class, 'restaurar'])->name('permisos.restore');

        Route::get('auditoria', [ControladorAuditoria::class, 'listar'])->name('auditoria');
        Route::get('configuracion', [ControladorConfiguracion::class, 'listar'])->name('configuracion.index');
        Route::put('configuracion', [ControladorConfiguracion::class, 'guardar'])->name('configuracion.update');
    });
});
