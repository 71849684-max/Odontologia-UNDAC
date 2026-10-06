<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\CreaUsuarios;
use Tests\TestCase;

class AdministracionModuloTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    public function test_el_administrador_lista_usuarios_y_roles(): void
    {
        $admin = $this->crearUsuario('admin.lista', self::CLAVE, 'ADMINISTRADOR');
        $this->crearUsuario('docente.lista', self::CLAVE, 'DOCENTE');

        $this->actingAs($admin, 'web')
            ->getJson('/api/admin/usuarios')
            ->assertOk()
            ->assertJsonStructure(['data', 'indicadores' => ['total', 'activos', 'alumnos', 'docentes']]);

        $this->actingAs($admin, 'web')
            ->getJson('/api/admin/roles')
            ->assertOk()
            ->assertJsonFragment(['codigo' => 'ADMINISTRADOR']);
    }

    public function test_el_administrador_crea_y_actualiza_un_usuario(): void
    {
        $admin = $this->crearUsuario('admin.crud', self::CLAVE, 'ADMINISTRADOR');

        $creado = $this->actingAs($admin, 'web')->postJson('/api/admin/usuarios', [
            'nombre_usuario' => 'nuevo.alumno',
            'contrasena' => 'ClaveNueva123*',
            'codigo_rol' => 'ALUMNO',
            'tipo_documento' => 'DNI',
            'numero_documento' => '87654321',
            'nombres' => 'Ana',
            'apellidos' => 'Rojas',
            'correo' => 'ana.rojas@undac.edu.pe',
            'telefono' => '999111222',
            'estado' => true,
        ])->assertCreated()
            ->assertJsonPath('nombre_usuario', 'nuevo.alumno')
            ->assertJsonPath('codigo_rol', 'ALUMNO');

        $id = (string) $creado->json('id');

        $this->assertTrue(Hash::check('ClaveNueva123*', (string) DB::table('usuario_alumno')->where('nombre_usuario', 'nuevo.alumno')->value('contrasena_hash')));
        $this->assertDatabaseHas('auditoria', [
            'tabla_afectada' => 'usuario_alumno',
            'id_registro' => $id,
            'accion' => 'CREAR',
        ]);

        $this->actingAs($admin, 'web')->putJson("/api/admin/usuarios/{$id}", [
            'nombre_usuario' => 'nuevo.alumno',
            'codigo_rol' => 'ALUMNO',
            'tipo_documento' => 'DNI',
            'numero_documento' => '87654321',
            'nombres' => 'Ana Maria',
            'apellidos' => 'Rojas',
            'correo' => 'ana.rojas@undac.edu.pe',
            'telefono' => '999111222',
            'estado' => true,
        ])->assertOk()
            ->assertJsonPath('codigo_rol', 'ALUMNO')
            ->assertJsonPath('nombres', 'Ana Maria');
    }

    public function test_no_se_puede_desactivar_la_propia_cuenta(): void
    {
        $admin = $this->crearUsuario('admin.propia', self::CLAVE, 'ADMINISTRADOR');

        $this->actingAs($admin, 'web')
            ->patchJson('/api/admin/usuarios/'.$admin->getKey().'/estado', ['estado' => false])
            ->assertStatus(422);
    }

    public function test_el_administrador_ajusta_permisos_individuales(): void
    {
        $admin = $this->crearUsuario('admin.perms', self::CLAVE, 'ADMINISTRADOR');
        $docente = $this->crearUsuario('docente.perms', self::CLAVE, 'DOCENTE');

        $idBitacora = (int) DB::table('submodulo')->where('codigo_submodulo', 'BITACORA')->value('id_submodulo');

        $respuesta = $this->actingAs($admin, 'web')
            ->getJson('/api/admin/usuarios/'.$docente->getKey().'/permisos')
            ->assertOk();

        $efectivos = $respuesta->json('efectivos');
        $this->assertIsArray($efectivos);
        $this->assertNotContains($idBitacora, $efectivos);

        $nuevos = array_values(array_unique([...$efectivos, $idBitacora]));

        $this->actingAs($admin, 'web')
            ->putJson('/api/admin/usuarios/'.$docente->getKey().'/permisos', ['permisos' => $nuevos])
            ->assertOk()
            ->assertJsonFragment(['id' => $idBitacora]);

        $this->assertTrue(
            DB::table('rol_submodulo')
                ->where('id_rol', $docente->idRol())
                ->where('id_submodulo', $idBitacora)
                ->where('estado', 1)
                ->exists()
        );

        $this->actingAs($admin, 'web')
            ->deleteJson('/api/admin/usuarios/'.$docente->getKey().'/permisos')
            ->assertOk();

        $this->assertFalse(
            DB::table('rol_submodulo')
                ->where('id_rol', $docente->idRol())
                ->where('id_submodulo', $idBitacora)
                ->exists()
        );
    }

    public function test_el_administrador_lee_auditoria_y_configuracion(): void
    {
        $admin = $this->crearUsuario('admin.cfg', self::CLAVE, 'ADMINISTRADOR');

        $this->actingAs($admin, 'web')
            ->getJson('/api/admin/auditoria')
            ->assertOk()
            ->assertJsonStructure(['data', 'accesos_recientes', 'indicadores']);

        $this->actingAs($admin, 'web')
            ->getJson('/api/admin/configuracion')
            ->assertOk()
            ->assertJsonFragment(['codigo' => 'NOMBRE_INSTITUCION']);

        $this->actingAs($admin, 'web')
            ->putJson('/api/admin/configuracion', [
                'valores' => [
                    'NOMBRE_INSTITUCION' => 'Clinica Odontologica UNDAC',
                    'ELIMINACION_CLINICA_PERMITIDA' => '0',
                ],
            ])
            ->assertOk()
            ->assertJsonFragment(['codigo' => 'NOMBRE_INSTITUCION', 'valor' => 'Clinica Odontologica UNDAC']);
    }

    public function test_un_docente_no_alcanza_los_endpoints_del_modulo(): void
    {
        $docente = $this->crearUsuario('docente.bloqueado', self::CLAVE, 'DOCENTE');

        $this->actingAs($docente, 'web')->getJson('/api/admin/usuarios')->assertForbidden();
        $this->actingAs($docente, 'web')->getJson('/api/admin/auditoria')->assertForbidden();
        $this->actingAs($docente, 'web')->getJson('/api/admin/configuracion')->assertForbidden();
    }
}
