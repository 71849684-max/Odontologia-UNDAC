<?php

namespace App\Identidad\Aplicacion\Permisos;

use App\Identidad\Dominio\Contratos\RepositorioPermisos;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ObtenerPermisosDeRol
{
    public function __construct(private readonly RepositorioPermisos $permisos) {}

    /**
     * @return array<string, mixed>
     */
    public function ejecutar(string $codigoRol): array
    {
        $rol = $this->rolEditable($codigoRol);

        return [
            'rol' => $rol,
            'catalogo' => $this->permisos->catalogo(),
            'efectivos' => $this->permisos->idsDelRolCodigo($rol['codigo']),
        ];
    }

    /**
     * @return array{id: int, codigo: string, nombre: string, descripcion: ?string}
     */
    public function rolEditable(string $codigoRol): array
    {
        $codigo = strtoupper(trim($codigoRol));

        if (! in_array($codigo, ['ALUMNO', 'DOCENTE'], true)) {
            throw new OperacionNoPermitida(
                'codigo_rol',
                'Solo se pueden gestionar los permisos de los roles alumno y docente.',
            );
        }

        $rol = $this->permisos->rolPorCodigo($codigo);

        if ($rol === null) {
            throw (new ModelNotFoundException)->setModel('rol', [$codigo]);
        }

        return $rol;
    }
}
