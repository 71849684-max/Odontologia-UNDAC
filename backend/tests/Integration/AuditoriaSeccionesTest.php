<?php

namespace Tests\Integration;

use App\Identidad\Dominio\Contratos\RepositorioAuditoria;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\TestCase;

class AuditoriaSeccionesTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    public function test_identifica_aprobador_reapertura_y_cada_seccion_sin_duplicar_autoguardados(): void
    {
        $alumno = $this->crearUsuario('asistente.auditoria.secciones', 'ClaveDePrueba123*');
        $profesional = $this->crearUsuario('profesional.aprobador', 'ClaveDePrueba123*', 'DOCENTE');
        $administrador = $this->crearUsuario('administrador.reapertura', 'ClaveDePrueba123*', 'ADMINISTRADOR');
        $id = $this->actingAs($alumno, 'web')->postJson('/api/historias', ['dni' => '91919101', 'nombres' => 'Paciente Sintético'])->assertCreated()->json('id');
        $this->asignarProfesionalPrueba($profesional, $id);
        $formulario = ['anamnesis' => ['motivoConsulta' => 'Control sintético']];
        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", ['formData' => $formulario, 'sectionStatus' => ['anamnesis' => 'review', 'datos-paciente' => 'review']])->assertOk();
        foreach ([1, 2] as $intento) {
            $this->actingAs($profesional, 'web')->putJson("/api/historias/{$id}/expediente", ['formData' => $formulario, 'sectionStatus' => ['anamnesis' => 'approved', 'datos-paciente' => 'approved']])->assertOk();
        }
        $aprobaciones = DB::table('auditoria')->where('id_registro', $id)->where('accion', 'APROBAR_SECCION')->get();
        $this->assertCount(2, $aprobaciones);
        foreach ($aprobaciones as $fila) {
            $this->assertSame($profesional->nombreUsuario(), $fila->nombre_usuario);
            $this->assertSame($profesional->id(), (int) $fila->id_usuario);
            $this->assertSame('DOCENTE', $fila->tipo_usuario);
            $antes = json_decode($fila->valores_anteriores, true);
            $despues = json_decode($fila->valores_nuevos, true);
            $this->assertCount(1, $despues);
            $this->assertSame(array_keys($antes), array_keys($despues));
            $this->assertSame(['review'], array_values($antes));
            $this->assertSame(['approved'], array_values($despues));
        }
        foreach ([1, 2] as $intento) {
            $this->actingAs($administrador, 'web')->putJson("/api/historias/{$id}/expediente", ['formData' => $formulario, 'sectionStatus' => ['anamnesis' => 'in-progress', 'datos-paciente' => 'approved'], 'motivo' => 'Rectificar el contenido de la entrevista'])->assertOk();
        }
        $reaperturas = DB::table('auditoria')->where('id_registro', $id)->where('accion', 'REABRIR_SECCION')->get();
        $this->assertCount(1, $reaperturas);
        $this->assertSame($administrador->nombreUsuario(), $reaperturas[0]->nombre_usuario);
        $this->assertSame(['anamnesis' => 'approved'], json_decode($reaperturas[0]->valores_anteriores, true));
        $this->assertSame(['anamnesis' => 'in-progress'], json_decode($reaperturas[0]->valores_nuevos, true));
        $lista = app(RepositorioAuditoria::class)->listar(['origen' => 'acciones', 'accion' => 'APROBAR_SECCION']);
        $eventos = array_values(array_filter($lista['data'], fn ($evento) => (int) $evento['historiaId'] === $id));
        $this->assertCount(2, $eventos);
        $this->assertSame($profesional->nombreUsuario(), $eventos[0]['usuario']);
    }

    public function test_presenta_y_filtra_aprobaciones_antiguas_sin_confundir_envios_a_revision(): void
    {
        $usuario = $this->crearUsuario('administrador.auditoria.antigua', 'ClaveDePrueba123*', 'ADMINISTRADOR');
        $id = $this->actingAs($usuario, 'web')->postJson('/api/historias', ['dni' => '91919102', 'nombres' => 'Paciente Sintético'])->assertCreated()->json('id');
        foreach (['approved', 'review'] as $estado) {
            DB::table('auditoria')->insert([
                'tabla_afectada' => 'historia_seccion_estado', 'id_registro' => $id, 'accion' => 'REVISAR_SECCION',
                'nombre_usuario' => 'profesional.historico', 'valores_nuevos' => json_encode(['odontograma' => $estado]), 'creado_en' => now(),
            ]);
        }
        $lista = app(RepositorioAuditoria::class)->listar(['origen' => 'acciones', 'accion' => 'APROBAR_SECCION']);
        $eventos = array_values(array_filter($lista['data'], fn ($evento) => (int) $evento['historiaId'] === $id));
        $this->assertCount(1, $eventos);
        $this->assertSame(['odontograma' => 'approved'], $eventos[0]['valores_nuevos']);
        $this->assertContains('APROBAR_SECCION', $lista['acciones']->all());
        $this->assertDatabaseHas('auditoria', ['id_registro' => $id, 'accion' => 'REVISAR_SECCION']);
    }
}
