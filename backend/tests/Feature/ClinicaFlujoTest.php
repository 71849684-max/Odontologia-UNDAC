<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\TestCase;

class ClinicaFlujoTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    public function test_un_alumno_registra_paciente_abre_historia_y_guarda_anamnesis(): void
    {
        $alumno = $this->crearUsuario('alumno.clinica', self::CLAVE, 'ALUMNO');

        $paciente = $this->actingAs($alumno, 'web')->postJson('/api/pacientes', [
            'nombres' => 'Andrea',
            'apellidoPaterno' => 'Salazar',
            'apellidoMaterno' => 'Huamán',
            'numeroDocumento' => '70000001',
            'sexo' => 'F',
            'fechaNacimiento' => '2001-03-12',
        ])->assertCreated()
            ->assertJsonPath('dni', '70000001');

        $historia = $this->actingAs($alumno, 'web')->postJson('/api/historias', [
            'pacienteId' => $paciente->json('id'),
        ])->assertCreated()
            ->assertJsonPath('estado', 'Borrador')
            ->assertJsonPath('dni', '70000001');

        $this->actingAs($alumno, 'web')->putJson('/api/historias/'.$historia->json('id').'/expediente', [
            'formData' => [
                'anamnesis' => [
                    'motivoConsulta' => 'Dolor dental',
                    'historiaEnfermedad' => 'Inicio hace tres días',
                    'estadoGeneral' => 'Bueno',
                    'estadoPsicologico' => ['Colaborador'],
                ],
            ],
            'sectionStatus' => ['anamnesis' => 'in-progress'],
        ])->assertOk()
            ->assertJsonPath('formData.anamnesis.motivoConsulta', 'Dolor dental');

        $this->assertDatabaseHas('anamnesis', [
            'id_historia_clinica' => $historia->json('id'),
            'motivo_consulta' => 'Dolor dental',
        ]);
        $this->assertDatabaseHas('historia_alumno', [
            'id_historia_clinica' => $historia->json('id'),
            'id_alumno' => $alumno->idActor(),
            'tipo_participacion' => 'OPERADOR',
        ]);
    }

    public function test_el_docente_gestiona_el_periodo_y_un_curso(): void
    {
        $docente = $this->crearUsuario('docente.academico', self::CLAVE, 'DOCENTE');

        $this->actingAs($docente, 'web')->postJson('/api/academico/cursos', [
            'codigo' => 'endo-01',
            'nombre' => 'Endodoncia clínica',
            'descripcion' => 'Rotación de endodoncia',
        ])->assertCreated()->assertJsonPath('codigo', 'ENDO-01');

        $this->actingAs($docente, 'web')->getJson('/api/academico')
            ->assertOk()
            ->assertJsonFragment(['codigo' => 'ENDO-01']);

        $this->assertTrue(DB::table('curso')->where('codigo', 'ENDO-01')->exists());
    }

    public function test_un_alumno_no_administra_la_estructura_academica(): void
    {
        $alumno = $this->crearUsuario('alumno.academico', self::CLAVE, 'ALUMNO');

        $this->actingAs($alumno, 'web')->getJson('/api/academico')->assertForbidden();
    }
}
