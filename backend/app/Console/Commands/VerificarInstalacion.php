<?php

namespace App\Console\Commands;

use App\Clinica\Soporte\AplicadorParches;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class VerificarInstalacion extends Command
{
    protected $signature = 'clinica:verificar {--produccion : Exige configuración de producción}';

    protected $description = 'Verifica estructura, correlativos y configuración sin modificar registros';

    public function handle(): int
    {
        $fallos = [];
        $exigir = function (bool $condicion, string $mensaje) use (&$fallos): void {
            if (! $condicion) {
                $fallos[] = $mensaje;
            }
        };
        $exigir(version_compare(PHP_VERSION, '8.4.1', '>='), 'PHP debe ser 8.4.1 o superior; referencia probada: 8.5.');
        $exigir(extension_loaded('zip'), 'Active la extensión ZIP para exportar el expediente con versiones y adjuntos.');
        $base = DB::connection()->getDatabaseName();
        $tablas = DB::select('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_TYPE=?', [$base, 'BASE TABLE']);
        $vistas = DB::select('SELECT TABLE_NAME, SECURITY_TYPE FROM information_schema.VIEWS WHERE TABLE_SCHEMA=?', [$base]);
        $triggers = DB::select('SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=?', [$base]);
        $referencia = json_decode(file_get_contents(database_path('estructura-base.json')), true, flags: JSON_THROW_ON_ERROR);
        foreach (array_diff($referencia['tablas'], array_column($tablas, 'TABLE_NAME')) as $tabla) {
            $fallos[] = 'Tabla base faltante: '.$tabla;
        }
        foreach (array_diff($referencia['vistas'], array_column($vistas, 'TABLE_NAME')) as $vista) {
            $fallos[] = 'Vista faltante: '.$vista;
        }
        foreach (array_diff($referencia['triggers'], array_column($triggers, 'TRIGGER_NAME')) as $trigger) {
            $fallos[] = 'Trigger faltante: '.$trigger;
        }
        $exigir(count($vistas) === 3 && count(array_filter($vistas, fn ($v) => $v->SECURITY_TYPE === 'INVOKER')) === 3, 'Verifique las tres vistas y SQL SECURITY INVOKER.');
        $exigir(count($triggers) >= 12, 'Deben existir los ocho triggers clínicos y las cuatro protecciones documentales.');
        foreach (['historia_clinica' => 'uq_historia_numero', 'historia_alumno' => 'uq_historia_alumno_inicio'] as $tabla => $indice) {
            $filas = DB::select("SHOW INDEX FROM `{$tabla}` WHERE Key_name=?", [$indice]);
            usort($filas, fn ($a, $b) => $a->Seq_in_index <=> $b->Seq_in_index);
            $columnas = $tabla === 'historia_clinica' ? ['numero_historia'] : ['id_historia_clinica', 'id_alumno', 'fecha_asignacion'];
            $exigir(count($filas) > 0 && (int) $filas[0]->Non_unique === 0 && array_column($filas, 'Column_name') === $columnas && count(array_filter($filas, fn ($fila) => $fila->Sub_part !== null)) === 0, 'Falta o no coincide la restricción única '.$indice.'.');
        }
        $esquema = DB::connection()->getSchemaBuilder();
        $exigir($esquema->hasTable('historia_documento_version'), 'Falta el archivo de versiones clínicas.');
        $exigir($esquema->hasColumn('historia_seccion_estado', 'id_version_aprobada'), 'Falta la vinculación de secciones con su versión aprobada.');
        foreach (['proteger_version_actualizacion', 'proteger_version_eliminacion', 'proteger_auditoria_actualizacion', 'proteger_auditoria_eliminacion'] as $proteccion) {
            $exigir(in_array($proteccion, array_column($triggers, 'TRIGGER_NAME'), true), 'Falta la protección '.$proteccion);
        }
        $aplicador = new AplicadorParches(database_path('parches'));
        foreach ($aplicador->archivos() as $archivo) {
            $exigir($esquema->hasTable('parche_aplicado') && DB::table('parche_aplicado')->where('nombre', basename($archivo))->exists(), 'Parche pendiente: '.basename($archivo));
            foreach ($aplicador->sentencias(file_get_contents($archivo)) as $sql) {
                if (preg_match('/^ALTER TABLE `?(\w+)`? ADD COLUMN `?(\w+)`?/i', $sql, $p)) {
                    $exigir($esquema->hasColumn($p[1], $p[2]), 'Columna faltante: '.$p[1].'.'.$p[2]);
                }
                if (preg_match('/^CREATE TABLE IF NOT EXISTS `?(\w+)`?/i', $sql, $p)) {
                    $exigir($esquema->hasTable($p[1]), 'Tabla faltante: '.$p[1]);
                }
            }
        }
        if (! $esquema->hasTable('historia_correlativo')) {
            $fallos[] = 'Falta aplicar el parche del correlativo.';
        } else {
            $inconsistentes = DB::select("SELECT DISTINCT SUBSTRING(h.numero_historia,4,4) AS anio FROM historia_clinica h LEFT JOIN historia_correlativo c ON c.anio=CAST(SUBSTRING(h.numero_historia,4,4) AS UNSIGNED) WHERE h.numero_historia REGEXP '^HC-[0-9]{4}-[0-9]+$' AND (c.anio IS NULL OR c.ultimo < CAST(SUBSTRING(h.numero_historia,9) AS UNSIGNED))");
            $exigir($inconsistentes === [], 'El contador está por debajo de los códigos existentes. Suspenda aperturas y revise su inicialización.');
            $exigir(DB::table('historia_clinica')->whereRaw("numero_historia NOT REGEXP '^HC-[0-9]{4}-[0-9]+$'")->count() === 0, 'Existen códigos de historia fuera del patrón esperado; requieren revisión.');
        }
        $exigir(is_writable(storage_path()) && is_writable(base_path('bootstrap/cache')), 'Revise permisos de storage y bootstrap/cache.');
        if ($this->option('produccion')) {
            $exigir(app()->environment('production') && ! config('app.debug'), 'Exija APP_ENV=production y APP_DEBUG=false.');
            $exigir(str_starts_with(config('app.url'), 'https://'), 'APP_URL debe usar HTTPS.');
            $exigir((bool) config('session.secure') && (bool) config('session.http_only') && config('session.same_site') === 'lax', 'Configure cookies Secure, HttpOnly y SameSite=lax.');
            $exigir(config('database.connections.mysql.username') !== 'root', 'Use una cuenta de aplicación con permisos limitados.');
            $exigir((bool) config('app.key'), 'Falta una clave propia del entorno.');
        }
        $this->line(json_encode(['resultado' => $fallos === [] ? 'aprobado' : 'requiere_correccion', 'php' => PHP_VERSION, 'tablas' => count($tablas), 'vistas' => count($vistas), 'triggers' => count($triggers), 'fallos' => $fallos], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));

        return $fallos === [] ? self::SUCCESS : self::FAILURE;
    }
}
