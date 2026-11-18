<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RecursosPruebas extends Command
{
    protected $signature = 'pruebas:recursos';

    protected $description = 'Obtiene indicadores MySQL del entorno exclusivo de rendimiento';

    public function handle(): int
    {
        if (! app()->environment('pruebas_rendimiento') || config('database.connections.mysql.database') !== 'bd_clinica_undac_rendimiento') {
            $this->error('Entorno de rendimiento no permitido.');

            return self::FAILURE;
        }
        $estado = DB::select("SHOW GLOBAL STATUS WHERE Variable_name IN ('Threads_connected', 'Threads_running', 'Slow_queries', 'Innodb_row_lock_waits', 'Innodb_row_lock_time', 'Max_used_connections')");
        $distribucion = DB::table('historia_clinica as h')
            ->join('estado_historia_clinica as e', 'e.id_estado_historia', '=', 'h.id_estado_historia')
            ->selectRaw('e.codigo, COUNT(*) AS cantidad')->groupBy('e.codigo')->get()->all();
        $this->line(json_encode([
            'fecha' => now()->toIso8601String(), 'version' => DB::selectOne('SELECT VERSION() AS version')->version,
            'mysql' => $estado, 'distribucion' => $distribucion,
        ], JSON_THROW_ON_ERROR));

        return self::SUCCESS;
    }
}
