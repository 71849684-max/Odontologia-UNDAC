<?php

namespace App\Identidad\Aplicacion\Usuarios;

use App\Identidad\Dominio\Contratos\RepositorioUsuarios;

class MostrarUsuario
{
    public function __construct(private readonly RepositorioUsuarios $usuarios) {}

    /**
     * @return array<string, mixed>
     */
    public function ejecutar(int $idUsuario): array
    {
        return $this->usuarios->serializar($this->usuarios->buscarPorId($idUsuario));
    }
}
