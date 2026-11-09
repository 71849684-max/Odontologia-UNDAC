<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $app = parent::createApplication();
        $configuracion = $app['config'];
        if (! $app->environment('testing') || $configuracion->get('database.default') !== 'mysql'
            || $configuracion->get('database.connections.mysql.database') !== 'bd_clinica_undac_test'
            || $configuracion->get('database.connections.mysql.url')) {
            throw new \RuntimeException('Pruebas rechazadas: la conexión no corresponde a la base exclusiva.');
        }
        $conexion = $app['db']->connection('mysql');
        if ($conexion->selectOne('SELECT DATABASE() AS nombre')->nombre !== 'bd_clinica_undac_test'
            || ! $conexion->getSchemaBuilder()->hasTable('pruebas_esquema')) {
            throw new \RuntimeException('Prepare la base saneada con pruebas:esquema antes de ejecutar las pruebas.');
        }

        return $app;
    }
}
