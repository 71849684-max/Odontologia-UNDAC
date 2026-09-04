<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SolicitudGuardarPermisos;
use App\Models\Usuario;
use App\Servicios\ServicioAccesos;
use App\Servicios\ServicioAuditoria;
use App\Servicios\ServicioPermisos;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControladorPermisos extends Controller
{
    public function __construct(
        private readonly ServicioPermisos $permisos,
        private readonly ServicioAccesos $accesos,
        private readonly ServicioAuditoria $auditoria,
    ) {}

    public function catalogo(): JsonResponse
    {
        return response()->json(['data' => $this->permisos->catalogo()]);
    }

    public function deUsuario(int $idUsuario): JsonResponse
    {
        $usuario = Usuario::query()->with('persona')->findOrFail($idUsuario);
        $delRol = $this->permisos->idsDelRol($usuario);
        $efectivos = $this->permisos->idsEfectivos($usuario);

        return response()->json([
            'usuario' => [
                'id' => (int) $usuario->getKey(),
                'nombre' => $usuario->nombreCompleto(),
                'nombre_usuario' => $usuario->nombre_usuario,
                'roles' => $this->accesos->roles($usuario),
                'estado' => (bool) $usuario->estado,
            ],
            'catalogo' => $this->permisos->catalogo(),
            'del_rol' => $delRol,
            'efectivos' => $efectivos,
            'adicionales' => count(array_diff($efectivos, $delRol)),
        ]);
    }

    public function guardar(SolicitudGuardarPermisos $solicitud, int $idUsuario): JsonResponse
    {
        $usuario = Usuario::query()->with('persona')->findOrFail($idUsuario);
        $antes = $this->permisos->idsEfectivos($usuario);

        /** @var Usuario $operador */
        $operador = $solicitud->user();
        $this->permisos->sincronizar($usuario, $solicitud->idsPermisos(), (int) $operador->getKey());

        $despues = $this->permisos->idsEfectivos($usuario);

        $this->auditoria->registrar(
            $solicitud,
            'usuario_permiso',
            $usuario->getKey(),
            'EDITAR',
            ['efectivos' => $antes],
            ['efectivos' => $despues],
        );

        return $this->deUsuario($idUsuario);
    }

    public function restaurar(Request $solicitud, int $idUsuario): JsonResponse
    {
        $usuario = Usuario::query()->findOrFail($idUsuario);
        $antes = $this->permisos->idsEfectivos($usuario);

        $this->permisos->restaurarRol($usuario);
        $despues = $this->permisos->idsEfectivos($usuario);

        $this->auditoria->registrar(
            $solicitud,
            'usuario_permiso',
            $usuario->getKey(),
            'RESTAURAR',
            ['efectivos' => $antes],
            ['efectivos' => $despues],
        );

        return $this->deUsuario($idUsuario);
    }
}
