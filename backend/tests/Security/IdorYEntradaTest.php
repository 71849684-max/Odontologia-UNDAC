<?php

namespace Tests\Security;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\CreaUsuarios;
use Tests\Soporte\AbreHistoria;
use Tests\TestCase;

class IdorYEntradaTest extends TestCase
{
    use AbreHistoria, CreaUsuarios, DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_un_alumno_no_escala_a_validar_ni_inyecta_asignacion_por_expediente(): void
    {
        $alumno = $this->crearUsuario('seg.idor.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $otro = $this->crearUsuario('seg.idor.otro', self::CLAVE_PRUEBA, 'ALUMNO');
        $id = $this->abrirHistoria($alumno, '71000301');
        $antes = DB::table('historia_alumno')->where('id_historia_clinica', $id)->where('estado', 1)->pluck('id_alumno')->all();

        $this->actingAs($alumno, 'web')->patchJson("/api/historias/{$id}/estado", [
            'codigo' => 'VALIDADA',
        ])->assertUnprocessable();

        $this->guardarExpediente($alumno, $id, [
            'anamnesis' => ['motivoConsulta' => 'Control'],
            'id_alumno' => $otro->idActor(),
        ])->assertOk();

        $despues = DB::table('historia_alumno')->where('id_historia_clinica', $id)->where('estado', 1)->pluck('id_alumno')->all();
        $this->assertSame($antes, $despues);
        $this->assertSame([$alumno->idActor()], $despues);
    }

    public function test_la_busqueda_no_expone_historias_por_inyeccion_ni_sin_sesion(): void
    {
        $duena = $this->crearUsuario('seg.sql.duena', self::CLAVE_PRUEBA, 'ALUMNO');
        $intrusa = $this->crearUsuario('seg.sql.intrusa', self::CLAVE_PRUEBA, 'ALUMNO');
        $this->abrirHistoria($duena, '71000302', 'Paciente Privado Sql');

        $this->app['auth']->forgetGuards();
        $this->flushSession();
        $this->getJson('/api/auth/yo')->assertUnauthorized();
        $this->getJson('/api/historias?q=71000302')->assertUnauthorized();

        $this->actingAs($intrusa, 'web')->getJson("/api/historias?q=".urlencode("' OR 1=1 --"))
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->actingAs($intrusa, 'web')->getJson('/api/historias?q=71000302')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_rechaza_script_php_y_conserva_texto_clinico_sin_ejecutarlo(): void
    {
        $alumno = $this->crearUsuario('seg.xss.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $id = $this->abrirHistoria($alumno, '71000303');
        $carga = '<img src=x onerror=alert(1)>';

        $guardado = $this->guardarExpediente($alumno, $id, [
            'anamnesis' => ['motivoConsulta' => $carga, 'historiaEnfermedad' => 'Detalle'],
        ])->assertOk();
        $guardado->assertHeader('Content-Type', 'application/json');
        $this->assertSame($carga, $guardado->json('formData.anamnesis.motivoConsulta'));
        $this->assertStringNotContainsString('<script', strtolower($guardado->headers->get('Content-Type') ?? ''));

        $this->actingAs($alumno, 'web')->post("/api/historias/{$id}/archivos", [
            'campo' => 'fotosExtraorales',
            'archivo' => UploadedFile::fake()->create('shell.php', 20, 'application/x-php'),
        ], ['Accept' => 'application/json'])->assertUnprocessable();
    }

    public function test_sin_historias_el_odontograma_queda_fuera_de_alcance(): void
    {
        $admin = $this->crearUsuario('seg.perm.admin', self::CLAVE_PRUEBA, 'ADMINISTRADOR');
        $alumno = $this->crearUsuario('seg.perm.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $id = $this->abrirHistoria($alumno, '71000304');
        $idHistorias = (int) DB::table('submodulo')->where('codigo_submodulo', 'HISTORIAS')->value('id_submodulo');
        $efectivos = $this->actingAs($admin, 'web')
            ->getJson('/api/admin/usuarios/'.$alumno->getKey().'/permisos')
            ->json('efectivos');

        $this->actingAs($admin, 'web')->putJson('/api/admin/usuarios/'.$alumno->getKey().'/permisos', [
            'permisos' => array_values(array_diff($efectivos, [$idHistorias])),
        ])->assertOk();

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/odontograma", [
            'registro' => ['version' => 1, 'examinations' => [['id' => 'x', 'status' => 'draft']]],
        ])->assertForbidden();
    }
}
