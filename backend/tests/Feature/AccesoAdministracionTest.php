<?php

namespace Tests\Feature;

use App\Servicios\ServicioAccesos;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\TestCase;

class AccesoAdministracionTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    public function test_sin_sesion_el_modulo_de_administracion_responde_401(): void
    {
        $this->getJson('/api/admin/resumen')->assertUnauthorized();
    }

    public function test_un_docente_no_alcanza_el_modulo_de_administracion(): void
    {
        $usuario = $this->crearUsuario('docente.admin', self::CLAVE, 'DOCENTE');

        $this->actingAs($usuario, 'web')
            ->getJson('/api/admin/resumen')
            ->assertForbidden();
    }

    public function test_un_alumno_no_alcanza_el_modulo_de_administracion(): void
    {
        $usuario = $this->crearUsuario('alumno.admin', self::CLAVE, 'ALUMNO_OPERADOR');

        $this->actingAs($usuario, 'web')
            ->getJson('/api/admin/resumen')
            ->assertForbidden();
    }

    public function test_un_usuario_sin_roles_no_alcanza_el_modulo_de_administracion(): void
    {
        $usuario = $this->crearUsuario('sinrol.admin', self::CLAVE);

        $this->actingAs($usuario, 'web')
            ->getJson('/api/admin/resumen')
            ->assertForbidden();
    }

    public function test_el_administrador_alcanza_el_modulo_de_administracion(): void
    {
        $usuario = $this->crearUsuario('admin.acceso', self::CLAVE, 'ADMINISTRADOR');

        $this->actingAs($usuario, 'web')
            ->getJson('/api/admin/resumen')
            ->assertOk()
            ->assertJsonStructure(['usuarios', 'usuarios_activos', 'roles', 'accesos_fallidos_recientes']);
    }

    public function test_un_rol_revocado_deja_de_dar_acceso(): void
    {
        $usuario = $this->crearUsuario('revocado.admin', self::CLAVE, 'ADMINISTRADOR');

        $this->actingAs($usuario, 'web')->getJson('/api/admin/resumen')->assertOk();

        DB::table('usuario_rol')->where('id_usuario', $usuario->getKey())->update(['permitido' => 0]);
        app(ServicioAccesos::class)->olvidarMemoria($usuario);

        $this->actingAs($usuario, 'web')->getJson('/api/admin/resumen')->assertForbidden();
    }

    public function test_un_rol_vencido_deja_de_dar_acceso(): void
    {
        $usuario = $this->crearUsuario('vencido.admin', self::CLAVE, 'ADMINISTRADOR');

        DB::table('usuario_rol')->where('id_usuario', $usuario->getKey())->update([
            'fecha_fin' => now()->subDay()->toDateString(),
        ]);
        app(ServicioAccesos::class)->olvidarMemoria($usuario);

        $this->actingAs($usuario, 'web')->getJson('/api/admin/resumen')->assertForbidden();
    }

    public function test_desactivar_la_cuenta_corta_la_sesion_en_curso(): void
    {
        $usuario = $this->crearUsuario('cortada.admin', self::CLAVE, 'ADMINISTRADOR');

        $this->actingAs($usuario, 'web')->getJson('/api/admin/resumen')->assertOk();

        $usuario->forceFill(['estado' => false])->save();

        $this->actingAs($usuario, 'web')
            ->getJson('/api/admin/resumen')
            ->assertUnauthorized();
    }

    public function test_bloquear_la_cuenta_corta_la_sesion_en_curso(): void
    {
        $usuario = $this->crearUsuario('bloqueada.admin', self::CLAVE, 'ADMINISTRADOR');

        $usuario->forceFill(['bloqueado_hasta' => now()->addMinutes(10)])->save();

        $this->actingAs($usuario, 'web')
            ->getJson('/api/auth/yo')
            ->assertUnauthorized();
    }

    public function test_el_administrador_resuelve_permisos_efectivos_desde_la_vista(): void
    {
        $usuario = $this->crearUsuario('permisos.admin', self::CLAVE, 'ADMINISTRADOR');
        $accesos = app(ServicioAccesos::class);

        // El dump asigna todos los permisos al rol ADMINISTRADOR.
        $this->assertTrue($accesos->puede($usuario, 'AUDITORIA.VER'));
        $this->assertFalse($accesos->puede($usuario, 'PERMISO.QUE.NO.EXISTE'));
    }

    public function test_un_permiso_denegado_al_usuario_gana_sobre_el_del_rol(): void
    {
        $usuario = $this->crearUsuario('denegado.admin', self::CLAVE, 'ADMINISTRADOR');
        $accesos = app(ServicioAccesos::class);

        $this->assertTrue($accesos->puede($usuario, 'AUDITORIA.VER'));

        DB::table('usuario_permiso')->insert([
            'id_usuario' => $usuario->getKey(),
            'id_permiso' => DB::table('permiso')->where('codigo_permiso', 'AUDITORIA.VER')->value('id_permiso'),
            'permitido' => 0,
            'alcance_datos' => 'GLOBAL',
        ]);

        $this->assertFalse($accesos->puede($usuario, 'AUDITORIA.VER'));
    }
}
