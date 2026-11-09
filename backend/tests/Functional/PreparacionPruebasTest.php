<?php

namespace Tests\Functional;

use Tests\TestCase;

class PreparacionPruebasTest extends TestCase
{
    public function test_instalador_rechaza_la_base_operativa_antes_de_conectarse(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Destino de pruebas no permitido');
        $this->artisan('pruebas:esquema', ['destino' => 'bd_clinica_undac', '--recrear' => true])->run();
    }

    public function test_instalador_rechaza_url_que_pueda_cambiar_el_destino(): void
    {
        config(['database.connections.mysql.url' => 'mysql://invalido@localhost/bd_clinica_undac']);
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('No utilice DB_URL');
        $this->artisan('pruebas:esquema', ['destino' => 'bd_clinica_undac_test'])->run();
    }

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
