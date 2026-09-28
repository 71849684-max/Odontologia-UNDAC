<?php

namespace App\Identidad\Dominio\Contratos;

interface RepositorioConfiguracion
{
    /**
     * @return list<array<string, mixed>>
     */
    public function listar(): array;

    /**
     * @param  array<string, string|null>  $valores
     * @return array{antes: array<string, mixed>, despues: array<string, mixed>}
     */
    public function guardar(array $valores, int $idOperador): array;
}
