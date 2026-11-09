<?php

namespace Tests\Integration;

use App\Clinica\Soporte\AplicadorParches;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ParcheIntegridadTest extends TestCase
{
    public function test_rechaza_una_columna_existente_con_definicion_incompatible(): void
    {
        $this->assertSame('bd_clinica_undac_test', DB::connection()->getDatabaseName());
        $carpeta = storage_path('framework/testing/parche-'.bin2hex(random_bytes(5)));
        mkdir($carpeta, 0700, true);
        $archivo = $carpeta.'/columna-'.bin2hex(random_bytes(5)).'.sql';
        DB::statement('CREATE TABLE prueba_definicion (valor VARCHAR(10) NULL)');
        file_put_contents($archivo, 'ALTER TABLE prueba_definicion ADD COLUMN valor VARCHAR(180) NULL;');
        try {
            (new AplicadorParches($carpeta))->aplicar();
            $this->fail('Debió detectar la definición incompatible.');
        } catch (\RuntimeException $error) {
            $this->assertStringContainsString('Definición incompatible', $error->getMessage());
            $this->assertDatabaseMissing('parche_aplicado', ['nombre' => basename($archivo)]);
        } finally {
            DB::statement('DROP TABLE prueba_definicion');
            unlink($archivo);
            rmdir($carpeta);
        }
    }

    public function test_no_oculta_duplicados_al_crear_una_restriccion(): void
    {
        $this->assertSame('bd_clinica_undac_test', DB::connection()->getDatabaseName());
        $carpeta = storage_path('framework/testing/parche-'.bin2hex(random_bytes(5)));
        mkdir($carpeta, 0700, true);
        $archivo = $carpeta.'/integridad-'.bin2hex(random_bytes(5)).'.sql';
        DB::statement('CREATE TABLE prueba_integridad (valor INT NOT NULL)');
        DB::table('prueba_integridad')->insert([['valor' => 1], ['valor' => 1]]);
        file_put_contents($archivo, 'ALTER TABLE prueba_integridad ADD UNIQUE KEY prueba_unica (valor);');
        try {
            (new AplicadorParches($carpeta))->aplicar();
            $this->fail('Debió rechazar la restricción sobre datos duplicados.');
        } catch (QueryException $error) {
            $this->assertSame(1062, (int) $error->errorInfo[1]);
            $this->assertDatabaseMissing('parche_aplicado', ['nombre' => basename($archivo)]);
        } finally {
            DB::statement('DROP TABLE prueba_integridad');
            unlink($archivo);
            rmdir($carpeta);
        }
    }
}
