<?php

namespace Tests\Unit;

use App\Academico\ServicioAcademico;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class LotesAcademicosValidacionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'lotes', 'database.connections.lotes' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '']]);
        Schema::create('grupo_academico', fn (Blueprint $tabla) => $tabla->integer('id_grupo'));
        Schema::create('alumno', fn (Blueprint $tabla) => $tabla->integer('id_alumno'));
        Schema::create('grupo_miembro', function (Blueprint $tabla) {
            $tabla->increments('id_grupo_miembro');
            $tabla->integer('id_grupo');
            $tabla->integer('id_alumno');
            $tabla->date('fecha_inicio');
            $tabla->date('fecha_fin')->nullable();
            $tabla->string('estado');
            $tabla->timestamp('creado_en');
        });
        DB::table('grupo_academico')->insert(['id_grupo' => 1]);
        DB::table('alumno')->insert(['id_alumno' => 1]);
    }

    public function test_un_miembro_invalido_revierte_todo_el_lote(): void
    {
        try {
            app(ServicioAcademico::class)->guardarMembresias(1, [
                ['personaId' => 'alumno-1', 'fechaInicio' => '2026-11-01'],
                ['personaId' => 'alumno-999', 'fechaInicio' => '2026-11-01'],
            ]);
            $this->fail('Debió rechazar al asistente inexistente.');
        } catch (OperacionNoPermitida $error) {
            $this->assertSame('El asistente seleccionado no existe.', $error->getMessage());
        }
        $this->assertSame(0, DB::table('grupo_miembro')->count());
    }

    public function test_rechaza_fecha_final_anterior_al_inicio_sin_insertar(): void
    {
        try {
            app(ServicioAcademico::class)->guardarMembresias(1, [
                ['personaId' => 'alumno-1', 'fechaInicio' => '10/11/2026', 'fechaFin' => '01/11/2026'],
            ]);
            $this->fail('Debió rechazar el intervalo de fechas.');
        } catch (OperacionNoPermitida $error) {
            $this->assertSame('fechaFin', $error->campo);
        }
        $this->assertSame(0, DB::table('grupo_miembro')->count());
    }
}
