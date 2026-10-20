<?php

namespace Tests\E2E;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\CreaUsuarios;
use Tests\Soporte\AbreHistoria;
use Tests\TestCase;

class FlujoClinicoCompletoTest extends TestCase
{
    use AbreHistoria, CreaUsuarios, DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_alumno_abre_historia_docente_observa_corrige_y_valida(): void
    {
        $alumno = $this->crearUsuario('e2e.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $docente = $this->crearUsuario('e2e.docente', self::CLAVE_PRUEBA, 'DOCENTE');
        $intrusa = $this->crearUsuario('e2e.intrusa', self::CLAVE_PRUEBA, 'ALUMNO');

        $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'e2e.alumno',
            'contrasena' => self::CLAVE_PRUEBA,
        ])->assertOk()->assertJsonPath('roles.0', 'ALUMNO');

        $paciente = $this->actingAs($alumno, 'web')->postJson('/api/pacientes', [
            'nombres' => 'Rosa',
            'apellidoPaterno' => 'Quispe',
            'apellidoMaterno' => 'Rojas',
            'numeroDocumento' => '71000101',
            'sexo' => 'F',
            'fechaNacimiento' => '1998-04-22',
        ])->assertCreated();

        $id = (int) $this->actingAs($alumno, 'web')->postJson('/api/historias', [
            'pacienteId' => $paciente->json('id'),
        ])->assertCreated()->json('id');

        $this->guardarExpediente($alumno, $id, [
            'anamnesis' => [
                'motivoConsulta' => 'Dolor en molar superior',
                'historiaEnfermedad' => 'Tres días de evolución',
            ],
            'cuestionario-salud' => ['q13Answer' => 'Sí', 'q13Detail' => 'Penicilina'],
            'diagnostico' => ['dxPresuntivo' => 'Pulpitis irreversible', 'dxDefinitivo' => 'Pulpitis'],
        ], ['anamnesis' => 'complete', 'diagnostico' => 'in-progress'])->assertOk();

        $this->actingAs($alumno, 'web')->post("/api/historias/{$id}/archivos", [
            'campo' => 'firmaPaciente',
            'archivo' => UploadedFile::fake()->image('firma.png', 40, 20),
        ], ['Accept' => 'application/json'])->assertCreated();

        $this->actingAs($alumno, 'web')
            ->patchJson("/api/historias/{$id}/estado", ['codigo' => 'PENDIENTE_REVISION'])
            ->assertOk()
            ->assertJsonPath('codigoEstado', 'PENDIENTE_REVISION');

        $this->actingAs($intrusa, 'web')->getJson("/api/historias/{$id}")->assertNotFound();
        $this->actingAs($intrusa, 'web')->getJson('/api/historias?q=71000101')->assertOk()->assertJsonCount(0, 'data');

        $this->actingAs($docente, 'web')->patchJson("/api/historias/{$id}/estado", [
            'codigo' => 'OBSERVADA',
            'observacion' => 'Completar odontograma y reenviar.',
        ])->assertOk()->assertJsonPath('codigoEstado', 'OBSERVADA');

        $this->actingAs($alumno, 'web')->patchJson("/api/historias/{$id}/estado", [
            'codigo' => 'PENDIENTE_REVISION',
        ])->assertOk();

        $this->actingAs($docente, 'web')
            ->patchJson("/api/historias/{$id}/estado", ['codigo' => 'VALIDADA'])
            ->assertOk()
            ->assertJsonPath('codigoEstado', 'VALIDADA');

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['anamnesis' => ['motivoConsulta' => 'Intento posterior']],
        ])->assertStatus(409);

        $this->actingAs($alumno, 'web')->postJson('/api/auth/logout')->assertOk();
        $this->getJson('/api/auth/yo')->assertUnauthorized();
    }
}
