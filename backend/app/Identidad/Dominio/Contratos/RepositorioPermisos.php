<?php

namespace App\Identidad\Dominio\Contratos;

use App\Identidad\Dominio\Cuenta;

interface RepositorioPermisos
{
    /**
     * @return list<array<string, mixed>>
     */
    public function catalogo(): array;

    /**
     * @return list<int>
     */
    public function idsDelRol(Cuenta $cuenta): array;

    /**
     * @return list<int>
     */
    public function idsEfectivos(Cuenta $cuenta): array;

    /**
     * @param  list<int>  $deseados
     */
    public function sincronizar(Cuenta $cuenta, array $deseados, int $idOperador): void;

    public function restaurarRol(Cuenta $cuenta): void;
}
