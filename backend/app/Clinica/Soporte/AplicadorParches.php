<?php

namespace App\Clinica\Soporte;

use Illuminate\Database\Connection;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/**
 * Ejecuta los .sql de database/parches en orden y registra cada uno en parche_aplicado.
 * MySQL no admite ADD COLUMN IF NOT EXISTS: se toleran los errores de objeto ya existente.
 */
class AplicadorParches
{
    /** Columna, tabla, índice o FK que ya existe; columna o índice que ya no existe. */
    private const ERRORES_TOLERADOS = [1050, 1060, 1061, 1022, 1826, 1091, 1062];

    public function __construct(private readonly string $directorio) {}

    /**
     * @return list<string> parches aplicados en esta ejecución
     */
    public function aplicar(?string $conexion = null, bool $forzar = false): array
    {
        $db = DB::connection($conexion);
        $db->statement('CREATE TABLE IF NOT EXISTS parche_aplicado (
            nombre VARCHAR(190) NOT NULL,
            aplicado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (nombre)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

        $aplicados = [];
        foreach ($this->archivos() as $ruta) {
            $nombre = basename($ruta);
            if (! $forzar && $db->table('parche_aplicado')->where('nombre', $nombre)->exists()) {
                continue;
            }
            foreach ($this->sentencias((string) file_get_contents($ruta)) as $sentencia) {
                $this->ejecutar($db, $sentencia);
            }
            $db->table('parche_aplicado')->updateOrInsert(['nombre' => $nombre], ['aplicado_en' => now()]);
            $aplicados[] = $nombre;
        }

        return $aplicados;
    }

    /**
     * @return list<string>
     */
    public function archivos(): array
    {
        $archivos = glob(rtrim($this->directorio, '/\\').DIRECTORY_SEPARATOR.'*.sql') ?: [];
        sort($archivos);

        return $archivos;
    }

    /**
     * @return list<string>
     */
    public function sentencias(string $sql): array
    {
        $sinComentarios = preg_replace('/^\s*--.*$/m', '', $sql) ?? $sql;

        return array_values(array_filter(
            array_map('trim', preg_split('/;\s*(?:\r?\n|$)/', $sinComentarios) ?: []),
            fn (string $sentencia) => $sentencia !== '',
        ));
    }

    private function ejecutar(Connection $db, string $sentencia): void
    {
        try {
            $db->statement($sentencia);
        } catch (QueryException $e) {
            $codigo = (int) ($e->errorInfo[1] ?? 0);
            if (! in_array($codigo, self::ERRORES_TOLERADOS, true)) {
                throw $e;
            }
        }
    }
}
