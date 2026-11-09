<?php

namespace App\Console\Commands;

use App\Clinica\Soporte\AplicadorParches;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PDO;
use RuntimeException;
use Symfony\Component\Process\Process;

class EnsayarRestauracion extends Command
{
    protected $signature = 'pruebas:restauracion {--cliente=mysql} {--volcador=mysqldump}';

    protected $description = 'Respalda datos sintéticos de rendimiento y restaura exclusivamente en bd_clinica_undac_restauracion';

    public function handle(): int
    {
        $c = config('database.connections.mysql');
        if (! in_array($c['host'], ['127.0.0.1', 'localhost'], true) || $c['url']) {
            throw new RuntimeException('El ensayo solo admite MySQL local sin DB_URL.');
        }
        $origen = 'bd_clinica_undac_rendimiento';
        $destino = 'bd_clinica_undac_restauracion';
        $pdo = new PDO("mysql:host={$c['host']};port={$c['port']};charset=utf8mb4", $c['username'], $c['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $pdo->exec("USE `{$origen}`");
        if ((int) $pdo->query('SELECT version FROM pruebas_esquema')->fetchColumn() !== 1) {
            throw new RuntimeException('El origen no tiene un esquema de pruebas saneado.');
        }
        $inventariar = function () use ($pdo): array {
            $resultado = [];
            foreach ($pdo->query("SHOW FULL TABLES WHERE Table_type='BASE TABLE'")->fetchAll(PDO::FETCH_NUM) as $fila) {
                $tabla = $fila[0];
                if (! preg_match('/^[a-z_]+$/', $tabla)) {
                    throw new RuntimeException('Nombre de tabla inesperado.');
                }
                $resultado[$tabla] = (int) $pdo->query("SELECT COUNT(*) FROM `{$tabla}`")->fetchColumn();
            }
            ksort($resultado);

            return $resultado;
        };
        $antes = $inventariar();
        $carpeta = storage_path('app/private/ensayo-restauracion');
        if (! is_dir($carpeta)) {
            mkdir($carpeta, 0700, true);
        }
        $archivo = $carpeta.'/respaldo-sintetico.sql';
        $argumentos = ['--host='.$c['host'], '--port='.$c['port'], '--user='.$c['username']];
        $entorno = ['MYSQL_PWD' => $c['password']];
        $volcado = new Process([$this->option('volcador'), ...$argumentos, '--single-transaction', '--routines', '--triggers', '--no-tablespaces', '--set-gtid-purged=OFF', '--result-file='.$archivo, $origen], null, $entorno);
        $volcado->setTimeout(300)->mustRun();
        $pdo->exec("DROP DATABASE IF EXISTS `{$destino}`");
        $pdo->exec("CREATE DATABASE `{$destino}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $sql = preg_replace('/DEFINER\s*=\s*`[^`]+`@`[^`]+`/i', '', file_get_contents($archivo));
        $restauracion = new Process([$this->option('cliente'), ...$argumentos, '--binary-mode', '--database='.$destino], null, $entorno);
        $restauracion->setInput("SET SESSION sql_log_bin=0;\n".$sql)->setTimeout(300)->mustRun();
        $pdo->exec("USE `{$destino}`");
        $despues = $inventariar();
        if ($antes !== $despues) {
            throw new RuntimeException('Los conteos restaurados no coinciden.');
        }
        config(['database.connections.mysql.database' => $destino, 'database.connections.mysql.url' => null]);
        DB::purge('mysql');
        (new AplicadorParches(database_path('parches')))->aplicar('mysql', true);
        // Archivo sintético, fuera del directorio público. Nunca usa adjuntos clínicos operativos.
        file_put_contents($carpeta.'/adjunto-origen.txt', 'Adjunto sintético del ensayo de restauración.');
        copy($carpeta.'/adjunto-origen.txt', $carpeta.'/adjunto-restaurado.txt');
        $iguales = hash_file('sha256', $carpeta.'/adjunto-origen.txt') === hash_file('sha256', $carpeta.'/adjunto-restaurado.txt');
        $informe = ['resultado' => $iguales ? 'aprobado' : 'fallido', 'tablasComprobadas' => count($antes), 'historias' => $despues['historia_clinica'], 'conteosIguales' => true, 'adjuntoIdentico' => $iguales, 'parchesReaplicados' => true, 'sha256Respaldo' => hash_file('sha256', $archivo)];
        file_put_contents($carpeta.'/resultado.json', json_encode($informe, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
        $this->line(json_encode($informe, JSON_THROW_ON_ERROR));

        return $iguales ? self::SUCCESS : self::FAILURE;
    }
}
