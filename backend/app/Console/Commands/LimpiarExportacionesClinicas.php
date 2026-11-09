<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class LimpiarExportacionesClinicas extends Command
{
    protected $signature = 'clinica:limpiar-exportaciones';

    protected $description = 'Retira copias temporales de exportación de más de 24 horas; conserva todos los originales';

    public function handle(): int
    {
        $carpeta = realpath(storage_path('app/private/exportaciones'));
        $eliminados = 0;
        if ($carpeta !== false) {
            foreach (glob($carpeta.DIRECTORY_SEPARATOR.'*') ?: [] as $ruta) {
                if (! is_file($ruta) || is_link($ruta) || realpath(dirname($ruta)) !== $carpeta) {
                    continue;
                }
                if (! preg_match('/^(?:[a-zA-Z0-9]{40}\.zip|(?:versiones-|ver)[a-zA-Z0-9]+(?:\.tmp)?)$/i', basename($ruta))) {
                    continue;
                }
                if (filemtime($ruta) < time() - 86400 && unlink($ruta)) {
                    $eliminados++;
                }
            }
        }
        $this->info('Copias temporales retiradas: '.$eliminados.'. No se modificaron expedientes ni adjuntos originales.');

        return self::SUCCESS;
    }
}
