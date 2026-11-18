<?php

namespace Tests\Integration;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\CreaUsuarios;
use Tests\Soporte\AbreHistoria;
use Tests\TestCase;

class ConcurrenciaExpedienteTest extends TestCase
{
    use AbreHistoria, CreaUsuarios, DatabaseTransactions;

    public function test_un_adjunto_independiente_no_invalida_la_revision_del_formulario(): void
    {
        Storage::fake('local');
        $alumno = $this->crearUsuario('revision.adjunto', self::CLAVE_PRUEBA, 'ALUMNO');
        $id = $this->abrirHistoria($alumno, '71000992');
        $url = "/api/historias/{$id}/expediente";
        $revision = $this->actingAs($alumno, 'web')->getJson($url)->assertOk()->json('revision');
        $this->post("/api/historias/{$id}/archivos", [
            'campo' => 'firmaPaciente', 'archivo' => UploadedFile::fake()->image('firma.png', 40, 20),
        ], ['Accept' => 'application/json'])->assertCreated();
        $this->getJson($url)->assertOk()->assertJsonPath('revision', $revision);
        $this->putJson($url, [
            'revision' => $revision, 'formData' => ['anamnesis' => ['motivoConsulta' => 'Control con adjunto']],
        ])->assertOk();
    }

    public function test_una_revision_obsoleta_no_sobrescribe_el_cambio_de_otra_sesion(): void
    {
        $alumno = $this->crearUsuario('revision.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $id = $this->abrirHistoria($alumno, '71000991');
        $url = "/api/historias/{$id}/expediente";
        $lectura = $this->actingAs($alumno, 'web')->getJson($url)->assertOk();
        $revision = $lectura->json('revision');
        $guardado = $this->putJson($url, [
            'formData' => ['anamnesis' => ['motivoConsulta' => 'Primera sesión']],
            'revision' => $revision,
        ])->assertOk();
        $this->assertNotSame($revision, $guardado->json('revision'));
        $this->putJson($url, [
            'formData' => ['anamnesis' => ['motivoConsulta' => 'Segunda sesión obsoleta']],
            'revision' => $revision,
        ])->assertUnprocessable()->assertJsonValidationErrors('revision');
        $this->getJson($url)->assertOk()->assertJsonPath('formData.anamnesis.motivoConsulta', 'Primera sesión');
        $this->putJson($url, [
            'formData' => ['anamnesis' => ['motivoConsulta' => 'Cambio con revisión vigente']],
            'revision' => $guardado->json('revision'),
        ])->assertOk()->assertJsonPath('formData.anamnesis.motivoConsulta', 'Cambio con revisión vigente');
    }
}
