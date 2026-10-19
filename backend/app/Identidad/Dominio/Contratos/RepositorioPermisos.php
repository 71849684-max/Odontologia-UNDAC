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
     * Códigos de submódulo que la persona puede usar, ya aplicado el rol y sus excepciones.
     *
     * @return list<string>
     */
    public function codigosEfectivos(Cuenta $cuenta): array;

    /**
     * @return array{id: int, codigo: string, nombre: string, descripcion: ?string}|null
     */
    public function rolPorCodigo(string $codigoRol): ?array;

    /**
     * @return list<int>
     */
    public function idsDelRolCodigo(string $codigoRol): array;

    /**
     * @param  list<int>  $deseados
     */
    public function sincronizar(Cuenta $cuenta, array $deseados, int $idOperador): void;

    /**
     * Reemplaza la plantilla compartida del rol. No toca las excepciones personales.
     *
     * @param  list<int>  $deseados
     * @return list<int>
     */
    public function sincronizarRol(int $idRol, array $deseados): array;

    public function restaurarRol(Cuenta $cuenta): void;
}
