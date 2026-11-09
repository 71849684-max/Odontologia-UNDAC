<?php

namespace Tests\Functional;

use Tests\TestCase;

class PreparacionPruebasTest extends TestCase
{
    public function test_rechaza_la_preparacion_fuera_de_un_entorno_exclusivo(): void
    {
        $this->artisan('pruebas:preparar')->expectsOutputToContain('Preparación rechazada')->assertFailed();
    }

    public function test_rechaza_la_base_de_trabajo_aunque_el_entorno_sea_de_pruebas(): void
    {
        $this->app->instance('env', 'pruebas_navegador');
        config(['database.connections.mysql.database' => 'bd_clinica_undac']);
        $this->artisan('pruebas:preparar')->expectsOutputToContain('Preparación rechazada')->assertFailed();
    }
}
