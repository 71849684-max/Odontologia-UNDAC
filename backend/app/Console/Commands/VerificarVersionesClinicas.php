<?php

namespace App\Console\Commands;

use App\Clinica\Expediente\ServicioVersionesClinicas;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class VerificarVersionesClinicas extends Command
{
    protected $signature = 'clinica:verificar-versiones';

    protected $description = 'Comprueba hashes y enlaces de versiones sin mostrar información clínica';

    public function handle(): int
    {
        $ultimo = [];
        $errores = 0;
        $cantidad = 0;
        foreach (DB::table('historia_documento_version')->orderBy('id_version')->cursor() as $version) {
            $anterior = $ultimo[$version->id_historia_clinica] ?? str_repeat('0', 64);
            if (! hash_equals($version->hash_anterior, $anterior) || ! hash_equals($version->hash_integridad, ServicioVersionesClinicas::huella((array) $version))) {
                $this->error('Integridad inconsistente en versión '.$version->id_version);
                $errores++;
            }
            $ultimo[$version->id_historia_clinica] = $version->hash_integridad;
            $cantidad++;
        }
        $this->info("Versiones verificadas: {$cantidad}. Inconsistencias: {$errores}.");

        return $errores ? self::FAILURE : self::SUCCESS;
    }
}
