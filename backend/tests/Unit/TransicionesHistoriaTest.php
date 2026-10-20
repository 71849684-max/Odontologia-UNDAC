<?php

namespace Tests\Unit;

use App\Clinica\Historias\ServicioHistorias;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\CreaUsuarios;
use Tests\Soporte\AbreHistoria;
use Tests\TestCase;

class TransicionesHistoriaTest extends TestCase
{
    use AbreHistoria, CreaUsuarios, DatabaseTransactions;

    public function test_el_porcentaje_usa_las_diecisiete_secciones(): void
    {
        $this->assertSame(100, ServicioHistorias::porcentaje(17));
        $this->assertSame(94, ServicioHistorias::porcentaje(16));
        $this->assertSame(6, ServicioHistorias::porcentaje(1));
        $this->assertSame(0, ServicioHistorias::porcentaje(0));
    }

    public function test_no_se_puede_validar_desde_borrador_ni_saltar_estados(): void
    {
        $alumno = $this->crearUsuario('uni.trans.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $id = $this->abrirHistoria($alumno, '71000011');
        $servicio = app(ServicioHistorias::class);

        try {
            $servicio->cambiarEstado($id, 'VALIDADA', $alumno);
            $this->fail('Debió rechazar BORRADOR → VALIDADA.');
        } catch (OperacionNoPermitida $excepcion) {
            $this->assertSame('estado', $excepcion->campo);
            $this->assertStringContainsString('No se puede pasar de BORRADOR a VALIDADA', $excepcion->getMessage());
        }

        $servicio->cambiarEstado($id, 'EN_PROCESO', $alumno);

        try {
            $servicio->cambiarEstado($id, 'OBSERVADA', $alumno);
            $this->fail('Debió rechazar EN_PROCESO → OBSERVADA.');
        } catch (OperacionNoPermitida $excepcion) {
            $this->assertStringContainsString('EN_PROCESO a OBSERVADA', $excepcion->getMessage());
        }
    }

    public function test_solo_un_docente_observa_o_valida_y_validada_es_final(): void
    {
        $alumno = $this->crearUsuario('uni.trans.val.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $docente = $this->crearUsuario('uni.trans.val.docente', self::CLAVE_PRUEBA, 'DOCENTE');
        $id = $this->abrirHistoria($alumno, '71000012');
        $servicio = app(ServicioHistorias::class);

        $servicio->cambiarEstado($id, 'PENDIENTE_REVISION', $alumno);

        try {
            $servicio->cambiarEstado($id, 'VALIDADA', $alumno);
            $this->fail('El alumno no debe validar.');
        } catch (OperacionNoPermitida $excepcion) {
            $this->assertStringContainsString('Solo un docente', $excepcion->getMessage());
        }

        $servicio->cambiarEstado($id, 'VALIDADA', $docente);
        $this->assertSame('VALIDADA', $servicio->mostrar($id)['codigoEstado']);

        try {
            $servicio->cambiarEstado($id, 'EN_PROCESO', $docente);
            $this->fail('VALIDADA no admite transiciones.');
        } catch (OperacionNoPermitida $excepcion) {
            $this->assertStringContainsString('VALIDADA a EN_PROCESO', $excepcion->getMessage());
        }
    }
}
