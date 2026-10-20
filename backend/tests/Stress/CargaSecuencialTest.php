<?php

namespace Tests\Stress;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\CreaUsuarios;
use Tests\Soporte\AbreHistoria;
use Tests\TestCase;

class CargaSecuencialTest extends TestCase
{
    use AbreHistoria, CreaUsuarios, DatabaseTransactions;

    public function test_autoguardados_repetidos_no_corrompen_el_expediente(): void
    {
        $alumno = $this->crearUsuario('str.auto.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $id = $this->abrirHistoria($alumno, '71000501');

        for ($i = 1; $i <= 12; $i++) {
            $this->guardarExpediente($alumno, $id, [
                'anamnesis' => [
                    'motivoConsulta' => "Control {$i}",
                    'historiaEnfermedad' => "Serie {$i}",
                ],
            ])->assertOk()->assertJsonPath('formData.anamnesis.motivoConsulta', "Control {$i}");
        }

        $this->actingAs($alumno, 'web')->getJson("/api/historias/{$id}/expediente")
            ->assertOk()
            ->assertJsonPath('formData.anamnesis.motivoConsulta', 'Control 12')
            ->assertJsonPath('formData.anamnesis.historiaEnfermedad', 'Serie 12');
    }

    public function test_un_pico_de_logins_fallidos_no_tumba_la_api(): void
    {
        config(['acceso.intentos_por_minuto' => 100, 'acceso.fallos_antes_de_bloqueo' => 99]);
        $this->crearUsuario('str.login.alumno', self::CLAVE_PRUEBA, 'ALUMNO');

        $codigos = [];
        for ($i = 0; $i < 15; $i++) {
            $codigos[] = $this->postJson('/api/auth/login', [
                'nombre_usuario' => 'str.login.alumno',
                'contrasena' => 'clave-incorrecta',
            ])->status();
        }

        $this->assertNotContains(500, $codigos);
        foreach ($codigos as $codigo) {
            $this->assertContains($codigo, [422, 423, 429]);
        }
    }
}
