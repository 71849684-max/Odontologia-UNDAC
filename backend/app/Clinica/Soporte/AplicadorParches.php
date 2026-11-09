<?php

namespace App\Clinica\Soporte;

use Illuminate\Database\Connection;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Ejecuta los .sql de database/parches en orden y registra cada uno en parche_aplicado.
 * MySQL no admite ADD COLUMN IF NOT EXISTS: se toleran los errores de objeto ya existente.
 */
class AplicadorParches
{
    /** Columna, tabla, índice o FK que ya existe; columna o índice que ya no existe. */
    private const ERRORES_TOLERADOS = [1060, 1061, 1826, 1091];

    public function __construct(private readonly string $directorio) {}

    /**
     * @return list<string> parches aplicados en esta ejecución
     */
    public function aplicar(?string $conexion = null, bool $forzar = false, ?array $permitidos = null): array
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
            if ($permitidos !== null && ! in_array($nombre, $permitidos, true)) {
                continue;
            }
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
            if (! $this->coincideObjeto($db, $sentencia, $codigo)) {
                throw new RuntimeException('El objeto existente no coincide con el parche. Revise la estructura antes de continuar.', 0, $e);
            }
        }
    }

    private function coincideObjeto(Connection $db, string $sql, int $codigo): bool
    {
        if ($codigo === 1060 && preg_match('/^ALTER TABLE `?(\w+)`? ADD COLUMN `?(\w+)`? (.+)$/is', $sql, $p)) {
            $definicion = preg_replace('/\s+(?:AFTER\s+`?\w+`?|FIRST)\s*$/i', '', $p[3]);
            $temporal = 'verificacion_parche_'.bin2hex(random_bytes(5));
            try {
                $db->statement("CREATE TEMPORARY TABLE `{$temporal}` (`{$p[2]}` {$definicion})");
                $esperada = array_change_key_case((array) $db->selectOne("SHOW COLUMNS FROM `{$temporal}`"), CASE_LOWER);
                $actual = array_change_key_case((array) $db->selectOne("SHOW COLUMNS FROM `{$p[1]}` WHERE Field = ?", [$p[2]]), CASE_LOWER);
                // MySQL puede describir Extra vacío como «NULL» en tablas temporales.
                foreach (['extra'] as $atributo) {
                    if (($esperada[$atributo] ?? '') === 'NULL') {
                        $esperada[$atributo] = '';
                    }
                    if (($actual[$atributo] ?? '') === 'NULL') {
                        $actual[$atributo] = '';
                    }
                }
                foreach (['Type', 'Null', 'Default', 'Extra'] as $atributo) {
                    $clave = strtolower($atributo);
                    $valorActual = $actual[$clave] ?? null;
                    $valorEsperado = $esperada[$clave] ?? null;
                    if (in_array($clave, ['type', 'extra'], true)) {
                        $valorActual = strtolower((string) $valorActual);
                        $valorEsperado = strtolower((string) $valorEsperado);
                    }
                    if ($valorActual !== $valorEsperado) {
                        throw new RuntimeException('Definición incompatible en '.$p[1].'.'.$p[2].' ('.$atributo.').');
                    }
                }

                return true;
            } finally {
                $db->statement("DROP TEMPORARY TABLE IF EXISTS `{$temporal}`");
            }
        }
        if ($codigo === 1061 && preg_match('/^ALTER TABLE `?(\w+)`? ADD (UNIQUE\s+)?(?:KEY|INDEX) `?(\w+)`?\s*\(([^)]+)\)$/i', $sql, $p)) {
            $columnas = array_map(fn ($valor) => trim($valor, " `\t\r\n"), explode(',', $p[4]));
            $actual = $db->select("SHOW INDEX FROM `{$p[1]}` WHERE Key_name = ?", [$p[3]]);
            usort($actual, fn ($a, $b) => $a->Seq_in_index <=> $b->Seq_in_index);

            return array_column($actual, 'Column_name') === $columnas
                && count(array_filter($actual, fn ($fila) => (bool) $fila->Non_unique !== ($p[2] === ''))) === 0;
        }
        if ($codigo === 1826 && preg_match('/^ALTER TABLE `?(\w+)`? ADD CONSTRAINT `?(\w+)`? FOREIGN KEY \((\w+)\) REFERENCES (\w+)\((\w+)\) ON UPDATE (CASCADE|RESTRICT|SET NULL|NO ACTION) ON DELETE (CASCADE|RESTRICT|SET NULL|NO ACTION)$/i', $sql, $p)) {
            $fila = $db->selectOne('SELECT k.COLUMN_NAME, k.REFERENCED_TABLE_NAME, k.REFERENCED_COLUMN_NAME, r.UPDATE_RULE, r.DELETE_RULE FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r ON r.CONSTRAINT_SCHEMA=k.CONSTRAINT_SCHEMA AND r.CONSTRAINT_NAME=k.CONSTRAINT_NAME AND r.TABLE_NAME=k.TABLE_NAME WHERE k.CONSTRAINT_SCHEMA=DATABASE() AND k.TABLE_NAME=? AND k.CONSTRAINT_NAME=?', [$p[1], $p[2]]);

            return $fila && [$fila->COLUMN_NAME, $fila->REFERENCED_TABLE_NAME, $fila->REFERENCED_COLUMN_NAME, $fila->UPDATE_RULE, $fila->DELETE_RULE] === array_slice($p, 3);
        }

        // Una instrucción desconocida requiere revisión, aunque MySQL diga que el objeto existe.
        return false;
    }
}
