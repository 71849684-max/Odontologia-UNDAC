<?php

namespace App\Identidad\Infraestructura\Acceso;

use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProveedorCuentas implements UserProvider
{
    public function __construct(private readonly RepositorioUsuarios $usuarios) {}

    public function retrieveById($identifier): ?Authenticatable
    {
        try {
            return $this->usuarios->buscarPorId((string) $identifier);
        } catch (ModelNotFoundException) {
            return null;
        }
    }

    public function retrieveByToken($identifier, $token): ?Authenticatable
    {
        return null;
    }

    public function updateRememberToken(Authenticatable $user, $token): void {}

    public function retrieveByCredentials(array $credentials): ?Authenticatable
    {
        $nombre = $credentials['nombre_usuario'] ?? null;

        if (! is_string($nombre) || $nombre === '') {
            return null;
        }

        return $this->usuarios->buscarPorNombre($nombre);
    }

    public function validateCredentials(Authenticatable $user, array $credentials): bool
    {
        $plano = $credentials['contrasena'] ?? '';

        return is_string($plano) && password_verify($plano, $user->getAuthPassword());
    }

    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false): void {}
}
