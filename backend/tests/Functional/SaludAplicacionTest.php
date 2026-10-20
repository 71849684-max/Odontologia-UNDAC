<?php

namespace Tests\Functional;

use Tests\TestCase;

class SaludAplicacionTest extends TestCase
{
    public function test_el_backend_responde_en_la_raiz(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertJsonPath('capa', 'backend');
    }
}
