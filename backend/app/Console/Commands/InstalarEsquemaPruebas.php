<?php

namespace App\Console\Commands;

use App\Clinica\Soporte\EsquemaPruebas;
use Illuminate\Console\Command;
use PDO;
use RuntimeException;

class InstalarEsquemaPruebas extends Command
{
    protected $signature = 'pruebas:esquema {destino} {--recrear : Borra únicamente la base de pruebas indicada}';

    protected $description = 'Instala estructura y catálogos en una base exclusiva de pruebas';

    public function handle(EsquemaPruebas $generador): int
    {
        $destino = $this->argument('destino');
        if (! in_array($destino, ['bd_clinica_undac_test', 'bd_clinica_undac_navegador', 'bd_clinica_undac_rendimiento'], true)) {
            throw new RuntimeException('Destino de pruebas no permitido.');
        }
        if (config('database.connections.mysql.url')) {
            throw new RuntimeException('No utilice DB_URL en la instalación de pruebas.');
        }
        $sentencias = $generador->sentencias(file_get_contents(base_path('../bd_clinica_undac.sql')));
        $c = config('database.connections.mysql');
        $pdo = new PDO("mysql:host={$c['host']};port={$c['port']};charset=utf8mb4", $c['username'], $c['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        // Solo esta conexión de instalación: no modifica el binlog global del servidor.
        try {
            $pdo->exec('SET SESSION sql_log_bin = 0');
        } catch (\PDOException) { /* Una cuenta con permisos de triggers puede no necesitar esta opción. */
        }
        if ($this->option('recrear')) {
            $pdo->exec("DROP DATABASE IF EXISTS `{$destino}`");
        }
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$destino}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE `{$destino}`");
        if ($pdo->query('SHOW TABLES')->fetch()) {
            throw new RuntimeException('La base no está vacía. Use --recrear solo para datos de pruebas desechables.');
        }
        foreach ($sentencias as $sql) {
            $pdo->exec($sql);
        }
        $this->info('Estructura y catálogos instalados sin datos operativos en '.$destino);

        return self::SUCCESS;
    }
}
