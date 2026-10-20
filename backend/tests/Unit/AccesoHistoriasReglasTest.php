<?php

namespace Tests\Unit;

use App\Clinica\Historias\AccesoHistorias;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\Soporte\AbreHistoria;
use Tests\Soporte\CuentaFalsa;
use Tests\TestCase;

class AccesoHistoriasReglasTest extends TestCase
{
    use AbreHistoria, CreaUsuarios, DatabaseTransactions;

    public function test_solo_el_alumno_esta_restringido(): void
    {
        $acceso = new AccesoHistorias;

        $this->assertTrue($acceso->restringido(new CuentaFalsa('ALUMNO')));
        $this->assertFalse($acceso->restringido(new CuentaFalsa('DOCENTE')));
    }

    public function test_el_alumno_no_ve_historias_ajenas_ni_anuladas(): void
    {
        $duena = $this->crearUsuario('uni.acceso.duena', self::CLAVE_PRUEBA, 'ALUMNO');
        $ajena = $this->crearUsuario('uni.acceso.ajena', self::CLAVE_PRUEBA, 'ALUMNO');
        $docente = $this->crearUsuario('uni.acceso.docente', self::CLAVE_PRUEBA, 'DOCENTE');
        $id = $this->abrirHistoria($duena, '71000001');
        $acceso = app(AccesoHistorias::class);

        $this->assertTrue($acceso->puedeVer($duena, $id));
        $this->assertFalse($acceso->puedeVer($ajena, $id));
        $this->assertTrue($acceso->puedeVer($docente, $id));

        DB::table('historia_clinica')->where('id_historia_clinica', $id)->update(['anulado_en' => now()]);
        $this->assertFalse($acceso->puedeVer($duena, $id));
        $this->assertFalse($acceso->puedeVer($docente, $id));
    }

    public function test_una_historia_validada_congela_al_alumno_no_al_docente(): void
    {
        $alumno = $this->crearUsuario('uni.acceso.validada', self::CLAVE_PRUEBA, 'ALUMNO');
        $docente = $this->crearUsuario('uni.acceso.validada.doc', self::CLAVE_PRUEBA, 'DOCENTE');
        $id = $this->abrirHistoria($alumno, '71000002');
        $acceso = app(AccesoHistorias::class);

        $this->assertTrue($acceso->puedeModificar($alumno, $id));
        $this->assertTrue($acceso->puedeModificar($docente, $id));

        $validada = (int) DB::table('estado_historia_clinica')->where('codigo', 'VALIDADA')->value('id_estado_historia');
        DB::table('historia_clinica')->where('id_historia_clinica', $id)->update(['id_estado_historia' => $validada]);

        $this->assertFalse($acceso->puedeModificar($alumno, $id));
        $this->assertTrue($acceso->puedeModificar($docente, $id));
    }

    public function test_las_secciones_aprobadas_quedan_bloqueadas_para_el_alumno(): void
    {
        $alumno = $this->crearUsuario('uni.acceso.bloqueada', self::CLAVE_PRUEBA, 'ALUMNO');
        $docente = $this->crearUsuario('uni.acceso.bloqueada.doc', self::CLAVE_PRUEBA, 'DOCENTE');
        $id = $this->abrirHistoria($alumno, '71000003');
        DB::table('historia_seccion_estado')->insert([
            'id_historia_clinica' => $id,
            'codigo_seccion' => 'anamnesis',
            'estado' => 'approved',
            'actualizado_en' => now(),
        ]);
        $acceso = app(AccesoHistorias::class);

        $this->assertSame(['anamnesis'], $acceso->seccionesBloqueadas($alumno, $id));
        $this->assertSame([], $acceso->seccionesBloqueadas($docente, $id));
        $this->assertFalse($acceso->seccionEditable($alumno, $id, 'anamnesis'));
        $this->assertTrue($acceso->seccionEditable($alumno, $id, 'odontograma'));
        $this->assertTrue($acceso->seccionEditable($docente, $id, 'anamnesis'));
    }
}
