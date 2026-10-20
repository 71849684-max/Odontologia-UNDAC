<?php

namespace Tests\Performance;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\CreaUsuarios;
use Tests\Soporte\AbreHistoria;
use Tests\TestCase;

class UmbralesRespuestaTest extends TestCase
{
    use AbreHistoria, CreaUsuarios, DatabaseTransactions;

    private const LIMITE_MS = 5000;

    public function test_listar_expediente_y_autoguardado_responden_dentro_del_umbral_local(): void
    {
        $alumno = $this->crearUsuario('per.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $id = $this->abrirHistoria($alumno, '71000401');
        $this->guardarExpediente($alumno, $id, [
            'anamnesis' => ['motivoConsulta' => 'Rendimiento', 'historiaEnfermedad' => 'Baseline'],
        ])->assertOk();

        $this->assertRespuestaRapida(fn () => $this->actingAs($alumno, 'web')->getJson('/api/historias')->assertOk());
        $this->assertRespuestaRapida(fn () => $this->actingAs($alumno, 'web')->getJson("/api/historias/{$id}/expediente")->assertOk());
        $this->assertRespuestaRapida(fn () => $this->guardarExpediente($alumno, $id, [
            'anamnesis' => ['motivoConsulta' => 'Autoguardado', 'historiaEnfermedad' => 'Baseline'],
        ])->assertOk());
    }

    private function assertRespuestaRapida(callable $accion): void
    {
        $inicio = hrtime(true);
        $accion();
        $ms = (hrtime(true) - $inicio) / 1e6;
        $this->assertLessThan(
            self::LIMITE_MS,
            $ms,
            'La operación superó '.self::LIMITE_MS.' ms ('.$ms.').',
        );
    }
}
