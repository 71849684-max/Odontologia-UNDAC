<?php

use App\Academico\Http\ControladorAcademico;
use App\Clinica\Http\Controladores\ControladorArchivos;
use App\Clinica\Http\Controladores\ControladorHistorias;
use App\Clinica\Http\Controladores\ControladorNotificaciones;
use App\Clinica\Http\Controladores\ControladorPacientes;
use App\Identidad\Http\Controladores\ControladorAdministracion;
use App\Identidad\Http\Controladores\ControladorAuditoria;
use App\Identidad\Http\Controladores\ControladorAutenticacion;
use App\Identidad\Http\Controladores\ControladorConfiguracion;
use App\Identidad\Http\Controladores\ControladorCuenta;
use App\Identidad\Http\Controladores\ControladorPermisos;
use App\Identidad\Http\Controladores\ControladorUsuarios;
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
    Route::put('auth/clave', [ControladorCuenta::class, 'cambiarContrasena'])
        ->middleware('throttle:6,1')
        ->name('auth.clave');
    Route::get('perfil', [ControladorCuenta::class, 'perfil'])->name('perfil.show');
    Route::put('perfil', [ControladorCuenta::class, 'actualizarPerfil'])->name('perfil.update');

    Route::get('notificaciones', [ControladorNotificaciones::class, 'listar'])
        ->middleware('throttle:60,1')
        ->name('notificaciones.index');
    Route::patch('notificaciones/{idNotificacion}/leida', [ControladorNotificaciones::class, 'marcarLeida'])
        ->whereNumber('idNotificacion')
        ->name('notificaciones.leida');
    Route::post('notificaciones/leer-todas', [ControladorNotificaciones::class, 'marcarTodas'])
        ->name('notificaciones.leerTodas');

    Route::middleware('acceso:PACIENTES')->group(function (): void {
        Route::get('pacientes', [ControladorPacientes::class, 'listar'])->name('pacientes.index');
        Route::get('pacientes/buscar', [ControladorPacientes::class, 'buscar'])
            ->middleware('throttle:30,1')
            ->name('pacientes.buscar');
        Route::post('pacientes', [ControladorPacientes::class, 'crear'])->name('pacientes.store');
        Route::get('pacientes/{idPaciente}', [ControladorPacientes::class, 'mostrar'])
            ->whereNumber('idPaciente')
            ->name('pacientes.show');
        Route::put('pacientes/{idPaciente}', [ControladorPacientes::class, 'actualizar'])
            ->whereNumber('idPaciente')
            ->name('pacientes.update');
    });

    Route::middleware('acceso:HISTORIAS')->group(function (): void {
        Route::get('historias', [ControladorHistorias::class, 'listar'])->name('historias.index');
        Route::get('personal', [ControladorHistorias::class, 'personal'])->name('personal.index');
        Route::get('seguimientos', [ControladorHistorias::class, 'seguimientos'])->name('seguimientos.index');
        Route::patch('seguimientos/{idSeguimiento}', [ControladorHistorias::class, 'actualizarSeguimiento'])
            ->whereNumber('idSeguimiento')
            ->name('seguimientos.update');
        Route::patch('programaciones/{idProgramacion}', [ControladorHistorias::class, 'actualizarProgramacion'])
            ->whereNumber('idProgramacion')
            ->name('programaciones.update');
        Route::post('historias', [ControladorHistorias::class, 'crear'])->name('historias.store');

        Route::middleware('historia.acceso')->prefix('historias/{idHistoria}')->whereNumber('idHistoria')->group(function (): void {
            Route::get('/', [ControladorHistorias::class, 'mostrar'])->name('historias.show');
            Route::put('asignacion', [ControladorHistorias::class, 'asignar'])->name('historias.asignacion');
            Route::patch('estado', [ControladorHistorias::class, 'cambiarEstado'])->name('historias.estado');
            Route::get('expediente', [ControladorHistorias::class, 'expediente'])->name('historias.expediente');
            Route::put('expediente', [ControladorHistorias::class, 'guardarExpediente'])->name('historias.expediente.update');
            Route::post('seguimientos', [ControladorHistorias::class, 'crearSeguimiento'])->name('historias.seguimientos.store');
            Route::get('odontograma', [ControladorHistorias::class, 'odontograma'])->name('historias.odontograma');
            Route::put('odontograma', [ControladorHistorias::class, 'guardarOdontograma'])->name('historias.odontograma.update');
            Route::post('archivos', [ControladorArchivos::class, 'subir'])
                ->middleware('throttle:60,1')
                ->name('historias.archivos.store');
            Route::get('archivos/{idArchivo}', [ControladorArchivos::class, 'mostrar'])
                ->whereNumber('idArchivo')
                ->name('historias.archivos.show');
            Route::delete('archivos/{idArchivo}', [ControladorArchivos::class, 'eliminar'])
                ->whereNumber('idArchivo')
                ->name('historias.archivos.destroy');
        });
    });

    Route::middleware('acceso:CURSOS')->prefix('academico')->name('academico.')->group(function (): void {
        Route::get('/', [ControladorAcademico::class, 'estado'])->name('estado');
        Route::post('periodos', [ControladorAcademico::class, 'crearPeriodo'])->name('periodos.store');
        Route::post('cursos', [ControladorAcademico::class, 'crearCurso'])->name('cursos.store');
        Route::put('cursos/{idCurso}', [ControladorAcademico::class, 'actualizarCurso'])->name('cursos.update');
        Route::post('grupos', [ControladorAcademico::class, 'crearGrupo'])->name('grupos.store');
        Route::put('grupos/{idGrupo}', [ControladorAcademico::class, 'actualizarGrupo'])->name('grupos.update');
        Route::post('grupos/{idGrupo}/miembros', [ControladorAcademico::class, 'membresias'])->name('grupos.miembros');
        Route::patch('miembros/{idMembresia}', [ControladorAcademico::class, 'finalizarMembresia'])->name('miembros.finalizar');
        Route::post('rotaciones', [ControladorAcademico::class, 'crearRotacion'])->name('rotaciones.store');
        Route::post('rotaciones/{idRotacion}/docentes', [ControladorAcademico::class, 'docentesRotacion'])->name('rotaciones.docentes');
        Route::post('rotaciones/{idRotacion}/alumnos', [ControladorAcademico::class, 'asignaciones'])->name('rotaciones.alumnos');
    });

    // Modulo de administracion: todo endpoint nuevo nace dentro de este grupo.
    Route::middleware('rol:ADMINISTRADOR')->prefix('admin')->name('admin.')->group(function (): void {
        Route::get('resumen', [ControladorAdministracion::class, 'resumen'])->name('resumen');

        Route::get('roles', [ControladorUsuarios::class, 'roles'])->name('roles');
        Route::get('usuarios', [ControladorUsuarios::class, 'listar'])->name('usuarios.index');
        Route::post('usuarios', [ControladorUsuarios::class, 'crear'])->name('usuarios.store');
        Route::get('usuarios/{idUsuario}', [ControladorUsuarios::class, 'mostrar'])->name('usuarios.show');
        Route::put('usuarios/{idUsuario}', [ControladorUsuarios::class, 'actualizar'])->name('usuarios.update');
        Route::patch('usuarios/{idUsuario}/estado', [ControladorUsuarios::class, 'cambiarEstado'])->name('usuarios.estado');
        Route::patch('usuarios/{idUsuario}/clave', [ControladorCuenta::class, 'restablecerContrasena'])
            ->middleware('throttle:20,1')
            ->name('usuarios.clave');

        Route::get('permisos', [ControladorPermisos::class, 'catalogo'])->name('permisos.catalogo');
        Route::get('usuarios/{idUsuario}/permisos', [ControladorPermisos::class, 'deUsuario'])->name('permisos.show');
        Route::put('usuarios/{idUsuario}/permisos', [ControladorPermisos::class, 'guardar'])->name('permisos.update');
        Route::delete('usuarios/{idUsuario}/permisos', [ControladorPermisos::class, 'restaurar'])->name('permisos.restore');

        Route::get('auditoria', [ControladorAuditoria::class, 'listar'])->name('auditoria');
        Route::get('configuracion', [ControladorConfiguracion::class, 'listar'])->name('configuracion.index');
        Route::put('configuracion', [ControladorConfiguracion::class, 'guardar'])->name('configuracion.update');
    });
});
