<?php

use App\Clinica\Soporte\AplicadorParches;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../vendor/autoload.php';
$aplicacion = require __DIR__.'/../bootstrap/app.php';
$aplicacion->make(Kernel::class)->bootstrap();
$base = $argv[1] ?? '';
if (! in_array($base, ['bd_clinica_undac_test', 'bd_clinica_undac_navegador', 'bd_clinica_undac_rendimiento'], true)) {
    throw new RuntimeException('Solo se permiten bases aisladas de pruebas.');
}
config(['database.connections.mysql.database' => $base, 'database.connections.mysql.url' => null]);
DB::purge('mysql');
$aplicados = (new AplicadorParches(database_path('parches')))->aplicar('mysql');
echo count($aplicados)." parches aplicados en {$base}.\n";
