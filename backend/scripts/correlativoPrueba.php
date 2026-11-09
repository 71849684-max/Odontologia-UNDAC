<?php

use App\Clinica\Historias\ServicioHistorias;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;

// Herramienta exclusiva de pruebas: cada proceso usa su propia conexión.
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
config(['database.default' => 'mysql', 'database.connections.mysql.database' => 'bd_clinica_undac_test', 'database.connections.mysql.url' => null]);
DB::purge('mysql');
if (DB::selectOne('SELECT DATABASE() AS nombre')->nombre !== 'bd_clinica_undac_test') {
    throw new RuntimeException('Destino no permitido.');
}
if (($argv[1] ?? '') === 'preparar') {
    $creador = new class
    {
        use CreaUsuarios;

        public function crear(): object
        {
            return $this->crearUsuario('concurrencia.'.bin2hex(random_bytes(6)), 'ClaveSintetica123*');
        }
    };
    $actor = $creador->crear();
    echo json_encode(['actor' => $actor->clave()]);
} else {
    $actor = $app->make(RepositorioUsuarios::class)->buscarPorId($argv[1]);
    $historia = $app->make(ServicioHistorias::class)->abrir([
        'dni' => $argv[2], 'nombres' => 'Paciente Sintético', 'apellidoPaterno' => 'Concurrencia',
    ], $actor);
    echo json_encode(['codigo' => $historia['codigo']]);
}
