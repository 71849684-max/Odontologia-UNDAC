<?php

namespace Tests\Regression;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\CreaUsuarios;
use Tests\Soporte\AbreHistoria;
use Tests\TestCase;

class HumoReleaseTest extends TestCase
{
    use AbreHistoria, CreaUsuarios, DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_humo_de_release_login_historia_odontograma_archivo_revision_y_bitacora(): void
    {
        $alumno = $this->crearUsuario('reg.humo.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $docente = $this->crearUsuario('reg.humo.docente', self::CLAVE_PRUEBA, 'DOCENTE');
        $admin = $this->crearUsuario('reg.humo.admin', self::CLAVE_PRUEBA, 'ADMINISTRADOR');
        $ajena = $this->crearUsuario('reg.humo.ajena', self::CLAVE_PRUEBA, 'ALUMNO');

        $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'reg.humo.alumno',
            'contrasena' => self::CLAVE_PRUEBA,
        ])->assertOk();
        $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'reg.humo.docente',
            'contrasena' => self::CLAVE_PRUEBA,
        ])->assertOk();
        $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'reg.humo.admin',
            'contrasena' => self::CLAVE_PRUEBA,
        ])->assertOk()->assertJsonPath('es_administrador', true);

        $id = $this->abrirHistoria($alumno, '71000201', 'Paciente Humo');
        $this->guardarExpediente($alumno, $id, [
            'anamnesis' => ['motivoConsulta' => 'Control de release', 'historiaEnfermedad' => 'Sin dolor'],
        ])->assertOk();

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/odontograma", [
            'registro' => [
                'version' => 1,
                'examinations' => [[
                    'id' => 'exam-humo',
                    'status' => 'draft',
                    'teeth' => ['16' => ['surfaces' => ['oclusal' => ['state' => 'caries', 'findings' => []]]]],
                ]],
            ],
        ])->assertOk();

        $archivo = $this->actingAs($alumno, 'web')->post("/api/historias/{$id}/archivos", [
            'campo' => 'fotosExtraorales',
            'archivo' => UploadedFile::fake()->image('frente.jpg', 80, 80),
        ], ['Accept' => 'application/json'])->assertCreated();
        $this->actingAs($alumno, 'web')
            ->get("/api/historias/{$id}/archivos/".$archivo->json('archivoId'))
            ->assertOk();
        $this->actingAs($alumno, 'web')
            ->deleteJson("/api/historias/{$id}/archivos/".$archivo->json('archivoId'))
            ->assertNoContent();

        $this->actingAs($alumno, 'web')->patchJson("/api/historias/{$id}/estado", [
            'codigo' => 'PENDIENTE_REVISION',
        ])->assertOk();
        $this->actingAs($docente, 'web')->patchJson("/api/historias/{$id}/estado", [
            'codigo' => 'OBSERVADA',
            'observacion' => 'Revisar oclusión.',
        ])->assertOk();
        $this->actingAs($alumno, 'web')->patchJson("/api/historias/{$id}/estado", [
            'codigo' => 'PENDIENTE_REVISION',
        ])->assertOk();
        $this->actingAs($docente, 'web')->patchJson("/api/historias/{$id}/estado", [
            'codigo' => 'VALIDADA',
        ])->assertOk();

        $this->actingAs($ajena, 'web')->getJson("/api/historias/{$id}")->assertNotFound();

        $this->actingAs($admin, 'web')->getJson('/api/admin/auditoria')
            ->assertOk()
            ->assertJsonStructure(['data']);

        $this->actingAs($alumno, 'web')->postJson('/api/auth/logout')->assertOk();
        $this->getJson('/api/auth/yo')->assertUnauthorized();
    }
}
