<?php

namespace Tests\Security;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Tests\CreaUsuarios;
use Tests\TestCase;

class AccesoHistoriasTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    public function test_un_alumno_no_accede_a_historias_ajenas(): void
    {
        $duena = $this->crearUsuario('alumna.duena', self::CLAVE, 'ALUMNO');
        $intrusa = $this->crearUsuario('alumna.intrusa', self::CLAVE, 'ALUMNO');
        $docente = $this->crearUsuario('docente.acceso', self::CLAVE, 'DOCENTE');

        $id = (int) $this->actingAs($duena, 'web')->postJson('/api/historias', [
            'dni' => '70000401', 'nombres' => 'Paciente Privado', 'sexo' => 'F',
        ])->assertCreated()->json('id');

        $archivo = $this->actingAs($duena, 'web')->post("/api/historias/{$id}/archivos", [
            'campo' => 'firmaPaciente',
            'archivo' => UploadedFile::fake()->image('firma.png', 40, 20),
        ], ['Accept' => 'application/json'])->assertCreated()->json('archivoId');

        $this->actingAs($duena, 'web')->getJson("/api/historias/{$id}/expediente")->assertOk();
        $this->assertDatabaseHas('auditoria', ['accion' => 'SUBIR_ARCHIVO', 'id_registro' => (string) $archivo]);

        $this->actingAs($intrusa, 'web');
        $this->getJson("/api/historias/{$id}")->assertNotFound();
        $this->getJson("/api/historias/{$id}/expediente")->assertNotFound();
        $this->putJson("/api/historias/{$id}/expediente", ['formData' => ['anamnesis' => ['motivoConsulta' => 'x']]])->assertNotFound();
        $this->getJson("/api/historias/{$id}/odontograma")->assertNotFound();
        $this->patchJson("/api/historias/{$id}/estado", ['codigo' => 'EN_PROCESO'])->assertNotFound();
        $this->getJson("/api/historias/{$id}/archivos/{$archivo}")->assertNotFound();
        $this->deleteJson("/api/historias/{$id}/archivos/{$archivo}")->assertNotFound();
        $this->getJson('/api/historias?q=70000401')->assertOk()->assertJsonCount(0, 'data');

        $this->actingAs($docente, 'web')->getJson("/api/historias/{$id}/expediente")->assertOk();
        $this->actingAs($docente, 'web')->getJson('/api/historias?q=70000401')->assertOk()->assertJsonCount(1, 'data');
        $this->actingAs($docente, 'web')->getJson('/api/historias/abc')->assertNotFound();
    }

    public function test_las_respuestas_incluyen_cabeceras_de_seguridad(): void
    {
        $docente = $this->crearUsuario('docente.cabeceras', self::CLAVE, 'DOCENTE');

        $respuesta = $this->actingAs($docente, 'web')->getJson('/api/historias')->assertOk();
        $respuesta->assertHeader('X-Content-Type-Options', 'nosniff');
        $respuesta->assertHeader('X-Frame-Options', 'DENY');
        $respuesta->assertHeader('Referrer-Policy', 'same-origin');
        $this->assertStringContainsString('no-store', (string) $respuesta->headers->get('Cache-Control'));
    }

    public function test_una_historia_validada_no_admite_cambios_del_alumno(): void
    {
        $alumno = $this->crearUsuario('alumno.validada', self::CLAVE, 'ALUMNO');
        $docente = $this->crearUsuario('docente.validada', self::CLAVE, 'DOCENTE');
        $id = (int) $this->actingAs($alumno, 'web')->postJson('/api/historias', [
            'dni' => '70000402', 'nombres' => 'Paciente Validado', 'sexo' => 'M',
        ])->assertCreated()->json('id');
        $cuerpo = ['formData' => ['anamnesis' => ['motivoConsulta' => 'Control']]];

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['anamnesis' => ['estadoGeneral' => str_repeat('x', 300)]],
        ])->assertUnprocessable()->assertJsonValidationErrors('datos');

        $this->actingAs($alumno, 'web')->patchJson("/api/historias/{$id}/estado", ['codigo' => 'PENDIENTE_REVISION'])->assertOk();
        $this->actingAs($docente, 'web')->patchJson("/api/historias/{$id}/estado", ['codigo' => 'VALIDADA'])->assertOk();

        $this->actingAs($alumno, 'web')->getJson("/api/historias/{$id}/expediente")->assertOk();
        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", $cuerpo)->assertStatus(409);
        $this->actingAs($docente, 'web')->putJson("/api/historias/{$id}/expediente", $cuerpo)->assertOk();
    }
}
