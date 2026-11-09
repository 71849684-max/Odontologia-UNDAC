<?php

namespace Tests\Unit;

use App\Identidad\Infraestructura\Persistencia\CuentaSistema;
use Illuminate\Support\Facades\Route;
use Mockery;
use Tests\TestCase;

class LimiteCambiosClinicosTest extends TestCase
{
    public function test_limita_las_rafagas_y_conserva_cabecera_de_reintento(): void
    {
        config(['cache.default' => 'array']);
        Route::get('/prueba-cambios/{idHistoria}', fn () => response()->json(['ok' => true]))
            ->middleware('throttle:cambios-equipo-estado');

        for ($intento = 0; $intento < 6; $intento++) {
            $this->getJson('/prueba-cambios/41')->assertOk();
        }
        $this->getJson('/prueba-cambios/41')->assertStatus(429)->assertHeader('Retry-After')
            ->assertJsonPath('message', 'Ha realizado demasiados cambios seguidos. Espere un minuto antes de volver a intentarlo.');
        $this->getJson('/prueba-cambios/42')->assertOk();
        $this->travel(61)->seconds();
        $this->getJson('/prueba-cambios/41')->assertOk();
    }

    public function test_el_limite_es_por_cuenta_y_tambien_frena_cambios_entre_muchas_historias(): void
    {
        config(['cache.default' => 'array']);
        Route::get('/prueba-usuario/{idHistoria}', fn () => response()->json(['ok' => true]))
            ->middleware('throttle:cambios-equipo-estado');
        $primero = Mockery::mock(CuentaSistema::class);
        $primero->shouldReceive('clave')->andReturn('ALUMNO-101');
        $segundo = Mockery::mock(CuentaSistema::class);
        $segundo->shouldReceive('clave')->andReturn('ALUMNO-102');
        $this->actingAs($primero, 'web');
        for ($historia = 1; $historia <= 30; $historia++) {
            $this->getJson('/prueba-usuario/'.$historia)->assertOk();
        }
        $this->getJson('/prueba-usuario/31')->assertStatus(429);
        $this->actingAs($segundo, 'web')->getJson('/prueba-usuario/31')->assertOk();
    }
}
