<?php

namespace Tests\Integration;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\TestCase;

class SeguimientosCrudTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    private function historia(object $usuario, string $dni, string $nombre = 'Paciente Control'): int
    {
        return (int) $this->actingAs($usuario, 'web')->postJson('/api/historias', [
            'dni' => $dni,
            'nombres' => $nombre,
            'sexo' => 'F',
        ])->assertCreated()->json('id');
    }

    public function test_crea_y_actualiza_control_de_seguimiento(): void
    {
        $alumno = $this->crearUsuario('alumno.control', self::CLAVE, 'ALUMNO');
        $id = $this->historia($alumno, '70000501', 'Ana Control Prueba');
        $fecha = now()->addDays(3)->toDateString();

        $creado = $this->actingAs($alumno, 'web')->postJson("/api/historias/{$id}/seguimientos", [
            'fecha' => $fecha,
            'hora' => '10:15',
            'detalle' => 'Control postoperatorio',
            'estado' => 'PROGRAMADO',
        ])->assertCreated()->json();

        $this->assertStringStartsWith('control-', $creado['id']);
        $this->assertSame($fecha, $creado['fecha']);
        $this->assertSame('10:15', $creado['hora']);
        $this->assertSame('Programado', $creado['estado']);
        $this->assertSame('PROGRAMADO', $creado['codigoEstado']);

        $idNumerico = (int) str_replace('control-', '', $creado['id']);
        $this->actingAs($alumno, 'web')->patchJson("/api/seguimientos/{$idNumerico}", [
            'estado' => 'REALIZADO',
            'detalle' => 'Control realizado sin novedad',
        ])->assertOk()
            ->assertJsonPath('estado', 'Realizado')
            ->assertJsonPath('codigoEstado', 'REALIZADO');

        $this->actingAs($alumno, 'web')->getJson('/api/seguimientos?q=Ana')
            ->assertOk()
            ->assertJsonFragment(['codigoEstado' => 'REALIZADO', 'historiaId' => $id]);
    }

    public function test_alumno_ajeno_no_crea_ni_edita_seguimiento(): void
    {
        $alumno = $this->crearUsuario('alumno.dueño', self::CLAVE, 'ALUMNO');
        $ajeno = $this->crearUsuario('alumno.ajeno', self::CLAVE, 'ALUMNO');
        $id = $this->historia($alumno, '70000502');

        $creado = $this->actingAs($alumno, 'web')->postJson("/api/historias/{$id}/seguimientos", [
            'fecha' => now()->addDay()->toDateString(),
            'detalle' => 'Control',
        ])->assertCreated()->json();
        $idNumerico = (int) str_replace('control-', '', $creado['id']);

        $this->actingAs($ajeno, 'web')->postJson("/api/historias/{$id}/seguimientos", [
            'fecha' => now()->addDays(2)->toDateString(),
        ])->assertNotFound();

        $this->actingAs($ajeno, 'web')->patchJson("/api/seguimientos/{$idNumerico}", [
            'estado' => 'CANCELADO',
        ])->assertNotFound();
    }

    public function test_actualiza_programacion_de_cirugia(): void
    {
        $alumno = $this->crearUsuario('alumno.prog', self::CLAVE, 'ALUMNO');
        $id = $this->historia($alumno, '70000503', 'Rosa Cirugia');
        $manana = now()->addDay()->toDateString();

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['consentimiento' => [
                'procedimiento' => 'Exodoncia',
                'programacionFecha' => $manana,
                'programacionHora' => '08:00',
            ]],
        ])->assertOk();

        $idProg = (int) DB::table('programacion_cirugia as pc')
            ->join('plan_quirurgico as pq', 'pq.id_plan_quirurgico', '=', 'pc.id_plan_quirurgico')
            ->where('pq.id_historia_clinica', $id)
            ->value('pc.id_programacion_cirugia');

        $this->actingAs($alumno, 'web')->patchJson("/api/programaciones/{$idProg}", [
            'estado' => 'CANCELADA',
            'hora' => '09:30',
        ])->assertOk()
            ->assertJsonPath('codigoEstado', 'CANCELADA')
            ->assertJsonPath('hora', '09:30');
    }
}
