<?php

namespace Tests\Functional;

use Tests\TestCase;

class SesionSinCabeceraJsonTest extends TestCase
{
    public function test_la_api_responde_401_sin_redirigir_a_una_ruta_de_acceso_inexistente(): void
    {
        $this->get('/api/auth/yo')->assertUnauthorized()->assertJsonPath('message', 'Sesion no iniciada.');
    }
}
