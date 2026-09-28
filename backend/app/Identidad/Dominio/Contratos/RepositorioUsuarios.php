<?php

namespace App\Identidad\Dominio\Contratos;

use App\Identidad\Dominio\Cuenta;

interface RepositorioUsuarios
{
    public function buscarPorNombre(string $nombreUsuario): ?Cuenta;

    public function buscarPorId(int $idUsuario): Cuenta;

    public function idPersonaDe(int $idUsuario): ?int;

    /**
     * @param  array{q?: string, rol?: string, estado?: mixed}  $filtros
     * @return list<array<string, mixed>>
     */
    public function listar(array $filtros): array;

    /**
     * @return array<string, int>
     */
    public function indicadores(): array;

    /**
     * @param  array<string, mixed>  $datos
     */
    public function crear(array $datos, int $idOperador): Cuenta;

    /**
     * @param  array<string, mixed>  $datos
     */
    public function actualizar(Cuenta $cuenta, array $datos, int $idOperador): Cuenta;

    public function cambiarEstado(Cuenta $cuenta, bool $estado, int $idOperador): Cuenta;

    public function registrarInicioExitoso(Cuenta $cuenta): void;

    public function acumularFallo(Cuenta $cuenta): void;

    /**
     * @return array<string, mixed>
     */
    public function serializar(Cuenta $cuenta): array;
}
