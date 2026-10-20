<?php

namespace Tests\Usability;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\CreaUsuarios;
use Tests\Soporte\AbreHistoria;
use Tests\TestCase;

class MensajesYContratoJsonTest extends TestCase
{
    use AbreHistoria, CreaUsuarios, DatabaseTransactions;

    public function test_los_errores_de_acceso_van_en_espanol_y_no_enumeran_cuentas(): void
    {
        $this->getJson('/api/auth/yo')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Sesion no iniciada.');

        $inexistente = $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'nadie.existe',
            'contrasena' => self::CLAVE_PRUEBA,
        ])->assertStatus(422);

        $this->crearUsuario('usa.login.alumno', self::CLAVE_PRUEBA, 'ALUMNO');
        $claveMala = $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'usa.login.alumno',
            'contrasena' => 'otra',
        ])->assertStatus(422);

        $this->assertSame(
            $inexistente->json('errors.nombre_usuario.0'),
            $claveMala->json('errors.nombre_usuario.0'),
        );
        $this->assertSame('Las credenciales no son validas.', $claveMala->json('errors.nombre_usuario.0'));
    }

    public function test_listados_vacios_conservan_forma_estable_para_la_interfaz(): void
    {
        $alumno = $this->crearUsuario('usa.listas.alumno', self::CLAVE_PRUEBA, 'ALUMNO');

        $this->actingAs($alumno, 'web')->getJson('/api/historias?q=ZZZ-NO-EXISTE')
            ->assertOk()
            ->assertJsonPath('data', []);

        $this->actingAs($alumno, 'web')->getJson('/api/pacientes?q=00000000')
            ->assertOk()
            ->assertJsonPath('data', []);

        $notificaciones = $this->actingAs($alumno, 'web')->getJson('/api/notificaciones')->assertOk();
        $this->assertIsArray($notificaciones->json('data'));
    }

    public function test_las_fechas_academicas_piden_formato_institucional(): void
    {
        $docente = $this->crearUsuario('usa.fechas.docente', self::CLAVE_PRUEBA, 'DOCENTE');

        $this->actingAs($docente, 'web')->postJson('/api/academico/periodos', [
            'codigo' => 'USA-FECHA',
            'nombre' => 'Periodo',
            'fechaInicio' => 'marzo-2026',
            'fechaFin' => 'julio-2026',
        ])->assertUnprocessable()->assertJsonFragment(['Use el formato día/mes/año.']);
    }
}
