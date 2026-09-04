<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\TestCase;

class InicioSesionTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    public function test_el_inicio_de_sesion_correcto_devuelve_roles_y_deja_la_sesion_activa(): void
    {
        $usuario = $this->crearUsuario('docente.prueba', self::CLAVE, 'DOCENTE');

        $respuesta = $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'docente.prueba',
            'contrasena' => self::CLAVE,
        ]);

        $respuesta->assertOk()
            ->assertJsonPath('usuario.nombre_usuario', 'docente.prueba')
            ->assertJsonPath('roles', ['DOCENTE'])
            ->assertJsonPath('es_administrador', false);

        $this->assertAuthenticatedAs($usuario->fresh(), 'web');
        $this->assertNotNull($usuario->fresh()->ultimo_inicio_sesion);

        $this->assertDatabaseHas('login_historial', [
            'id_usuario' => $usuario->getKey(),
            'exito' => 1,
            'motivo_fallo' => null,
        ]);
    }

    public function test_el_administrador_se_identifica_como_tal(): void
    {
        $this->crearUsuario('admin.prueba', self::CLAVE, 'ADMINISTRADOR');

        $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'admin.prueba',
            'contrasena' => self::CLAVE,
        ])->assertOk()->assertJsonPath('es_administrador', true);
    }

    public function test_la_contrasena_incorrecta_devuelve_un_mensaje_generico_y_queda_registrada(): void
    {
        $usuario = $this->crearUsuario('alumno.prueba', self::CLAVE, 'ALUMNO_OPERADOR');

        $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'alumno.prueba',
            'contrasena' => 'otra-clave',
        ])->assertStatus(422)->assertJsonPath('errors.nombre_usuario.0', 'Las credenciales no son validas.');

        $this->assertGuest('web');
        $this->assertSame(1, $usuario->fresh()->intentos_fallidos);
        $this->assertDatabaseHas('login_historial', [
            'id_usuario' => $usuario->getKey(),
            'exito' => 0,
            'motivo_fallo' => 'CONTRASENA_INCORRECTA',
        ]);
    }

    public function test_un_usuario_inexistente_recibe_el_mismo_mensaje_que_una_contrasena_incorrecta(): void
    {
        $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'no.existe',
            'contrasena' => self::CLAVE,
        ])->assertStatus(422)->assertJsonPath('errors.nombre_usuario.0', 'Las credenciales no son validas.');

        $this->assertDatabaseHas('login_historial', [
            'nombre_usuario' => 'no.existe',
            'exito' => 0,
            'motivo_fallo' => 'USUARIO_INEXISTENTE',
        ]);
    }

    public function test_un_usuario_inactivo_no_puede_entrar(): void
    {
        $usuario = $this->crearUsuario('inactivo.prueba', self::CLAVE, 'DOCENTE', estado: false);

        $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'inactivo.prueba',
            'contrasena' => self::CLAVE,
        ])->assertStatus(422)->assertJsonPath('errors.nombre_usuario.0', 'Las credenciales no son validas.');

        $this->assertGuest('web');
        $this->assertDatabaseHas('login_historial', [
            'id_usuario' => $usuario->getKey(),
            'motivo_fallo' => 'USUARIO_INACTIVO',
        ]);
    }

    public function test_los_fallos_consecutivos_bloquean_la_cuenta_temporalmente(): void
    {
        config(['acceso.fallos_antes_de_bloqueo' => 3, 'acceso.minutos_de_bloqueo' => 15]);
        $usuario = $this->crearUsuario('bloqueo.prueba', self::CLAVE, 'DOCENTE');

        for ($intento = 1; $intento <= 3; $intento++) {
            $this->postJson('/api/auth/login', [
                'nombre_usuario' => 'bloqueo.prueba',
                'contrasena' => 'incorrecta',
            ])->assertStatus(422);
        }

        $usuario->refresh();
        $this->assertNotNull($usuario->bloqueado_hasta);
        $this->assertTrue($usuario->estaBloqueado());

        // Ni con la contrasena correcta se entra mientras el bloqueo siga vigente.
        $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'bloqueo.prueba',
            'contrasena' => self::CLAVE,
        ])->assertStatus(423);

        $this->assertGuest('web');
        $this->assertDatabaseHas('login_historial', [
            'id_usuario' => $usuario->getKey(),
            'motivo_fallo' => 'USUARIO_BLOQUEADO',
        ]);
    }

    public function test_el_limitador_corta_los_intentos_repetidos(): void
    {
        config(['acceso.intentos_por_minuto' => 2, 'acceso.fallos_antes_de_bloqueo' => 99]);
        $this->crearUsuario('limite.prueba', self::CLAVE, 'DOCENTE');

        foreach ([422, 422] as $esperado) {
            $this->postJson('/api/auth/login', [
                'nombre_usuario' => 'limite.prueba',
                'contrasena' => 'incorrecta',
            ])->assertStatus($esperado);
        }

        $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'limite.prueba',
            'contrasena' => self::CLAVE,
        ])->assertStatus(429);
    }

    public function test_el_inicio_de_sesion_exige_usuario_y_contrasena(): void
    {
        $this->postJson('/api/auth/login', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nombre_usuario', 'contrasena']);
    }

    public function test_el_inicio_de_sesion_correcto_reinicia_el_contador_de_fallos(): void
    {
        $usuario = $this->crearUsuario('reinicio.prueba', self::CLAVE, 'DOCENTE');
        $usuario->forceFill(['intentos_fallidos' => 2])->save();

        $this->postJson('/api/auth/login', [
            'nombre_usuario' => 'reinicio.prueba',
            'contrasena' => self::CLAVE,
        ])->assertOk();

        $this->assertSame(0, $usuario->fresh()->intentos_fallidos);
    }

    public function test_cerrar_sesion_deja_al_usuario_como_invitado(): void
    {
        $usuario = $this->crearUsuario('salida.prueba', self::CLAVE, 'DOCENTE');

        $this->actingAs($usuario, 'web')
            ->postJson('/api/auth/logout')
            ->assertOk();

        $this->assertGuest('web');
    }

    public function test_la_sesion_se_recupera_con_el_endpoint_yo(): void
    {
        $usuario = $this->crearUsuario('sesion.prueba', self::CLAVE, 'ADMINISTRADOR');

        $this->actingAs($usuario, 'web')
            ->getJson('/api/auth/yo')
            ->assertOk()
            ->assertJsonPath('usuario.id', $usuario->getKey())
            ->assertJsonPath('es_administrador', true);
    }

    public function test_sin_sesion_el_endpoint_yo_responde_401(): void
    {
        $this->getJson('/api/auth/yo')->assertUnauthorized();
    }

    public function test_la_contrasena_nunca_viaja_en_la_respuesta(): void
    {
        $usuario = $this->crearUsuario('oculta.prueba', self::CLAVE, 'DOCENTE');

        $respuesta = $this->actingAs($usuario, 'web')->getJson('/api/auth/yo');

        $respuesta->assertOk();
        $this->assertStringNotContainsString('contrasena_hash', $respuesta->getContent());
    }

    public function test_los_intentos_registran_ip_y_agente(): void
    {
        $this->crearUsuario('rastro.prueba', self::CLAVE, 'DOCENTE');

        $this->withHeader('User-Agent', 'AgenteDePrueba/1.0')
            ->postJson('/api/auth/login', [
                'nombre_usuario' => 'rastro.prueba',
                'contrasena' => self::CLAVE,
            ])->assertOk();

        $registro = DB::table('login_historial')
            ->where('nombre_usuario', 'rastro.prueba')
            ->latest('id_login')
            ->first();

        $this->assertSame('AgenteDePrueba/1.0', $registro->agente_usuario);
        $this->assertNotEmpty($registro->direccion_ip);
    }

    public function test_el_modelo_usuario_no_gestiona_token_de_recordarme(): void
    {
        // La tabla usuario no tiene columna remember_token.
        $this->assertSame('', (new Usuario)->getRememberTokenName());
    }
}
