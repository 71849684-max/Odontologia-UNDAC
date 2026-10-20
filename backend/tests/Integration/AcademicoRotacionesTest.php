<?php

namespace Tests\Integration;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\Soporte\AbreHistoria;
use Tests\TestCase;

class AcademicoRotacionesTest extends TestCase
{
    use AbreHistoria, CreaUsuarios, DatabaseTransactions;

    public function test_el_docente_arma_periodo_grupo_rotacion_y_asignaciones(): void
    {
        $docente = $this->crearUsuario('int.acad.docente', self::CLAVE_PRUEBA, 'DOCENTE');
        $alumno = $this->crearUsuario('int.acad.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $sufijo = (string) random_int(1000, 9999);

        $periodo = $this->actingAs($docente, 'web')->postJson('/api/academico/periodos', [
            'codigo' => "2026-T{$sufijo}",
            'nombre' => 'Periodo de prueba',
            'fechaInicio' => '01/03/2026',
            'fechaFin' => '31/07/2026',
        ])->assertCreated()->json();

        $curso = $this->actingAs($docente, 'web')->postJson('/api/academico/cursos', [
            'codigo' => "cir-{$sufijo}",
            'nombre' => 'Cirugía bucal',
        ])->assertCreated()->json();

        $grupo = $this->actingAs($docente, 'web')->postJson('/api/academico/grupos', [
            'codigo' => "G{$sufijo}",
            'nombre' => 'Grupo clínico',
            'semestre' => 'X',
        ])->assertCreated()->json();

        $membresias = $this->actingAs($docente, 'web')->postJson("/api/academico/grupos/{$grupo['id']}/miembros", [
            'membresias' => [[
                'personaId' => 'alumno-'.$alumno->idActor(),
                'fechaInicio' => '01/03/2026',
            ]],
        ])->assertCreated()->json();
        $this->assertSame('alumno-'.$alumno->idActor(), $membresias[0]['personaId']);

        $rotacion = $this->actingAs($docente, 'web')->postJson('/api/academico/rotaciones', [
            'grupoId' => $grupo['id'],
            'cursoId' => $curso['id'],
            'periodoId' => $periodo['id'],
            'fechaInicio' => '01/04/2026',
            'fechaFin' => '30/04/2026',
        ])->assertCreated()->json();

        $this->actingAs($docente, 'web')->postJson("/api/academico/rotaciones/{$rotacion['id']}/docentes", [
            'docentes' => [[
                'personaId' => 'docente-'.$docente->idActor(),
                'funcion' => 'responsable',
            ]],
        ])->assertCreated()->assertJsonPath('0.funcion', 'responsable');

        $this->actingAs($docente, 'web')->postJson("/api/academico/rotaciones/{$rotacion['id']}/alumnos", [
            'personas' => [['personaId' => 'alumno-'.$alumno->idActor()]],
        ])->assertCreated();

        $this->actingAs($docente, 'web')->patchJson('/api/academico/miembros/'.$membresias[0]['id'], [
            'fechaFin' => '31/07/2026',
        ])->assertOk()->assertJsonPath('estado', 'finalizada');

        $estado = $this->actingAs($docente, 'web')->getJson('/api/academico')->assertOk()->json();
        $this->assertNotEmpty($estado['rotaciones']);
        $this->assertTrue(DB::table('rotacion_alumno')->where('id_rotacion', $rotacion['id'])->exists());
    }

    public function test_rechaza_fechas_invertidas_y_el_alumno_no_administra(): void
    {
        $docente = $this->crearUsuario('int.acad.fechas', self::CLAVE_PRUEBA, 'DOCENTE');
        $alumno = $this->crearUsuario('int.acad.bloqueado', self::CLAVE_PRUEBA, 'ALUMNO');

        $this->actingAs($docente, 'web')->postJson('/api/academico/periodos', [
            'codigo' => '2026-INV',
            'nombre' => 'Invertido',
            'fechaInicio' => '31/07/2026',
            'fechaFin' => '01/03/2026',
        ])->assertUnprocessable();

        $this->actingAs($alumno, 'web')->getJson('/api/academico')->assertForbidden();
        $this->actingAs($alumno, 'web')->postJson('/api/academico/grupos', [
            'codigo' => 'GX',
            'nombre' => 'No',
            'semestre' => 'I',
        ])->assertForbidden();
    }
}
