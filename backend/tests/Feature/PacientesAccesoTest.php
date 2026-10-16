<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\TestCase;

class PacientesAccesoTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    public function test_alumno_solo_lista_y_edita_pacientes_asignados_y_busca_por_dni_exacto(): void
    {
        $duena = $this->crearUsuario('alumna.pac.duena', self::CLAVE, 'ALUMNO');
        $intrusa = $this->crearUsuario('alumna.pac.intrusa', self::CLAVE, 'ALUMNO');
        $docente = $this->crearUsuario('docente.pac.acceso', self::CLAVE, 'DOCENTE');

        $idHistoria = (int) $this->actingAs($duena, 'web')->postJson('/api/historias', [
            'dni' => '70000501',
            'nombres' => 'Paciente Asignado',
            'sexo' => 'F',
        ])->assertCreated()->json('id');

        $idPaciente = (int) $this->actingAs($duena, 'web')->getJson("/api/historias/{$idHistoria}")
            ->assertOk()
            ->json('pacienteId');

        $otro = $this->actingAs($docente, 'web')->postJson('/api/pacientes', [
            'nombres' => 'Otro',
            'apellidoPaterno' => 'Ajeno',
            'numeroDocumento' => '70000502',
            'sexo' => 'M',
        ])->assertCreated()->json();

        $this->actingAs($duena, 'web')->getJson('/api/pacientes?q=700005')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $idPaciente);

        $this->actingAs($intrusa, 'web')->getJson('/api/pacientes?q=70000501')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->actingAs($intrusa, 'web')->getJson("/api/pacientes/{$idPaciente}")->assertNotFound();
        $this->actingAs($intrusa, 'web')->putJson("/api/pacientes/{$idPaciente}", [
            'nombres' => 'Hack',
            'apellidoPaterno' => 'Hack',
            'dni' => '70000501',
        ])->assertNotFound();

        $minimo = $this->actingAs($intrusa, 'web')->getJson('/api/pacientes/buscar?documento=70000501')
            ->assertOk()
            ->assertJsonPath('id', $idPaciente)
            ->assertJsonPath('dni', '70000501')
            ->json();
        $this->assertArrayNotHasKey('telefono', $minimo);
        $this->assertArrayNotHasKey('correo', $minimo);
        $this->assertArrayNotHasKey('direccion', $minimo);
        $this->assertArrayNotHasKey('observaciones', $minimo);

        $this->actingAs($intrusa, 'web')->getJson('/api/pacientes/buscar?documento=700005')
            ->assertNotFound();
        $this->actingAs($intrusa, 'web')->getJson('/api/pacientes/buscar?documento=70000502')
            ->assertOk()
            ->assertJsonPath('id', $otro['id'])
            ->assertJsonMissingPath('telefono');

        $completo = $this->actingAs($duena, 'web')->getJson('/api/pacientes/buscar?documento=70000501')
            ->assertOk()
            ->json();
        $this->assertArrayHasKey('telefono', $completo);

        $this->actingAs($duena, 'web')->putJson("/api/pacientes/{$idPaciente}", [
            'nombres' => 'Paciente',
            'apellidoPaterno' => 'Actualizado',
            'dni' => '70000501',
            'sexo' => 'F',
        ])->assertOk()->assertJsonPath('apellidoPaterno', 'Actualizado');

        $this->actingAs($docente, 'web')->getJson('/api/pacientes?q=700005')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_administrador_es_cuenta_docente(): void
    {
        $this->assertSame(
            'DOCENTE',
            DB::table('rol')->where('codigo_rol', 'ADMINISTRADOR')->value('tipo_usuario'),
        );
    }
}
