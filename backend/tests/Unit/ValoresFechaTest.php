<?php

namespace Tests\Unit;

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
        $this->assertNull(Valores::fecha('2026-13-01'));
    }

    public function test_normaliza_texto_si_no_y_decimal(): void
    {
        $this->assertNull(Valores::texto('   '));
        $this->assertSame('Control', Valores::texto(' Control '));
        $this->assertSame(1, Valores::siNo('Sí'));
        $this->assertSame(1, Valores::siNo('si'));
        $this->assertSame(0, Valores::siNo('No'));
        $this->assertNull(Valores::siNo('tal vez'));
        $this->assertSame('Sí', Valores::desdeSiNo(1));
        $this->assertSame('No', Valores::desdeSiNo(0));
        $this->assertSame('', Valores::desdeSiNo(null));
        $this->assertSame('70.5', Valores::decimal('70,5'));
        $this->assertNull(Valores::decimal('abc'));
    }

    public function test_separa_nombres_y_apellidos_del_formulario(): void
    {
        [$nombres, $apellidos] = Valores::nombresYApellidos([
            'nombres' => 'Andrea Lucía',
            'apellidoPaterno' => 'Salazar',
            'apellidoMaterno' => 'Huamán',
        ]);
        $this->assertSame('Andrea Lucía', $nombres);
        $this->assertSame('Salazar Huamán', $apellidos);

        [$solo, $resto] = Valores::nombresYApellidos(['nombres' => 'Ana']);
        $this->assertSame('Ana', $solo);
        $this->assertSame('-', $resto);
    }
}
