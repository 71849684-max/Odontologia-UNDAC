<?php

namespace Tests\Integration;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\CreaUsuarios;
use Tests\TestCase;

class OdontogramaTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    private function marca(string $estado, string $codigo, array $dientes, ?string $superficie = null): array
    {
        return [
            'id' => uniqid('m', true), 'state' => $estado, 'code' => $codigo, 'condition' => 'bad', 'note' => 'Nota clínica',
            'points' => [], 'representation' => 'schematic', 'teeth' => $dientes, 'surface' => $superficie,
        ];
    }

    private function registro(string $estado = 'draft'): array
    {
        $vacio = ['findings' => [], 'surfaces' => ['oclusal' => ['state' => 'sin-registro', 'note' => '', 'findings' => []]]];

        return [
            'version' => 1,
            'patientId' => 'p1',
            'examinations' => [[
                'id' => 'exam-1', 'reason' => 'Inicial', 'date' => '2026-10-15', 'professional' => 'Dra. Ríos', 'cop' => '12345',
                'status' => $estado, 'closedAt' => $estado === 'closed' ? '2026-10-15T10:00:00Z' : null,
                'specifications' => 'Fluorosis leve', 'observations' => 'Control en un mes',
                'teeth' => [
                    '16' => ['findings' => [], 'surfaces' => ['oclusal' => ['state' => 'caries', 'note' => '', 'findings' => [$this->marca('caries', 'CE', ['16'], 'oclusal')]]]],
                    '55' => ['findings' => [$this->marca('ectopico', '', ['55'])], 'surfaces' => []],
                    '11' => $vacio,
                ],
                'ranges' => [$this->marca('ortodoncia-fija', '', ['13', '12', '11'])],
            ]],
        ];
    }

    public function test_guarda_el_registro_completo_y_normaliza_hallazgos_con_el_catalogo(): void
    {
        $alumno = $this->crearUsuario('alumno.odonto', self::CLAVE, 'ALUMNO');
        $id = (int) $this->actingAs($alumno, 'web')->postJson('/api/historias', ['dni' => '70000201', 'nombres' => 'Paciente Odonto', 'sexo' => 'M'])->json('id');

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/odontograma", ['registro' => $this->registro()])->assertOk();

        $this->actingAs($alumno, 'web')->getJson("/api/historias/{$id}/odontograma")
            ->assertOk()
            ->assertJsonPath('registro.examinations.0.specifications', 'Fluorosis leve')
            ->assertJsonPath('registro.examinations.0.teeth.16.surfaces.oclusal.findings.0.code', 'CE')
            ->assertJsonPath('registro.examinations.0.teeth.55.findings.0.code', '')
            ->assertJsonPath('registro.examinations.0.teeth.11.surfaces.oclusal.note', '');

        $odontograma = DB::table('odontograma')->where('id_historia_clinica', $id)->first();
        $this->assertSame('MIXTA', $odontograma->tipo_denticion);
        $this->assertSame('Fluorosis leve', $odontograma->especificaciones);
        $this->assertNotNull($odontograma->registro_json);

        $hallazgos = DB::table('odontograma_hallazgo as h')
            ->join('catalogo_hallazgo_dental as c', 'c.id_hallazgo_dental', '=', 'h.id_hallazgo_dental')
            ->where('h.id_odontograma', $odontograma->id_odontograma)
            ->pluck('h.clasificacion', 'c.codigo')
            ->all();
        $this->assertSame(['CARIES', 'ECTOPICA', 'ORTODONCIA_FIJA'], collect(array_keys($hallazgos))->sort()->values()->all());
        $this->assertSame('CE', $hallazgos['CARIES']);
        $this->assertSame(3, DB::table('odontograma_hallazgo_pieza as hp')
            ->join('odontograma_hallazgo as h', 'h.id_odontograma_hallazgo', '=', 'hp.id_odontograma_hallazgo')
            ->join('catalogo_hallazgo_dental as c', 'c.id_hallazgo_dental', '=', 'h.id_hallazgo_dental')
            ->where('c.codigo', 'ORTODONCIA_FIJA')
            ->count());
    }

    public function test_la_extraccion_programada_no_marca_la_pieza_como_perdida(): void
    {
        $alumno = $this->crearUsuario('alumno.programada', self::CLAVE, 'ALUMNO');
        $id = (int) $this->actingAs($alumno, 'web')->postJson('/api/historias', ['dni' => '70000204', 'nombres' => 'Paciente Programada', 'sexo' => 'F'])->json('id');

        $registro = $this->registro();
        $registro['examinations'][0]['teeth']['12'] = ['findings' => [$this->marca('extraccion-programada', '', ['12'])], 'surfaces' => []];
        $registro['examinations'][0]['teeth']['11'] = ['findings' => [$this->marca('ausente', 'DEX', ['11'])], 'surfaces' => []];

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/odontograma", ['registro' => $registro])->assertOk();

        $odontograma = DB::table('odontograma')->where('id_historia_clinica', $id)->first();
        $perdida = fn (string $codigo): int => (int) DB::table('odontograma_hallazgo as h')
            ->join('catalogo_hallazgo_dental as c', 'c.id_hallazgo_dental', '=', 'h.id_hallazgo_dental')
            ->join('odontograma_hallazgo_pieza as hp', 'hp.id_odontograma_hallazgo', '=', 'h.id_odontograma_hallazgo')
            ->join('odontograma_pieza as p', 'p.id_odontograma_pieza', '=', 'hp.id_odontograma_pieza')
            ->where('h.id_odontograma', $odontograma->id_odontograma)
            ->where('c.codigo', $codigo)
            ->value('p.perdida');

        $this->assertSame(0, $perdida('EXTRACCION_PROGRAMADA'));
        $this->assertSame(1, $perdida('AUSENTE'));
    }

    public function test_una_evaluacion_cerrada_no_se_puede_modificar(): void
    {
        $alumno = $this->crearUsuario('alumno.cerrado', self::CLAVE, 'ALUMNO');
        $id = (int) $this->actingAs($alumno, 'web')->postJson('/api/historias', ['dni' => '70000202', 'nombres' => 'Paciente Cerrado', 'sexo' => 'F'])->json('id');

        $cerrado = $this->registro('closed');
        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/odontograma", ['registro' => $cerrado])->assertOk();

        $alterado = $cerrado;
        $alterado['examinations'][0]['observations'] = 'Texto cambiado después del cierre';
        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/odontograma", ['registro' => $alterado])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('odontograma');

        $sinEvaluacion = $cerrado;
        $sinEvaluacion['examinations'][0]['id'] = 'otra';
        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/odontograma", ['registro' => $sinEvaluacion])->assertUnprocessable();

        $conNueva = $cerrado;
        $conNueva['examinations'][] = array_merge($cerrado['examinations'][0], ['id' => 'exam-2', 'status' => 'draft', 'closedAt' => null, 'reason' => 'Nuevos hallazgos']);
        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/odontograma", ['registro' => $conNueva])->assertOk();
        $this->assertSame(2, DB::table('odontograma')->where('id_historia_clinica', $id)->count());
    }

    public function test_los_textos_vacios_guardados_como_null_vuelven_a_leerse_como_cadena(): void
    {
        $alumno = $this->crearUsuario('alumno.nulos', self::CLAVE, 'ALUMNO');
        $id = (int) $this->actingAs($alumno, 'web')->postJson('/api/historias', ['dni' => '70000203', 'nombres' => 'Paciente Nulos', 'sexo' => 'M'])->json('id');

        $registro = $this->registro();
        $registro['examinations'][0]['professional'] = null;
        $registro['examinations'][0]['cop'] = null;
        $registro['examinations'][0]['specifications'] = null;
        $registro['examinations'][0]['observations'] = null;
        $registro['examinations'][0]['teeth']['16']['surfaces']['oclusal']['note'] = null;
        $registro['examinations'][0]['teeth']['16']['surfaces']['oclusal']['findings'][0]['note'] = null;
        $registro['examinations'][0]['teeth']['55']['findings'][0]['code'] = null;

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/odontograma", ['registro' => $registro])->assertOk();

        $this->actingAs($alumno, 'web')->getJson("/api/historias/{$id}/odontograma")
            ->assertOk()
            ->assertJsonPath('registro.examinations.0.professional', '')
            ->assertJsonPath('registro.examinations.0.cop', '')
            ->assertJsonPath('registro.examinations.0.specifications', '')
            ->assertJsonPath('registro.examinations.0.observations', '')
            ->assertJsonPath('registro.examinations.0.teeth.16.surfaces.oclusal.note', '')
            ->assertJsonPath('registro.examinations.0.teeth.16.surfaces.oclusal.findings.0.note', '')
            ->assertJsonPath('registro.examinations.0.teeth.55.findings.0.code', '');

        $json = (string) DB::table('odontograma')->where('id_historia_clinica', $id)->value('registro_json');
        $this->assertStringNotContainsString('"professional":null', $json);
        $this->assertStringContainsString('"professional":""', $json);
    }
}
