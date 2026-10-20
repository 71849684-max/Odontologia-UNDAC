<?php

namespace Tests\Feature;

use App\Clinica\Historias\ServicioHistorias;
use Tests\TestCase;

class ProgresoHistoriaTest extends TestCase
{
    public function test_diecisiete_secciones_completas_equivalen_al_cien_por_ciento(): void
    {
        $this->assertSame(100, ServicioHistorias::porcentaje(17));
        $this->assertSame(94, ServicioHistorias::porcentaje(16));
        $this->assertSame(0, ServicioHistorias::porcentaje(0));
    }
}
