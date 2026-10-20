<?php

namespace Tests\Acceptance;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\Soporte\AbreHistoria;
use Tests\TestCase;

class CriteriosClinicosTest extends TestCase
{
    use AbreHistoria, CreaUsuarios, DatabaseTransactions;

    /** @var list<string> */
    private const SECCIONES = [
        'datos-paciente',
        'anamnesis',
        'cuestionario-salud',
        'antecedentes',
        'examen-clinico',
        'examen-extraoral',
        'examen-intraoral',
        'odontograma',
        'oclusion',
        'examenes-auxiliares',
        'diagnostico',
        'modelos',
        'plan-tratamiento',
        'consentimiento',
        'cirugia',
        'reporte-operatorio',
        'seguimiento',
    ];

    public function test_el_expediente_expone_las_secciones_institucionales_y_el_alumno_queda_aislado(): void
    {
        $alumno = $this->crearUsuario('uat.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $ajena = $this->crearUsuario('uat.ajena', self::CLAVE_PRUEBA, 'ALUMNO');
        $docente = $this->crearUsuario('uat.docente', self::CLAVE_PRUEBA, 'DOCENTE');
        $id = $this->abrirHistoria($alumno, '71000601', 'Paciente UAT');

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/odontograma", [
            'registro' => [
                'version' => 1,
                'examinations' => [['id' => 'uat-1', 'status' => 'draft', 'teeth' => []]],
            ],
        ])->assertOk();

        $form = $this->actingAs($alumno, 'web')->getJson("/api/historias/{$id}/expediente")
            ->assertOk()
            ->json('formData');

        foreach (self::SECCIONES as $seccion) {
            $this->assertArrayHasKey($seccion, $form, "Falta la sección institucional {$seccion}.");
        }

        $this->actingAs($ajena, 'web')->getJson("/api/historias/{$id}")->assertNotFound();
        $this->actingAs($ajena, 'web')->getJson('/api/historias?q=71000601')->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($docente, 'web')->getJson("/api/historias/{$id}")->assertOk();
    }

    public function test_validar_congela_al_alumno_y_deja_rastro_en_bitacora(): void
    {
        $alumno = $this->crearUsuario('uat.val.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $docente = $this->crearUsuario('uat.val.docente', self::CLAVE_PRUEBA, 'DOCENTE');
        $admin = $this->crearUsuario('uat.val.admin', self::CLAVE_PRUEBA, 'ADMINISTRADOR');
        $id = $this->abrirHistoria($alumno, '71000602');

        $this->guardarExpediente($alumno, $id, [
            'anamnesis' => ['motivoConsulta' => 'UAT', 'historiaEnfermedad' => 'Seguimiento'],
        ])->assertOk();
        $this->actingAs($alumno, 'web')->patchJson("/api/historias/{$id}/estado", [
            'codigo' => 'PENDIENTE_REVISION',
        ])->assertOk();
        $this->actingAs($docente, 'web')->patchJson("/api/historias/{$id}/estado", [
            'codigo' => 'VALIDADA',
        ])->assertOk();

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['anamnesis' => ['motivoConsulta' => 'No debe pasar']],
        ])->assertStatus(409);

        $this->assertDatabaseHas('auditoria', [
            'accion' => 'CAMBIAR_ESTADO',
            'id_registro' => (string) $id,
        ]);

        $this->actingAs($admin, 'web')->getJson('/api/admin/auditoria')
            ->assertOk()
            ->assertJsonStructure(['data', 'acciones']);
    }

    public function test_inactivar_oculta_la_historia_del_listado_clinico(): void
    {
        $admin = $this->crearUsuario('uat.inact.admin', self::CLAVE_PRUEBA, 'ADMINISTRADOR');
        $alumno = $this->crearUsuario('uat.inact.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $id = $this->abrirHistoria($alumno, '71000603');

        DB::table('configuracion_sistema')->where('clave', 'ELIMINACION_CLINICA_PERMITIDA')->update(['valor' => '1']);

        $this->actingAs($admin, 'web')->deleteJson("/api/historias/{$id}")
            ->assertOk()
            ->assertJsonPath('estado', 'inactiva');

        $this->actingAs($admin, 'web')->getJson('/api/historias?q=71000603')->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($alumno, 'web')->getJson("/api/historias/{$id}")->assertNotFound();
    }
}
