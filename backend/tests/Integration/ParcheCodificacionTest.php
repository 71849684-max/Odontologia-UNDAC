<?php

namespace Tests\Integration;

use App\Clinica\Soporte\AplicadorParches;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ParcheCodificacionTest extends TestCase
{
    use DatabaseTransactions;

    public function test_el_parche_no_convierte_textos_correctos_con_tildes(): void
    {
        DB::table('estado_historia_clinica')->where('codigo', 'PENDIENTE_REVISION')->update(['nombre' => 'Pendiente de revisión']);
        $previos = DB::table('estado_historia_clinica')->orderBy('id_estado_historia')->pluck('nombre')->all();
        $aplicador = new AplicadorParches(database_path('parches'));
        $sentencias = $aplicador->sentencias(file_get_contents(database_path('parches/2026-10-16-corregir-utf8-mojibake.sql')));
        foreach ($sentencias as $sentencia) {
            DB::statement($sentencia);
        }
        $this->assertSame($previos, DB::table('estado_historia_clinica')->orderBy('id_estado_historia')->pluck('nombre')->all());
        $this->assertContains('Pendiente de revisión', $previos);
    }
}
