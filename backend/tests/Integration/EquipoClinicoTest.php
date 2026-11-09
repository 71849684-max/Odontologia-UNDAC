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

    public function test_el_asistente_asigna_profesional_sin_cambiar_operador_y_no_accede_a_historias_ajenas(): void
    {
        $alumno = $this->crearUsuario('asistente.asignacion', self::CLAVE, 'ALUMNO');
        $otro = $this->crearUsuario('asistente.ajeno', self::CLAVE, 'ALUMNO');
        $docente = $this->crearUsuario('profesional.asignacion', self::CLAVE, 'DOCENTE');
        $id = $this->historia($alumno, '70000309');

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/asignacion", [
            'personal' => 'DOCENTE-'.$docente->idActor(),
        ])->assertOk();
        $this->assertDatabaseHas('historia_docente', [
            'id_historia_clinica' => $id, 'id_docente' => $docente->idActor(),
            'tipo_participacion' => 'ENCARGADO', 'estado' => 1,
        ]);
        $this->assertDatabaseHas('historia_alumno', [
            'id_historia_clinica' => $id, 'id_alumno' => $alumno->idActor(), 'estado' => 1,
        ]);
        $this->actingAs($alumno, 'web')->getJson("/api/historias/{$id}")
            ->assertOk()->assertJsonPath('docente', $docente->nombreCompleto());
        $this->actingAs($docente, 'web')->putJson("/api/historias/{$id}/asignacion", [
            'personal' => 'DOCENTE-'.$docente->idActor(),
        ])->assertUnprocessable()->assertJsonValidationErrors('personal');
        $this->actingAs($otro, 'web')->putJson("/api/historias/{$id}/asignacion", [
            'personal' => 'DOCENTE-'.$docente->idActor(),
        ])->assertNotFound();
    }

    public function test_audita_edicion_y_completado_con_codigo_de_historia(): void
    {
        $alumno = $this->crearUsuario('asistente.auditoria', self::CLAVE, 'ALUMNO');
        $admin = $this->crearUsuario('admin.auditoria.historia', self::CLAVE, 'ADMINISTRADOR');
        $id = $this->historia($alumno, '70000319');
        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['anamnesis' => ['motivoConsulta' => 'Control']],
            'sectionStatus' => ['anamnesis' => 'complete'],
        ])->assertOk();
        foreach (['CREAR', 'EDITAR', 'MARCAR_COMPLETADO'] as $accion) {
            $this->assertDatabaseHas('auditoria', ['accion' => $accion, 'id_registro' => (string) $id]);
        }
        $codigo = DB::table('historia_clinica')->where('id_historia_clinica', $id)->value('numero_historia');
        $respuesta = $this->actingAs($admin, 'web')->getJson('/api/admin/auditoria?origen=acciones&q='.urlencode($codigo))->assertOk();
        $eventos = collect($respuesta->json('data'))->where('registro', (string) $id);
        $this->assertNotEmpty($eventos);
        foreach ($eventos as $evento) {
            $this->assertSame($codigo, $evento['historia']);
        }
    }

    public function test_el_administrador_puede_seleccionar_y_cambiar_al_asistente_responsable(): void
    {
        $admin = $this->crearUsuario('admin.equipo.asistente', self::CLAVE, 'ADMINISTRADOR');
        $primero = $this->crearUsuario('asistente.primero', self::CLAVE, 'ALUMNO');
        $segundo = $this->crearUsuario('asistente.segundo', self::CLAVE, 'ALUMNO');
        $id = $this->historia($admin, '70000329');
        foreach ([$primero, $segundo] as $asistente) {
            $this->actingAs($admin, 'web')->putJson("/api/historias/{$id}/asignacion", [
                'personal' => 'ALUMNO-'.$asistente->idActor(),
            ])->assertOk()->assertJsonPath('operador', $asistente->nombreCompleto());
        }
        $cambio = DB::table('auditoria')->where('id_registro', (string) $id)->where('accion', 'ASIGNAR_PERSONAL')->orderByDesc('id_auditoria')->first();
        $this->assertSame(['asistente_responsable' => $primero->nombreCompleto()], json_decode($cambio->valores_anteriores, true));
        $this->assertSame(['asistente_responsable' => $segundo->nombreCompleto()], json_decode($cambio->valores_nuevos, true));
        $this->assertDatabaseHas('historia_alumno', [
            'id_historia_clinica' => $id, 'id_alumno' => $primero->idActor(), 'estado' => 0,
        ]);
        $this->assertDatabaseHas('historia_alumno', [
            'id_historia_clinica' => $id, 'id_alumno' => $segundo->idActor(), 'estado' => 1,
        ]);
        $this->actingAs($primero, 'web')->getJson("/api/historias/{$id}")->assertNotFound();
        $this->actingAs($primero, 'web')->getJson("/api/historias/{$id}/expediente")->assertNotFound();
        $this->actingAs($primero, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['anamnesis' => ['motivoConsulta' => 'Cambio sin autorización']],
        ])->assertNotFound();
        $this->actingAs($primero, 'web')->getJson("/api/historias/{$id}/odontograma")->assertNotFound();
        $this->actingAs($primero, 'web')->patchJson("/api/historias/{$id}/estado", ['codigo' => 'EN_PROCESO'])->assertNotFound();
        $avisosPrevios = $this->actingAs($primero, 'web')->getJson('/api/notificaciones')->assertOk()->json('data');
        foreach ($avisosPrevios as $avisoPrevio) {
            $this->assertNull($avisoPrevio['historiaId']);
        }
        $aviso = $this->actingAs($primero, 'web')->getJson('/api/notificaciones')->assertOk()->json('data.0');
        $this->assertSame('ASIGNACION_RETIRADA', $aviso['tipo']);
        $this->assertNull($aviso['historiaId']);
        $this->actingAs($admin, 'web')->putJson("/api/historias/{$id}/asignacion", [
            'personal' => 'ALUMNO-'.$segundo->idActor(),
        ])->assertOk();
        $this->assertSame(1, DB::table('notificacion')->where('id_historia_clinica', $id)->where('tipo', 'ASIGNACION_RETIRADA')->count());
        $this->assertDatabaseHas('notificacion', [
            'id_historia_clinica' => $id, 'tipo_destinatario' => 'ALUMNO',
            'id_destinatario' => $segundo->idActor(), 'tipo' => 'HISTORIA_ASIGNADA',
        ]);
        $this->actingAs($segundo, 'web')->getJson("/api/historias/{$id}")->assertOk();
        $filaAnterior = DB::table('historia_alumno')->where('id_historia_clinica', $id)->where('id_alumno', $primero->idActor())->first();
        foreach ([1, 2] as $intento) {
            $this->actingAs($admin, 'web')->putJson("/api/historias/{$id}/asignacion", [
                'personal' => 'ALUMNO-'.$primero->idActor(),
            ])->assertOk();
        }
        $this->assertDatabaseHas('historia_alumno', [
            'id_historia_alumno' => $filaAnterior->id_historia_alumno, 'estado' => 1,
            'fecha_fin' => null, 'creado_en' => $filaAnterior->creado_en,
        ]);
        $this->assertSame(2, DB::table('historia_alumno')->where('id_historia_clinica', $id)->count());
        $this->assertSame(1, DB::table('historia_alumno')->where('id_historia_clinica', $id)->where('estado', 1)->count());
        $this->assertSame(3, DB::table('auditoria')->where('id_registro', (string) $id)->where('accion', 'ASIGNAR_PERSONAL')->count());
        $this->assertSame(2, DB::table('notificacion')->where('id_historia_clinica', $id)->where('tipo', 'ASIGNACION_RETIRADA')->count());
        $this->actingAs($segundo, 'web')->getJson("/api/historias/{$id}")->assertNotFound();
        $this->actingAs($primero, 'web')->getJson("/api/historias/{$id}")->assertOk();
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
