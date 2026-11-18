<?php

use App\Clinica\Soporte\AplicadorParches;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Schedule::command('clinica:limpiar-exportaciones')->daily();

Artisan::command('clinica:parches {--bd= : Base de datos alternativa (p. ej. bd_clinica_undac_test)} {--forzar : Reaplica parches ya registrados}', function (): int {
    $bd = $this->option('bd');
    if ($bd) {
        if (config('database.connections.mysql.url')) {
            $this->error('No utilice DB_URL junto con una base alternativa.');

            return 1;
        }
        if (! preg_match('/^[A-Za-z0-9_]+$/', (string) $bd)) {
            $this->error('Nombre de base de datos no válido.');

            return 1;
        }
        config(['database.connections.mysql.database' => $bd]);
        DB::purge('mysql');
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
