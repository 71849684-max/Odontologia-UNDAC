<?php

namespace App\Providers;

use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Contratos\GestorSesion;
use App\Identidad\Dominio\Contratos\LimitadorIntentos;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Dominio\Contratos\RegistradorIntentosAcceso;
use App\Identidad\Dominio\Contratos\RepositorioAuditoria;
use App\Identidad\Dominio\Contratos\RepositorioConfiguracion;
use App\Identidad\Dominio\Contratos\RepositorioIndicadores;
use App\Identidad\Dominio\Contratos\RepositorioPermisos;
use App\Identidad\Dominio\Contratos\RepositorioRoles;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use App\Identidad\Dominio\Contratos\VerificadorContrasena;
use App\Identidad\Infraestructura\Acceso\ConsultaAccesosSql;
use App\Identidad\Infraestructura\Acceso\GestorSesionLaravel;
use App\Identidad\Infraestructura\Acceso\LimitadorIntentosLaravel;
use App\Identidad\Infraestructura\Acceso\ProveedorCuentas;
use App\Identidad\Infraestructura\Acceso\RegistradorIntentosAccesoSql;
use App\Identidad\Infraestructura\Acceso\VerificadorContrasenaHash;
use App\Identidad\Infraestructura\Persistencia\RepositorioAuditoriaSql;
use App\Identidad\Infraestructura\Persistencia\RepositorioConfiguracionSql;
use App\Identidad\Infraestructura\Persistencia\RepositorioIndicadoresSql;
use App\Identidad\Infraestructura\Persistencia\RepositorioPermisosSql;
use App\Identidad\Infraestructura\Persistencia\RepositorioRolesEloquent;
use App\Identidad\Infraestructura\Persistencia\RepositorioUsuariosEloquent;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ConsultaAccesos::class, ConsultaAccesosSql::class);

        $this->app->bind(RepositorioUsuarios::class, RepositorioUsuariosEloquent::class);
        $this->app->bind(RepositorioRoles::class, RepositorioRolesEloquent::class);
        $this->app->bind(RepositorioPermisos::class, RepositorioPermisosSql::class);
        $this->app->bind(RepositorioConfiguracion::class, RepositorioConfiguracionSql::class);
        $this->app->bind(RepositorioIndicadores::class, RepositorioIndicadoresSql::class);

        $this->app->singleton(RepositorioAuditoriaSql::class);
        $this->app->bind(RepositorioAuditoria::class, fn ($app) => $app->make(RepositorioAuditoriaSql::class));
        $this->app->bind(RegistradorAuditoria::class, fn ($app) => $app->make(RepositorioAuditoriaSql::class));

        $this->app->bind(RegistradorIntentosAcceso::class, RegistradorIntentosAccesoSql::class);
        $this->app->bind(GestorSesion::class, GestorSesionLaravel::class);
        $this->app->bind(LimitadorIntentos::class, LimitadorIntentosLaravel::class);
        $this->app->bind(VerificadorContrasena::class, VerificadorContrasenaHash::class);
    }

    public function boot(): void
    {
        RateLimiter::for('cambios-equipo-estado', function (Request $solicitud) {
            $cuenta = $solicitud->user()?->clave() ?? $solicitud->ip();
            $respuesta = fn (Request $peticion, array $cabeceras) => response()->json([
                'message' => 'Ha realizado demasiados cambios seguidos. Espere un minuto antes de volver a intentarlo.',
            ], 429, $cabeceras);

            return [
                Limit::perMinute(30)->by('cambios-globales:'.$cuenta)->response($respuesta),
                Limit::perMinute(6)->by('cambios-historia:'.$cuenta.':'.$solicitud->route('idHistoria'))->response($respuesta),
            ];
        });
        Auth::provider('cuentas', function ($app): ProveedorCuentas {
            return new ProveedorCuentas($app->make(RepositorioUsuarios::class));
        });
    }
}
