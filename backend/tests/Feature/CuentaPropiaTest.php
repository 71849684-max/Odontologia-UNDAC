<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\CreaUsuarios;
use Tests\TestCase;

class CuentaPropiaTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    public function test_el_usuario_lee_y_actualiza_su_perfil(): void
    {
        $alumno = $this->crearUsuario('alumno.perfil', self::CLAVE, 'ALUMNO');

        $this->actingAs($alumno, 'web')
            ->getJson('/api/perfil')
            ->assertOk()
            ->assertJsonPath('nombre_usuario', 'alumno.perfil')
            ->assertJsonMissingPath('contrasena_hash');

        $this->actingAs($alumno, 'web')
            ->putJson('/api/perfil', [
                'nombres' => 'LucÃ­a',
                'apellidos' => 'Quispe Rojas',
                'correo' => 'lucia@undac.edu.pe',
                'telefono' => '+51 987 654 321',
            ])
            ->assertOk()
            ->assertJsonPath('nombres', 'LucÃ­a')
            ->assertJsonPath('telefono', '+51 987 654 321');

        $this->assertTrue(DB::table('auditoria')->where('accion', 'ACTUALIZAR_PERFIL')->exists());

        $this->actingAs($alumno, 'web')
            ->putJson('/api/perfil', ['nombres' => '', 'apellidos' => 'X', 'correo' => 'no-es-correo', 'telefono' => '<b>'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nombres', 'correo', 'telefono']);
    }

    public function test_el_usuario_cambia_su_contrasena_verificando_la_actual(): void
    {
        $docente = $this->crearUsuario('docente.clave', self::CLAVE, 'DOCENTE');

        $this->actingAs($docente, 'web')
            ->putJson('/api/auth/clave', [
                'contrasena_actual' => 'incorrecta',
                'contrasena' => 'NuevaClave2026',
                'contrasena_confirmation' => 'NuevaClave2026',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['contrasena_actual']);

        $this->actingAs($docente, 'web')
            ->putJson('/api/auth/clave', [
                'contrasena_actual' => self::CLAVE,
                'contrasena' => 'solotexto',
                'contrasena_confirmation' => 'solotexto',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['contrasena']);

        $this->actingAs($docente, 'web')
            ->putJson('/api/auth/clave', [
                'contrasena_actual' => self::CLAVE,
                'contrasena' => 'NuevaClave2026',
                'contrasena_confirmation' => 'NuevaClave2026',
            ])
            ->assertNoContent();

        $hash = DB::table('usuario_docente')->where('id_usuario_docente', $docente->id())->value('contrasena_hash');
        $this->assertTrue(Hash::check('NuevaClave2026', (string) $hash));
        $this->assertTrue(DB::table('auditoria')->where('accion', 'CAMBIAR_CONTRASENA')->exists());
    }

    public function test_el_administrador_restablece_la_contrasena_de_otro_usuario(): void
    {
        $admin = $this->crearUsuario('admin.reset', self::CLAVE, 'ADMINISTRADOR');
        $alumno = $this->crearUsuario('alumno.reset', self::CLAVE, 'ALUMNO');
        DB::table('usuario_alumno')->where('id_usuario_alumno', $alumno->id())->update([
            'intentos_fallidos' => 5,
            'bloqueado_hasta' => now()->addHour(),
        ]);

        $this->actingAs($alumno, 'web')
            ->patchJson('/api/admin/usuarios/'.$alumno->clave().'/clave', ['contrasena' => 'Temporal2026'])
            ->assertForbidden();

        $this->actingAs($admin, 'web')
            ->patchJson('/api/admin/usuarios/'.$alumno->clave().'/clave', ['contrasena' => 'Temporal2026'])
            ->assertOk();

        $fila = DB::table('usuario_alumno')->where('id_usuario_alumno', $alumno->id())->first();
        $this->assertTrue(Hash::check('Temporal2026', (string) $fila->contrasena_hash));
        $this->assertSame(0, (int) $fila->intentos_fallidos);
        $this->assertNull($fila->bloqueado_hasta);

        $this->actingAs($admin, 'web')
            ->patchJson('/api/admin/usuarios/'.$admin->clave().'/clave', ['contrasena' => 'Temporal2026'])
            ->assertStatus(422);
    }
}
