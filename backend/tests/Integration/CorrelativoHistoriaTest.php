<?php

namespace Tests\Integration;

use App\Clinica\Historias\AccesoHistorias;
use App\Clinica\Historias\ServicioHistorias;
use App\Clinica\Pacientes\ServicioPacientes;
use App\Clinica\Soporte\AplicadorParches;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\TestCase;

class CorrelativoHistoriaTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    public function test_supera_999_y_conserva_el_contador_en_la_transaccion(): void
    {
        $cuenta = $this->crearUsuario('asistente.correlativo', 'ClaveDePrueba123*', 'ALUMNO');
        DB::table('historia_correlativo')->updateOrInsert(['anio' => now()->year], ['ultimo' => 998]);
        foreach ([999, 1000, 1001] as $indice) {
            $historia = $this->actingAs($cuenta, 'web')->postJson('/api/historias', [
                'dni' => (string) (91000000 + $indice), 'nombres' => 'Paciente Sintético', 'apellidoPaterno' => 'Correlativo',
            ])->assertCreated();
            $this->assertSame(sprintf('HC-%d-%03d', now()->year, $indice), $historia->json('codigo'));
        }
        $this->assertSame(1001, (int) DB::table('historia_correlativo')->where('anio', now()->year)->value('ultimo'));
    }

    public function test_inicia_un_anio_nuevo_sin_fila_previa(): void
    {
        $cuenta = $this->crearUsuario('correlativo.anio', 'ClaveDePrueba123*');
        Carbon::setTestNow('2037-01-01 10:00:00');
        try {
            $this->actingAs($cuenta, 'web')->postJson('/api/historias', ['dni' => '91909090', 'nombres' => 'Paciente Sintético', 'apellidoPaterno' => 'Año'])->assertCreated()->assertJsonPath('codigo', 'HC-2037-001');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_un_fallo_posterior_revierte_historia_y_contador(): void
    {
        $cuenta = $this->crearUsuario('correlativo.reversion', 'ClaveDePrueba123*');
        $historia = app(ServicioHistorias::class)->abrir(['dni' => '91909091', 'nombres' => 'Paciente Sintético'], $cuenta);
        $contador = DB::table('historia_correlativo')->where('anio', now()->year)->value('ultimo');
        $cantidad = DB::table('historia_clinica')->count();
        $pacientes = \Mockery::mock(ServicioPacientes::class)->makePartial();
        $pacientes->shouldReceive('actualizar')->once()->andThrow(new OperacionNoPermitida('correo', 'Fallo sintético posterior a la reserva.'));
        try {
            (new ServicioHistorias($pacientes, app(AccesoHistorias::class)))->abrir(['dni' => '91909091', 'correo' => 'sintetico@example.test'], $cuenta);
            $this->fail('Debió revertir la apertura.');
        } catch (OperacionNoPermitida) {
            $this->assertSame($contador, DB::table('historia_correlativo')->where('anio', now()->year)->value('ultimo'));
            $this->assertSame($cantidad, DB::table('historia_clinica')->count());
        }
    }

    public function test_inicializa_con_maximo_numerico_incluso_de_historias_inactivas(): void
    {
        $cuenta = $this->crearUsuario('correlativo.inactivo', 'ClaveDePrueba123*');
        $historia = app(ServicioHistorias::class)->abrir(['dni' => '91909092', 'nombres' => 'Paciente Sintético'], $cuenta);
        DB::table('historia_clinica')->where('id_historia_clinica', $historia['id'])->update(['numero_historia' => 'HC-'.now()->year.'-1005', 'anulado_en' => now()]);
        DB::table('historia_correlativo')->where('anio', now()->year)->update(['ultimo' => 1]);
        $sentencias = (new AplicadorParches(database_path('parches')))->sentencias(file_get_contents(database_path('parches/2026-11-08-correlativo-historias.sql')));
        DB::statement($sentencias[1]);
        $siguiente = app(ServicioHistorias::class)->abrir(['dni' => '91909093', 'nombres' => 'Paciente Sintético'], $cuenta);
        $this->assertSame('HC-'.now()->year.'-1006', $siguiente['codigo']);
    }
}
