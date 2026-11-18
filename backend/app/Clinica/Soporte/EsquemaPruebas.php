<?php

namespace App\Clinica\Soporte;

use RuntimeException;

/** Extrae estructura y catálogos; nunca copia pacientes, cuentas ni trazas. */
final class EsquemaPruebas
{
    private const CATALOGOS = ['rol', 'modulo', 'submodulo', 'rol_submodulo', 'estado_historia_clinica', 'catalogo_hallazgo_dental', 'catalogo_tratamiento_dental', 'pieza_dental', 'superficie_dental', 'pregunta_salud', 'consentimiento_clausula'];

    public function sentencias(string $sql): array
    {
        $resultado = [];
        $delimitador = ';';
        $pendiente = '';
        foreach (preg_split('/\r?\n/', $sql) as $linea) {
            if (preg_match('/^\s*DELIMITER\s+(\S+)/i', $linea, $partes)) {
                if (trim($pendiente) !== '') {
                    throw new RuntimeException('Delimitador inesperado en el esquema.');
                }
                $delimitador = $partes[1];

                continue;
            }
            if (preg_match('/^\s*--/', $linea) || trim($linea) === '') {
                continue;
            }
            $pendiente .= $linea."\n";
            if (! str_ends_with(rtrim($linea), $delimitador)) {
                continue;
            }
            $sentencia = trim(substr(rtrim($pendiente), 0, -strlen($delimitador)));
            $pendiente = '';
            if (preg_match('/^(?:CREATE|DROP)\s+DATABASE|^USE\s|\bbd_clinica_undac\s*\./i', $sentencia)) {
                throw new RuntimeException('El esquema no puede seleccionar otra base.');
            }
            if (preg_match('/^INSERT\s+(?:IGNORE\s+)?INTO\s+`?([a-z_]+)`?/i', $sentencia, $tabla)) {
                if (! in_array($tabla[1], self::CATALOGOS, true)) {
                    continue;
                }
            } elseif (! preg_match('/^(?:CREATE\s+(?:TABLE|TRIGGER|ALGORITHM)|ALTER\s+TABLE|DROP\s+TABLE|SET\s|\/\*!)/i', $sentencia)) {
                if (preg_match('/^(?:START TRANSACTION|COMMIT)$/i', $sentencia)) {
                    continue;
                }
                throw new RuntimeException('Instrucción inesperada en la estructura de pruebas.');
            }
            if (preg_match('/^DROP TABLE/i', $sentencia) && ! preg_match('/^DROP TABLE IF EXISTS `vista_[a-z_]+`$/i', $sentencia)) {
                throw new RuntimeException('No se permite eliminar tablas de datos.');
            }
            $sentencia = preg_replace('/\s+DEFINER\s*=\s*`[^`]+`@`[^`]+`/i', '', $sentencia);
            $sentencia = preg_replace('/AUTO_INCREMENT=\d+/i', 'AUTO_INCREMENT=1', $sentencia);
            $resultado[] = $sentencia;
        }
        if (trim($pendiente) !== '') {
            throw new RuntimeException('El esquema contiene una sentencia incompleta.');
        }
        foreach (['NOMBRE_INSTITUCION' => 'Institución de pruebas', 'FACULTAD' => 'Facultad de pruebas', 'ZONA_HORARIA' => 'America/Lima', 'ELIMINACION_CLINICA_PERMITIDA' => '0', 'TIPO_DENTICION_POR_DEFECTO' => 'PERMANENTE', 'TAMANO_MAXIMO_ARCHIVO_KB' => '10240'] as $clave => $valor) {
            $resultado[] = "INSERT INTO configuracion_sistema (clave, valor, estado) VALUES ('{$clave}', '{$valor}', 1)";
        }
        $resultado[] = 'CREATE TABLE pruebas_esquema (version INT NOT NULL PRIMARY KEY)';
        $resultado[] = 'INSERT INTO pruebas_esquema (version) VALUES (1)';

        return $resultado;
    }
}
