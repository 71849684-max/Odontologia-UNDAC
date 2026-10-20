<?php

namespace Tests\Integration;

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

    public function test_un_alumno_puede_abrir_otra_historia_del_mismo_paciente(): void
    {
        $alumno = $this->crearUsuario('alumno.segunda.hc', self::CLAVE, 'ALUMNO');

        $paciente = $this->actingAs($alumno, 'web')->postJson('/api/pacientes', [
            'nombres' => 'Marco',
            'apellidoPaterno' => 'Ríos',
            'apellidoMaterno' => 'Paz',
            'numeroDocumento' => '70000099',
            'sexo' => 'M',
        ])->assertCreated();

        $primera = $this->actingAs($alumno, 'web')->postJson('/api/historias', [
            'pacienteId' => $paciente->json('id'),
        ])->assertCreated();

        DB::table('historia_clinica')->where('id_historia_clinica', $primera->json('id'))->update([
            'creado_en' => now()->subHour(),
        ]);

        $segunda = $this->actingAs($alumno, 'web')->postJson('/api/historias', [
            'pacienteId' => $paciente->json('id'),
        ])->assertCreated();

        $this->assertNotSame($primera->json('id'), $segunda->json('id'));
        $this->assertNotSame($primera->json('codigo'), $segunda->json('codigo'));
        $this->assertSame($paciente->json('id'), $segunda->json('pacienteId'));
        $this->assertSame(2, DB::table('historia_clinica')->where('id_paciente', $paciente->json('id'))->count());

        $exp1 = $this->actingAs($alumno, 'web')->getJson('/api/historias/'.$primera->json('id').'/expediente')->assertOk();
        $exp2 = $this->actingAs($alumno, 'web')->getJson('/api/historias/'.$segunda->json('id').'/expediente')->assertOk();
        $this->assertNotSame(
            $exp1->json('formData.datos-paciente.fechaPaciente'),
            $exp2->json('formData.datos-paciente.fechaPaciente'),
        );
        $this->assertMatchesRegularExpression(
            '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/',
            (string) $exp2->json('formData.datos-paciente.fechaPaciente'),
        );
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
