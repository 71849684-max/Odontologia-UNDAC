<?php

namespace Tests\Unit;

use App\Clinica\Soporte\EsquemaPruebas;
use PHPUnit\Framework\TestCase;

class EsquemaPruebasTest extends TestCase
{
    public function test_conserva_estructura_y_catalogos_sin_copiar_datos_operativos(): void
    {
        $sentencias = (new EsquemaPruebas)->sentencias(file_get_contents(__DIR__.'/../../../bd_clinica_undac.sql'));
        $sql = implode(";\n", $sentencias);
        $this->assertSame(8, substr_count($sql, 'CREATE TRIGGER'));
        $this->assertStringNotContainsString('DEFINER=', $sql);
        $this->assertStringContainsString('SQL SECURITY INVOKER', $sql);
        foreach (['paciente', 'usuario_docente', 'usuario_alumno', 'historia_clinica', 'auditoria', 'notificacion'] as $tabla) {
            $this->assertDoesNotMatchRegularExpression('/INSERT INTO `?'.$tabla.'`?\s/i', $sql);
        }
        $this->assertStringContainsString('INSERT INTO `rol`', $sql);
        $this->assertStringContainsString('uq_historia_numero', $sql);
    }

    public function test_rechaza_instrucciones_para_cambiar_de_base(): void
    {
        $this->expectException(\RuntimeException::class);
        (new EsquemaPruebas)->sentencias("USE bd_clinica_undac;\n");
    }
}
