<?php

namespace Tests\Soporte;

trait AbreHistoria
{
    protected const CLAVE_PRUEBA = 'ClaveDePrueba123*';

    /** @param  array<string, mixed>  $extra */
    protected function abrirHistoria(
        object $usuario,
        string $dni,
        string $nombres = 'Paciente De Prueba',
        string $sexo = 'F',
        array $extra = [],
    ): int {
        return (int) $this->actingAs($usuario, 'web')->postJson('/api/historias', array_merge([
            'dni' => $dni,
            'nombres' => $nombres,
            'sexo' => $sexo,
        ], $extra))->assertCreated()->json('id');
    }

    /** @param  array<string, mixed>  $formData */
    protected function guardarExpediente(object $usuario, int $idHistoria, array $formData, array $estados = []): \Illuminate\Testing\TestResponse
    {
        $cuerpo = ['formData' => $formData];
        if ($estados !== []) {
            $cuerpo['sectionStatus'] = $estados;
        }

        return $this->actingAs($usuario, 'web')->putJson("/api/historias/{$idHistoria}/expediente", $cuerpo);
    }
}
