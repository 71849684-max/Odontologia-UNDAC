<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\CreaUsuarios;
use Tests\TestCase;

/**
 * El odontograma se lee y se escribe por su propia ruta; el expediente lo recibe
 * como eco de lectura, así que un autoguardado de otra sección no puede pisarlo.
 */
class OdontogramaPersistenciaTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    public function test_el_odontograma_se_escribe_y_se_lee_por_su_ruta_propia(): void
    {
        [$alumno, $historiaId] = $this->historiaAbierta('escritura');

        $this->actingAs($alumno, 'web')
            ->putJson("/api/historias/{$historiaId}/odontograma", ['registro' => $this->registro('Control inicial')])
            ->assertOk();

        $leido = $this->actingAs($alumno, 'web')
            ->getJson("/api/historias/{$historiaId}/odontograma")
            ->assertOk()
            ->json('registro');

        self::assertSame(1, $leido['version']);
        self::assertSame('Control inicial', $leido['examinations'][0]['reason']);
    }

    public function test_un_autoguardado_del_expediente_no_pisa_el_odontograma(): void
    {
        [$alumno, $historiaId] = $this->historiaAbierta('carrera');

        $this->actingAs($alumno, 'web')
            ->putJson("/api/historias/{$historiaId}/odontograma", ['registro' => $this->registro('Evaluación del odontograma')])
            ->assertOk();

        // Otra sección se autoguarda con la copia vencida del odontograma dentro de formData.
        $this->actingAs($alumno, 'web')
            ->putJson("/api/historias/{$historiaId}/expediente", [
                'formData' => ['odontograma' => ['registro' => $this->registro('Copia vencida')]],
            ])
            ->assertOk();

        $leido = $this->actingAs($alumno, 'web')
            ->getJson("/api/historias/{$historiaId}/odontograma")
            ->json('registro');

        self::assertSame('Evaluación del odontograma', $leido['examinations'][0]['reason']);
    }

    public function test_el_odontograma_sigue_editable_despues_de_un_autoguardado_del_expediente(): void
    {
        [$alumno, $historiaId] = $this->historiaAbierta('secuencial');

        $this->actingAs($alumno, 'web')
            ->putJson("/api/historias/{$historiaId}/expediente", [
                'formData' => ['anamnesis' => ['motivoConsulta' => 'Dolor dental']],
            ])
            ->assertOk();

        $this->actingAs($alumno, 'web')
            ->putJson("/api/historias/{$historiaId}/odontograma", ['registro' => $this->registro('Después del autoguardado')])
            ->assertOk();

        $this->assertDatabaseHas('odontograma', [
            'id_historia_clinica' => $historiaId,
            'motivo_evaluacion' => 'Después del autoguardado',
        ]);
    }

    /**
     * El middleware del formulario convierte las cadenas vacías en null; el
     * registro es un documento JSON y debe volver al navegador tal cual, si no
     * `readRecord` lo rechaza y el odontograma queda guardado pero ilegible.
     */
    public function test_el_via_ida_y_vuelta_conserva_las_cadenas_vacias(): void
    {
        [$alumno, $historiaId] = $this->historiaAbierta('cadenas');

        $registro = $this->registro('Control sin firmar');
        $registro['examinations'][0]['professional'] = '';
        $registro['examinations'][0]['cop'] = '';
        $registro['examinations'][0]['observations'] = '';
        $registro['examinations'][0]['teeth'] = [
            '11' => [
                'number' => '11',
                'findings' => [[
                    'id' => 'marca-sin-sigla',
                    'state' => 'caries',
                    'code' => '',
                    'condition' => 'good',
                    'note' => '',
                    'points' => [[30, 63], [45, 64]],
                    'representation' => 'schematic',
                    'teeth' => ['11'],
                    'surface' => 'oclusal',
                ]],
                'surfaces' => [],
            ],
        ];

        $this->actingAs($alumno, 'web')
            ->putJson("/api/historias/{$historiaId}/odontograma", ['registro' => $registro])
            ->assertOk();

        $leido = $this->actingAs($alumno, 'web')
            ->getJson("/api/historias/{$historiaId}/odontograma")
            ->json('registro');

        self::assertSame('', $leido['examinations'][0]['professional']);
        self::assertSame('', $leido['examinations'][0]['cop']);
        self::assertSame('', $leido['examinations'][0]['observations']);
        self::assertSame('', $leido['examinations'][0]['teeth']['11']['findings'][0]['code']);
        self::assertSame('', $leido['examinations'][0]['teeth']['11']['findings'][0]['note']);
    }

    /** @return array{0: \App\Identidad\Infraestructura\Persistencia\CuentaSistema, 1: int} */
    private function historiaAbierta(string $sufijo): array
    {
        $alumno = $this->crearUsuario("odontograma.{$sufijo}", self::CLAVE, 'ALUMNO');

        $paciente = $this->actingAs($alumno, 'web')->postJson('/api/pacientes', [
            'nombres' => 'Rosa',
            'apellidoPaterno' => 'Quispe',
            'apellidoMaterno' => 'Mamani',
            'numeroDocumento' => '7'.random_int(10000000, 99999999),
            'sexo' => 'F',
            'fechaNacimiento' => '1998-07-04',
        ])->assertCreated();

        $historia = $this->actingAs($alumno, 'web')->postJson('/api/historias', [
            'pacienteId' => $paciente->json('id'),
        ])->assertCreated();

        return [$alumno, (int) $historia->json('id')];
    }

    private function registro(string $motivo): array
    {
        return [
            'version' => 1,
            'patientId' => 'paciente-de-prueba',
            'examinations' => [[
                'id' => 'examen-'.uniqid(),
                'date' => '2026-10-08',
                'reason' => $motivo,
                'status' => 'open',
                'teeth' => [],
                'ranges' => [],
            ]],
        ];
    }
}
