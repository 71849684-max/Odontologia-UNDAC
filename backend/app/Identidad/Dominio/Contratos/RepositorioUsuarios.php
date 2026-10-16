<?php

namespace App\Identidad\Dominio\Contratos;

use App\Identidad\Dominio\Cuenta;

interface RepositorioUsuarios
{
    public function buscarPorNombre(string $nombreUsuario): ?Cuenta;

    public function buscarPorId(string $clave): Cuenta;

    public function idActorDe(string $clave): ?int;

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

    /**
     * Datos personales que el propio usuario puede modificar.
     *
     * @param  array{nombres: string, apellidos: string, correo?: ?string, telefono?: ?string}  $datos
     */
    public function actualizarPerfil(Cuenta $cuenta, array $datos): Cuenta;

    /** Reemplaza la contraseña y desbloquea la cuenta. */
    public function cambiarContrasena(Cuenta $cuenta, string $nueva): Cuenta;

    public function registrarInicioExitoso(Cuenta $cuenta): void;

    public function acumularFallo(Cuenta $cuenta): void;

    /**
     * @return array<string, mixed>
     */
    public function serializar(Cuenta $cuenta): array;
}
