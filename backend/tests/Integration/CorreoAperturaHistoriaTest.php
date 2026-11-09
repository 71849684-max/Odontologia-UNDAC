<?php

namespace Tests\Integration;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\CreaUsuarios;
use Tests\TestCase;

class CorreoAperturaHistoriaTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    public function test_el_correo_de_apertura_persiste_para_paciente_nuevo_y_existente(): void
    {
        $usuario = $this->crearUsuario('asistente.correo.apertura', 'ClaveDePrueba123*', 'ALUMNO');
        $primera = $this->actingAs($usuario, 'web')->postJson('/api/historias', [
            'dni' => '71000981', 'nombres' => 'Ana', 'apellidoPaterno' => 'Rojas', 'email' => 'inicial@example.test',
        ])->assertCreated();
        $idPaciente = $primera->json('pacienteId');
        foreach ([
            ['pacienteId' => $idPaciente, 'email' => 'seleccionado@example.test'],
            ['dni' => '71000981', 'nombres' => 'Ana', 'correo' => 'documento@example.test'],
            ['pacienteId' => $idPaciente, 'email' => ''],
        ] as $datos) {
            $historia = $this->actingAs($usuario, 'web')->postJson('/api/historias', $datos)->assertCreated();
            $correo = $datos['email'] ?? $datos['correo'] ?? '';
            $esperado = $correo !== '' ? $correo : 'documento@example.test';
            $this->actingAs($usuario, 'web')->getJson('/api/historias/'.$historia->json('id').'/expediente')
                ->assertOk()->assertJsonPath('formData.datos-paciente.correo', $esperado);
            $this->assertDatabaseHas('paciente', ['id_paciente' => $idPaciente, 'correo' => $esperado]);
        }
    }
}
