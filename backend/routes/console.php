<?php

use App\Clinica\Soporte\AplicadorParches;
use Illuminate\Support\Facades\Artisan;

Artisan::command('clinica:parches {--bd= : Base de datos alternativa (p. ej. bd_clinica_undac_test)} {--forzar : Reaplica parches ya registrados}', function (): int {
    $bd = $this->option('bd');
    if ($bd) {
        if (! preg_match('/^[A-Za-z0-9_]+$/', (string) $bd)) {
            $this->error('Nombre de base de datos no válido.');

            return 1;
        }
        config(['database.connections.mysql.database' => $bd]);
        \Illuminate\Support\Facades\DB::purge('mysql');
    }

    $aplicados = (new AplicadorParches(database_path('parches')))->aplicar('mysql', (bool) $this->option('forzar'));

    $destino = config('database.connections.mysql.database');
    if ($aplicados === []) {
        $this->info("Sin parches pendientes en {$destino}.");
    } else {
        foreach ($aplicados as $nombre) {
            $this->line("Aplicado en {$destino}: {$nombre}");
        }
    }

    return 0;
})->purpose('Aplica los parches SQL de database/parches');
