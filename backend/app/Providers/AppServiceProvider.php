<?php

namespace App\Providers;

use App\Servicios\ServicioAccesos;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Singleton para que los roles se resuelvan una sola vez por peticion.
        $this->app->singleton(ServicioAccesos::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
