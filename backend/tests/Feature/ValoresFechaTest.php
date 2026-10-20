<?php

namespace Tests\Feature;

use App\Clinica\Soporte\Valores;
use PHPUnit\Framework\TestCase;

class ValoresFechaTest extends TestCase
{
    public function test_interpreta_dia_mes_anio(): void
    {
        $this->assertSame('2026-05-01', Valores::fecha('01/05/2026'));
        $this->assertSame('2026-05-15', Valores::fecha('15/05/2026'));
        $this->assertSame('2026-05-01', Valores::fecha('1/5/2026'));
        $this->assertSame('2026-05-01', Valores::fecha('2026-05-01'));
        $this->assertNull(Valores::fecha('31/02/2026'));
        $this->assertNull(Valores::fecha(''));
    }
}
