<?php

namespace Tests\Integration;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\TestCase;

class EquipoClinicoTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    private function historia(object $usuario, string $dni, string $nombre = 'Paciente Equipo'): int
    {
        return (int) $this->actingAs($usuario, 'web')->postJson('/api/historias', [
            'dni' => $dni,
            'nombres' => $nombre,
            'sexo' => 'F',
        ])->assertCreated()->json('id');
    }

    public function test_busca_personal_y_el_docente_reasigna_al_operador(): void
    {
        $alumno = $this->crearUsuario('alumno.equipo', self::CLAVE, 'ALUMNO');
        $docente = $this->crearUsuario('docente.equipo', self::CLAVE, 'DOCENTE');
        $id = $this->historia($alumno, '70000301');

        $otro = DB::table('alumno')->insertGetId([
            'codigo_alumno' => 'ALU-EQ-1',
            'tipo_documento' => 'DNI',
            'numero_documento' => '45678912',
            'nombres' => 'Mariela',
            'apellidos' => 'Quispe Torres',
            'estado' => 1,
            'creado_en' => now(),
        ]);

        $this->actingAs($docente, 'web')->getJson('/api/personal?q=45678912')
            ->assertOk()
            ->assertJsonPath('data.0.id', 'ALUMNO-'.$otro)
            ->assertJsonPath('data.0.nombre', 'Mariela Quispe Torres');

        $this->actingAs($docente, 'web')->getJson('/api/personal?q=%25')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->actingAs($alumno, 'web')
            ->putJson("/api/historias/{$id}/asignacion", ['personal' => 'ALUMNO-'.$otro])
            ->assertUnprocessable();

        $this->actingAs($docente, 'web')
            ->putJson("/api/historias/{$id}/asignacion", ['personal' => 'ALUMNO-'.$otro])
            ->assertOk()
            ->assertJsonPath('operador', 'Mariela Quispe Torres');

        $this->assertSame(1, DB::table('historia_alumno')->where('id_historia_clinica', $id)->where('estado', 1)->count());
        $this->assertDatabaseHas('auditoria', ['accion' => 'ASIGNAR_PERSONAL', 'id_registro' => (string) $id]);

        $this->actingAs($docente, 'web')
            ->putJson("/api/historias/{$id}/asignacion", ['personal' => 'ALUMNO-999999999'])
            ->assertUnprocessable();
        $this->actingAs($docente, 'web')
            ->putJson("/api/historias/{$id}/asignacion", ['personal' => "ALUMNO-1' OR 1=1"])
            ->assertUnprocessable();
    }

    public function test_filtra_historias_por_estado_y_lista_seguimientos(): void
    {
        $alumno = $this->crearUsuario('alumno.seguir', self::CLAVE, 'ALUMNO');
        $id = $this->historia($alumno, '70000302', 'Rosa Seguimiento Prueba');
        $this->actingAs($alumno, 'web')
            ->patchJson("/api/historias/{$id}/estado", ['codigo' => 'EN_PROCESO'])
            ->assertOk();

        $this->actingAs($alumno, 'web')->getJson('/api/historias?estado=EN_PROCESO&q=70000302')
            ->assertOk()
            ->assertJsonPath('data.0.id', $id);
        $this->actingAs($alumno, 'web')->getJson('/api/historias?estado=VALIDADA&q=70000302')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $manana = now()->addDay()->toDateString();
        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['consentimiento' => [
                'procedimiento' => 'Exodoncia de tercera molar',
                'programacionFecha' => $manana,
                'programacionHora' => '09:30',
            ]],
        ])->assertOk();

        $this->actingAs($alumno, 'web')->getJson('/api/seguimientos?q=Rosa')
            ->assertOk()
            ->assertJsonPath('data.0.tipo', 'Cirugía programada')
            ->assertJsonPath('data.0.fecha', $manana)
            ->assertJsonPath('data.0.hora', '09:30')
            ->assertJsonPath('data.0.historiaId', $id);
    }

    public function test_solo_el_docente_aprueba_secciones(): void
    {
        $alumno = $this->crearUsuario('alumno.revision', self::CLAVE, 'ALUMNO');
        $docente = $this->crearUsuario('docente.revision', self::CLAVE, 'DOCENTE');
        $id = $this->historia($alumno, '70000303');
        $estado = fn (string $seccion) => DB::table('historia_seccion_estado')
            ->where('id_historia_clinica', $id)->where('codigo_seccion', $seccion)->value('estado');

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['anamnesis' => ['motivoConsulta' => 'Control']],
            'sectionStatus' => ['anamnesis' => 'approved', 'diagnostico' => 'review', 'examen-clinico' => 'hackeado'],
        ])->assertOk();
        $this->assertNull($estado('anamnesis'));
        $this->assertSame('review', $estado('diagnostico'));
        $this->assertNull($estado('examen-clinico'));

        $this->actingAs($docente, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['anamnesis' => ['motivoConsulta' => 'Control']],
            'sectionStatus' => ['diagnostico' => 'approved'],
        ])->assertOk();
        $this->assertSame('approved', $estado('diagnostico'));
        $this->assertSame(2, DB::table('auditoria')
            ->where('accion', 'REVISAR_SECCION')->where('id_registro', (string) $id)->count());

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['anamnesis' => ['motivoConsulta' => 'Control']],
            'sectionStatus' => ['diagnostico' => 'in-progress'],
        ])->assertOk();
        $this->assertSame('approved', $estado('diagnostico'));
    }

    public function test_el_contenido_aprobado_queda_congelado_para_el_alumno(): void
    {
        $alumno = $this->crearUsuario('alumno.congelado', self::CLAVE, 'ALUMNO');
        $docente = $this->crearUsuario('docente.congelado', self::CLAVE, 'DOCENTE');
        $id = $this->historia($alumno, '70000304');
        $guardar = fn ($cuenta, array $formData, array $estados = []) => $this->actingAs($cuenta, 'web')
            ->putJson("/api/historias/{$id}/expediente", ['formData' => $formData, 'sectionStatus' => $estados]);
        $motivo = fn () => $this->actingAs($docente, 'web')->getJson("/api/historias/{$id}/expediente")->json('formData.anamnesis.motivoConsulta');

        $guardar($alumno, ['anamnesis' => ['motivoConsulta' => 'Dolor en molar']])->assertOk();
        $guardar($docente, ['anamnesis' => ['motivoConsulta' => 'Dolor en molar']], ['anamnesis' => 'approved', 'consentimiento' => 'approved', 'odontograma' => 'approved'])->assertOk();

        $guardar($alumno, ['anamnesis' => ['motivoConsulta' => 'Texto alterado'], 'cirugia' => ['preoperatorio' => 'Evaluación']])->assertOk();
        $this->assertSame('Dolor en molar', $motivo());

        $this->actingAs($alumno, 'web')->post("/api/historias/{$id}/archivos", [
            'campo' => 'firmaPaciente',
            'archivo' => UploadedFile::fake()->image('firma.png', 40, 20),
        ], ['Accept' => 'application/json'])->assertUnprocessable()
            ->assertJsonPath('errors.archivo.0', 'La sección ya fue aprobada por el cirujano dentista supervisor y no admite cambios.');

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/odontograma", ['registro' => ['version' => 1]])
            ->assertUnprocessable()
            ->assertJsonPath('errors.registro.0', 'El odontograma ya fue aprobado por el cirujano dentista supervisor y no admite cambios.');

        $guardar($docente, ['anamnesis' => ['motivoConsulta' => 'Corregido por docente']])->assertOk();
        $this->assertSame('Corregido por docente', $motivo());
    }
}
