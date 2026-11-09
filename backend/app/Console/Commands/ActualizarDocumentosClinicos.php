<?php

namespace App\Console\Commands;

use App\Clinica\Soporte\AplicadorParches;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ActualizarDocumentosClinicos extends Command
{
    protected $signature = 'clinica:actualizar-documentos {--base-esperada= : Nombre explícito de la base de destino}';

    protected $description = 'Instala las protecciones documentales sin modificar registros asistenciales existentes';

    public function handle(): int
    {
        $base = DB::connection()->getDatabaseName();
        if (! $this->option('base-esperada') || $this->option('base-esperada') !== $base) {
            $this->error('Indique --base-esperada con el nombre exacto de la base configurada.');

            return self::FAILURE;
        }
        $aplicados = (new AplicadorParches(database_path('parches')))->aplicar(permitidos: [
            '2026-11-09-proteger-auditoria.sql',
            '2026-11-09-versiones-clinicas.sql',
            '2026-11-09-versiones-secciones.sql',
        ]);
        $this->info(count($aplicados).' actualizaciones documentales instaladas en '.$base.'.');

        return self::SUCCESS;
    }
}
