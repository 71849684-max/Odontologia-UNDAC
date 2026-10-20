<?php

namespace Tests\Integration;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\TestCase;

class ObservarHistoriaTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    public function test_observar_guarda_texto_en_historial(): void
    {
        $alumno = $this->crearUsuario('alumno.observa', self::CLAVE, 'ALUMNO');
        $docente = $this->crearUsuario('docente.observa', self::CLAVE, 'DOCENTE');
        $id = (int) $this->actingAs($alumno, 'web')->postJson('/api/historias', [
            'dni' => '70000999', 'nombres' => 'Paciente Observado', 'sexo' => 'F',
        ])->assertCreated()->json('id');

        $this->actingAs($alumno, 'web')->patchJson("/api/historias/{$id}/estado", ['codigo' => 'PENDIENTE_REVISION'])->assertOk();

        $respuesta = $this->actingAs($docente, 'web')->patchJson("/api/historias/{$id}/estado", [
            'codigo' => 'OBSERVADA',
            'observacion' => 'Corregir odontograma y firmar consentimiento.',
        ])->assertOk();

        $respuesta->assertJsonPath('codigoEstado', 'OBSERVADA');
        $respuesta->assertJsonPath('observacion', 'Corregir odontograma y firmar consentimiento.');
        $respuesta->assertJsonPath('observaciones.0.texto', 'Corregir odontograma y firmar consentimiento.');
        $this->assertNotEmpty($respuesta->json('observaciones.0.fecha'));

        $this->actingAs($alumno, 'web')->patchJson("/api/historias/{$id}/estado", ['codigo' => 'PENDIENTE_REVISION'])->assertOk();
        $this->actingAs($docente, 'web')->patchJson("/api/historias/{$id}/estado", [
            'codigo' => 'OBSERVADA',
            'observacion' => 'Falta firmar el consentimiento informado.',
        ])->assertOk();

        $detalle = $this->actingAs($alumno, 'web')
            ->getJson("/api/historias/{$id}")
            ->assertOk()
            ->assertJsonPath('observacion', 'Falta firmar el consentimiento informado.');

        $this->assertCount(2, $detalle->json('observaciones'));
        $this->assertSame('Falta firmar el consentimiento informado.', $detalle->json('observaciones.0.texto'));
        $this->assertSame('Corregir odontograma y firmar consentimiento.', $detalle->json('observaciones.1.texto'));
        $this->assertNotEmpty($detalle->json('observaciones.0.fecha'));
        $this->assertNotEmpty($detalle->json('observaciones.1.fecha'));
        $this->assertNotEmpty($detalle->json('observaciones.0.docente'));
        $this->assertSame($detalle->json('observaciones.0.docente'), $detalle->json('observaciones.1.docente'));
    }
}