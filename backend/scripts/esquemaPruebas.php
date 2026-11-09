<?php

use App\Clinica\Soporte\EsquemaPruebas;

require __DIR__.'/../vendor/autoload.php';
$destino = $argv[1] ?? '';
if ($destino === '') {
    throw new RuntimeException('Indique la ruta del esquema generado.');
}
$generador = new EsquemaPruebas;
$sentencias = $generador->sentencias(file_get_contents(__DIR__.'/../../bd_clinica_undac.sql'));
$sql = "CREATE DATABASE IF NOT EXISTS `bd_clinica_undac_test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nUSE `bd_clinica_undac_test`;\n";
foreach ($sentencias as $sentencia) {
    $sql .= "DELIMITER $$\n".$sentencia."$$\nDELIMITER ;\n";
}
file_put_contents($destino, $sql);
echo "Esquema de pruebas sin registros operativos generado.\n";
