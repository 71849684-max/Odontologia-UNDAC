<?php

namespace Tests\Integration;

use App\Clinica\Expediente\ServicioVersionesClinicas;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\CreaUsuarios;
use Tests\TestCase;

class VersionesClinicasTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private function escenario(): array
    {
        $asistente = $this->crearUsuario('asistente.versiones', 'ClaveDePrueba123*', 'ALUMNO');
        $profesional = $this->crearUsuario('profesional.versiones', 'ClaveDePrueba123*', 'DOCENTE');
        $id = (int) $this->actingAs($asistente)->postJson('/api/historias', ['dni' => '71009961', 'nombres' => 'Paciente Sintético', 'sexo' => 'F'])->assertCreated()->json('id');
        $this->asignarProfesionalPrueba($profesional, $id);

        return [$asistente, $profesional, $id];
    }

    public function test_conserva_original_autor_y_cadena_de_integridad(): void
    {
        [$asistente, $profesional, $id] = $this->escenario();
        $url = "/api/historias/{$id}/expediente";
        $this->actingAs($asistente)->putJson($url, ['formData' => ['anamnesis' => ['motivoConsulta' => 'Primera versión']]])->assertOk();
        $this->actingAs($profesional)->putJson($url, ['formData' => ['anamnesis' => ['motivoConsulta' => 'Segunda versión']]])->assertOk();
        $filas = DB::table('historia_documento_version')->where('id_historia_clinica', $id)->orderBy('id_version')->get();
        $anterior = str_repeat('0', 64);
        foreach ($filas as $fila) {
            $this->assertSame($anterior, $fila->hash_anterior);
            $this->assertSame($fila->hash_integridad, ServicioVersionesClinicas::huella((array) $fila));
            $anterior = $fila->hash_integridad;
        }
        $this->assertStringContainsString('Primera versión', $filas[1]->contenido);
        $this->assertSame($profesional->id(), (int) $filas->last()->id_usuario);
        $this->getJson("/api/historias/{$id}/versiones/{$filas[1]->id_version}")->assertOk()->assertJsonPath('integridadVerificada', true);
    }

    public function test_una_cuenta_sin_asignacion_no_lee_las_versiones(): void
    {
        [, , $id] = $this->escenario();
        $otro = $this->crearUsuario('otro.versiones', 'ClaveDePrueba123*', 'ALUMNO');
        $this->actingAs($otro)->getJson("/api/historias/{$id}/versiones")->assertNotFound();
    }

    public function test_la_base_impide_alterar_una_version_conservada(): void
    {
        [$asistente, , $id] = $this->escenario();
        $this->actingAs($asistente)->putJson("/api/historias/{$id}/expediente", ['formData' => ['anamnesis' => ['motivoConsulta' => 'Original']]])->assertOk();
        $version = DB::table('historia_documento_version')->where('id_historia_clinica', $id)->value('id_version');
        $this->expectException(QueryException::class);
        DB::table('historia_documento_version')->where('id_version', $version)->update(['contenido' => '{}']);
    }

    public function test_consultar_un_expediente_deja_traza_sin_duplicar_datos_clinicos(): void
    {
        [$asistente, , $id] = $this->escenario();
        $this->actingAs($asistente)->getJson("/api/historias/{$id}/expediente")->assertOk()->assertHeader('Cache-Control', 'no-store, private');
        $evento = DB::table('auditoria')->where('accion', 'CONSULTAR_HISTORIA')->where('id_registro', $id)->latest('id_auditoria')->first();
        $this->assertNotNull($evento);
        $this->assertStringNotContainsString('Paciente Sintético', $evento->valores_nuevos);
    }

    public function test_aprobar_exige_cop_y_reabrir_exige_motivo(): void
    {
        [, $profesional, $id] = $this->escenario();
        $url = "/api/historias/{$id}/expediente";
        $datos = ['formData' => ['anamnesis' => ['motivoConsulta' => 'Control']], 'sectionStatus' => ['anamnesis' => 'approved']];
        DB::table('docente')->where('id_docente', $profesional->idActor())->update(['numero_colegiatura' => null]);
        $this->actingAs($profesional)->putJson($url, $datos)->assertUnprocessable()->assertJsonValidationErrors('profesional');
        DB::table('docente')->where('id_docente', $profesional->idActor())->update(['numero_colegiatura' => '556677']);
        $this->putJson($url, $datos)->assertOk();
        $datos['sectionStatus']['anamnesis'] = 'in-progress';
        $this->putJson($url, $datos)->assertUnprocessable()->assertJsonValidationErrors('motivo');
        $this->putJson($url, $datos + ['motivo' => 'Rectificar información de la entrevista'])->assertOk();
        $this->assertSame('Rectificar información de la entrevista', DB::table('historia_documento_version')->where('id_historia_clinica', $id)->orderByDesc('id_version')->value('motivo'));
    }

    public function test_el_consentimiento_negado_se_conserva_al_preparar_otro_documento(): void
    {
        Storage::fake('local');
        [, $profesional, $id] = $this->escenario();
        $url = "/api/historias/{$id}/expediente";
        $this->actingAs($profesional)->putJson($url, ['formData' => ['consentimiento' => ['intervencionAutorizada' => 'Procedimiento de prueba', 'fecha' => now()->toDateString()]]])->assertOk();
        $this->post("/api/historias/{$id}/archivos", ['campo' => 'constanciaDecisionConsentimiento', 'archivo' => UploadedFile::fake()->image('decision.png')], ['Accept' => 'application/json'])->assertCreated();
        $this->postJson("/api/historias/{$id}/consentimiento/decision", ['decision' => 'NEGADO', 'motivo' => 'El paciente decide no continuar después de la explicación.'])->assertOk();
        $this->putJson($url, ['formData' => ['consentimiento' => ['intervencionAutorizada' => 'Otra alternativa de tratamiento', 'fecha' => now()->toDateString()]]])->assertOk();
        $filas = DB::table('consentimiento_informado')->where('id_historia_clinica', $id)->orderBy('version_documento')->get();
        $this->assertCount(2, $filas);
        $this->assertSame('NEGADO', $filas[0]->estado);
        $this->assertSame('Procedimiento de prueba', $filas[0]->intervencion_autorizada);
        $this->assertSame('BORRADOR', $filas[1]->estado);
    }

    public function test_recupera_un_adjunto_reemplazado_solo_desde_una_version_autorizada(): void
    {
        Storage::fake('local');
        [$asistente, , $id] = $this->escenario();
        $primero = $this->actingAs($asistente)->post("/api/historias/{$id}/archivos", ['campo' => 'firmaPaciente', 'archivo' => UploadedFile::fake()->image('primera.png')], ['Accept' => 'application/json'])->assertCreated()->json('archivoId');
        $this->post("/api/historias/{$id}/archivos", ['campo' => 'firmaPaciente', 'archivo' => UploadedFile::fake()->image('segunda.png')], ['Accept' => 'application/json'])->assertCreated();
        $version = DB::table('historia_documento_version')->where('id_historia_clinica', $id)->orderByDesc('id_version')->value('id_version');
        $this->get("/api/historias/{$id}/archivos/{$primero}")->assertNotFound();
        $this->get("/api/historias/{$id}/archivos/{$primero}?version={$version}")->assertOk();
    }

    public function test_la_filiacion_aprobada_no_cambia_por_editar_el_registro_general_del_paciente(): void
    {
        [, $profesional, $id] = $this->escenario();
        $url = "/api/historias/{$id}/expediente";
        $this->actingAs($profesional)->putJson($url, ['formData' => ['datos-paciente' => ['nombres' => 'Nombre al aprobar']], 'sectionStatus' => ['datos-paciente' => 'approved']])->assertOk();
        $paciente = DB::table('historia_clinica')->where('id_historia_clinica', $id)->value('id_paciente');
        DB::table('paciente')->where('id_paciente', $paciente)->update(['nombres' => 'Nombre actualizado en la ficha general']);
        $this->getJson($url)->assertOk()->assertJsonPath('formData.datos-paciente.nombres', 'Nombre al aprobar');
    }

    public function test_exporta_versiones_y_adjuntos_y_no_omite_archivos_reemplazados(): void
    {
        Storage::fake('local');
        [$asistente, , $id] = $this->escenario();
        foreach (['primera.png', 'segunda.png'] as $nombre) {
            $this->actingAs($asistente)->post("/api/historias/{$id}/archivos", ['campo' => 'firmaPaciente', 'archivo' => UploadedFile::fake()->image($nombre)], ['Accept' => 'application/json'])->assertCreated();
        }
        $respuesta = $this->get("/api/historias/{$id}/exportacion-completa")->assertOk()->assertDownload('historia-'.$id.'-completa.zip');
        $ruta = $respuesta->baseResponse->getFile()->getPathname();
        $zip = new \ZipArchive;
        try {
            $this->assertTrue($zip->open($ruta));
            $this->assertNotFalse($zip->getFromName('expediente.json'));
            $this->assertNotFalse($zip->getFromName('versiones.jsonl'));
            $this->assertCount(2, json_decode($zip->getFromName('adjuntos.json'), true));
            $this->assertFalse(json_decode($zip->getFromName('integridad.json'), true)['firmaDigital']);
        } finally {
            $zip->close();
            if (is_file($ruta)) {
                unlink($ruta);
            }
        }
    }
}
