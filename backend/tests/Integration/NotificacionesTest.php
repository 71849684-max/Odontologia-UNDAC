<?php

namespace Tests\Integration;

use App\Clinica\Notificaciones\ServicioNotificaciones;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\TestCase;

class NotificacionesTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    private function historia(object $usuario, string $dni): int
    {
        return (int) $this->actingAs($usuario, 'web')->postJson('/api/historias', [
            'dni' => $dni,
            'nombres' => 'Paciente Notificacion',
            'sexo' => 'M',
        ])->assertCreated()->json('id');
    }

    private function asignarDocente(int $idHistoria, object $docente): void
    {
        DB::table('historia_docente')->insert([
            'id_historia_clinica' => $idHistoria,
            'id_docente' => $docente->idActor(),
            'tipo_participacion' => 'ENCARGADO',
            'fecha_asignacion' => now()->toDateString(),
            'estado' => 1,
            'asignado_por_tipo' => 'DOCENTE',
            'asignado_por_id' => $docente->id(),
            'creado_en' => now(),
        ]);
    }

    public function test_enviar_seccion_a_revision_notifica_al_docente_asignado(): void
    {
        $alumno = $this->crearUsuario('alumno.notif', self::CLAVE, 'ALUMNO');
        $docente = $this->crearUsuario('docente.notif', self::CLAVE, 'DOCENTE');
        $id = $this->historia($alumno, '70000401');
        $this->asignarDocente($id, $docente);

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['anamnesis' => ['motivoConsulta' => 'Dolor']],
            'sectionStatus' => ['anamnesis' => 'review'],
        ])->assertOk()
            ->assertJsonPath('revisionNotificada', true)
            ->assertJsonPath('seccionesEnviadas.0', 'anamnesis');

        $this->assertDatabaseHas('notificacion', [
            'tipo_destinatario' => 'DOCENTE',
            'id_destinatario' => $docente->idActor(),
            'tipo' => 'SECCION_REVISION',
            'id_historia_clinica' => $id,
            'codigo_seccion' => 'anamnesis',
            'leida' => 0,
        ]);

        $listaDocente = $this->actingAs($docente, 'web')->getJson('/api/notificaciones')
            ->assertOk()
            ->json('data');
        $this->assertNotEmpty($listaDocente);
        $this->assertSame($id, $listaDocente[0]['historiaId']);
        $this->assertSame('anamnesis', $listaDocente[0]['seccion']);

        $this->actingAs($alumno, 'web')->getJson('/api/notificaciones')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $idNotif = $listaDocente[0]['id'];
        $this->actingAs($docente, 'web')->patchJson("/api/notificaciones/{$idNotif}/leida")
            ->assertOk()
            ->assertJsonPath('leida', true);

        $this->assertDatabaseHas('notificacion', ['id_notificacion' => $idNotif, 'leida' => 1]);

        $this->actingAs($docente, 'web')->getJson('/api/historias?q=70000401')
            ->assertOk()
            ->assertJsonPath('data.0.seccionesRevision.0', 'anamnesis');
    }

    public function test_sin_docente_asignado_guarda_revision_sin_notificacion(): void
    {
        $alumno = $this->crearUsuario('alumno.sin.doc', self::CLAVE, 'ALUMNO');
        $id = $this->historia($alumno, '70000402');

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['diagnostico' => ['observaciones' => 'Control']],
            'sectionStatus' => ['diagnostico' => 'review'],
        ])->assertOk()
            ->assertJsonPath('revisionNotificada', false)
            ->assertJsonPath('notificacionesCreadas', 0)
            ->assertJsonPath('seccionesEnviadas.0', 'diagnostico');

        $this->assertSame(0, DB::table('notificacion')->where('id_historia_clinica', $id)->count());
        $this->assertDatabaseHas('auditoria', [
            'accion' => 'REVISAR_SECCION',
            'id_registro' => (string) $id,
        ]);
    }

    public function test_notifica_asignacion_observacion_y_validacion_solo_a_sus_destinatarios(): void
    {
        $alumno = $this->crearUsuario('asistente.avisos', self::CLAVE, 'ALUMNO');
        $docente = $this->crearUsuario('profesional.avisos', self::CLAVE, 'DOCENTE');
        $ajeno = $this->crearUsuario('asistente.sin.avisos', self::CLAVE, 'ALUMNO');
        $id = $this->historia($alumno, '70000409');
        foreach ([1, 2] as $intento) {
            $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/asignacion", ['personal' => 'DOCENTE-'.$docente->idActor()])->assertOk();
        }
        $this->assertSame(1, DB::table('notificacion')->where('id_historia_clinica', $id)->where('tipo', 'HISTORIA_ASIGNADA')->count());
        $this->actingAs($alumno, 'web')->patchJson("/api/historias/{$id}/estado", ['codigo' => 'PENDIENTE_REVISION'])->assertOk();
        $this->actingAs($docente, 'web')->patchJson("/api/historias/{$id}/estado", ['codigo' => 'OBSERVADA', 'observacion' => 'Corregir antecedentes'])->assertOk();
        $this->actingAs($docente, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['anamnesis' => ['motivoConsulta' => 'Control']], 'sectionStatus' => ['anamnesis' => 'approved'],
        ])->assertOk();
        $avisos = $this->actingAs($alumno, 'web')->getJson('/api/notificaciones')->assertOk()->json('data');
        $this->assertContains('Historia clínica con observaciones', array_column($avisos, 'titulo'));
        $this->assertContains('Sección clínica validada', array_column($avisos, 'titulo'));
        $this->actingAs($ajeno, 'web')->getJson('/api/notificaciones')->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($ajeno, 'web')->patchJson('/api/notificaciones/'.$avisos[0]['id'].'/leida')->assertNotFound();
    }

    public function test_agrupa_avisos_repetidos_sin_reactivar_lectura_y_conserva_eventos_distintos(): void
    {
        $alumno = $this->crearUsuario('asistente.antispam', self::CLAVE, 'ALUMNO');
        $id = $this->historia($alumno, '70000419');
        $servicio = app(ServicioNotificaciones::class);
        $destinos = [['tipo_destinatario' => 'ALUMNO', 'id_destinatario' => $alumno->idActor()]];
        $this->assertSame(1, $servicio->crear($destinos, 'ESTADO_HISTORIA', 'Historia observada', 'Primer aviso', $id));
        $aviso = $servicio->listar($alumno)[0];
        $servicio->marcarLeida($alumno, $aviso['id']);
        $this->assertSame(0, $servicio->crear($destinos, 'ESTADO_HISTORIA', 'Historia observada', 'Último aviso', $id));
        $this->assertDatabaseHas('notificacion', ['id_notificacion' => $aviso['id'], 'leida' => 1, 'mensaje' => 'Último aviso']);
        $this->assertSame(1, $servicio->crear($destinos, 'ESTADO_HISTORIA', 'Historia validada', 'Validación', $id));
        $this->travel(11)->minutes();
        $this->assertSame(1, $servicio->crear($destinos, 'ESTADO_HISTORIA', 'Historia observada', 'Nueva observación', $id));
    }

    public function test_marcar_todas_las_notificaciones_como_leidas(): void
    {
        $alumno = $this->crearUsuario('alumno.notif2', self::CLAVE, 'ALUMNO');
        $docente = $this->crearUsuario('docente.notif2', self::CLAVE, 'DOCENTE');
        $id = $this->historia($alumno, '70000403');
        $this->asignarDocente($id, $docente);

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['anamnesis' => ['motivoConsulta' => 'A']],
            'sectionStatus' => ['anamnesis' => 'review', 'examen-clinico' => 'review'],
        ])->assertOk()->assertJsonPath('revisionNotificada', true);

        $this->actingAs($docente, 'web')->postJson('/api/notificaciones/leer-todas')
            ->assertOk();

        $this->assertSame(0, DB::table('notificacion')
            ->where('tipo_destinatario', 'DOCENTE')
            ->where('id_destinatario', $docente->idActor())
            ->where('leida', 0)
            ->count());
    }
}
