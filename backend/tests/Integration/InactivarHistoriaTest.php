<?php

namespace Tests\Integration;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\TestCase;

class InactivarHistoriaTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    public function test_la_eliminacion_clinica_deja_la_historia_inactiva_y_oculta(): void
    {
        $admin = $this->crearUsuario('admin.inactivar', self::CLAVE, 'ADMINISTRADOR');
        $alumno = $this->crearUsuario('alumno.inactivar', self::CLAVE, 'ALUMNO');
        $docente = $this->crearUsuario('docente.inactivar', self::CLAVE, 'DOCENTE');

        $historia = $this->actingAs($alumno, 'web')->postJson('/api/historias', [
            'dni' => '70000991',
            'nombres' => 'Paciente Inactivar',
            'sexo' => 'F',
        ])->assertCreated();
        $id = (int) $historia->json('id');
        DB::table('configuracion_sistema')->where('clave', 'ELIMINACION_CLINICA_PERMITIDA')->update(['valor' => '0']);

        $this->actingAs($admin, 'web')->deleteJson("/api/historias/{$id}")->assertUnprocessable();
        $this->assertNull(DB::table('historia_clinica')->where('id_historia_clinica', $id)->value('anulado_en'));

        DB::table('configuracion_sistema')->where('clave', 'ELIMINACION_CLINICA_PERMITIDA')->update(['valor' => '1']);

        $this->actingAs($docente, 'web')->deleteJson("/api/historias/{$id}")->assertForbidden();
        $this->actingAs($admin, 'web')->deleteJson("/api/historias/{$id}")->assertOk()->assertJsonPath('estado', 'inactiva');

        $fila = DB::table('historia_clinica')->where('id_historia_clinica', $id)->first();
        $this->assertNotNull($fila);
        $this->assertNotNull($fila->anulado_en);
        $this->assertSame('Inactiva', $fila->motivo_anulacion);

        $this->actingAs($admin, 'web')->getJson('/api/historias?q=70000991')->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($admin, 'web')->getJson("/api/historias/{$id}")->assertNotFound();
        $this->actingAs($admin, 'web')->getJson("/api/historias/{$id}/expediente")->assertNotFound();
        $this->actingAs($alumno, 'web')->getJson("/api/historias/{$id}")->assertNotFound();
    }
}
