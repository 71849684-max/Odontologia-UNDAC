<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SolicitudGuardarUsuario;
use App\Models\Rol;
use App\Models\Usuario;
use App\Servicios\ServicioAccesos;
use App\Servicios\ServicioAuditoria;
use App\Servicios\ServicioUsuarios;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ControladorUsuarios extends Controller
{
    public function __construct(
        private readonly ServicioUsuarios $usuarios,
        private readonly ServicioAccesos $accesos,
        private readonly ServicioAuditoria $auditoria,
    ) {}

    public function roles(): JsonResponse
    {
        $roles = Rol::query()
            ->where('estado', 1)
            ->orderBy('nombre_rol')
            ->get(['id_rol', 'codigo_rol', 'nombre_rol', 'descripcion_rol'])
            ->map(fn (Rol $rol) => [
                'id' => (int) $rol->getKey(),
                'codigo' => $rol->codigo_rol,
                'nombre' => $rol->nombre_rol,
                'descripcion' => $rol->descripcion_rol,
            ]);

        return response()->json(['data' => $roles]);
    }

    public function listar(Request $solicitud): JsonResponse
    {
        $busqueda = trim((string) $solicitud->query('q', ''));
        $rol = trim((string) $solicitud->query('rol', ''));
        $estado = $solicitud->query('estado');

        $consulta = Usuario::query()
            ->with('persona')
            ->orderByDesc('id_usuario');

        if ($busqueda !== '') {
            $consulta->where(function ($q) use ($busqueda) {
                $q->where('nombre_usuario', 'like', "%{$busqueda}%")
                    ->orWhereHas('persona', function ($persona) use ($busqueda) {
                        $persona->where('nombres', 'like', "%{$busqueda}%")
                            ->orWhere('apellidos', 'like', "%{$busqueda}%")
                            ->orWhere('numero_documento', 'like', "%{$busqueda}%")
                            ->orWhere('correo', 'like', "%{$busqueda}%");
                    });
            });
        }

        if ($estado !== null && $estado !== '') {
            $consulta->where('estado', filter_var($estado, FILTER_VALIDATE_BOOLEAN) ? 1 : 0);
        }

        if ($rol !== '') {
            $consulta->whereExists(function ($sub) use ($rol) {
                $sub->select(DB::raw(1))
                    ->from('usuario_rol as ur')
                    ->join('rol as r', 'r.id_rol', '=', 'ur.id_rol')
                    ->whereColumn('ur.id_usuario', 'usuario.id_usuario')
                    ->where('ur.permitido', 1)
                    ->where('r.estado', 1)
                    ->where('r.codigo_rol', $rol)
                    ->where(fn ($c) => $c->whereNull('ur.fecha_inicio')->orWhereDate('ur.fecha_inicio', '<=', now()))
                    ->where(fn ($c) => $c->whereNull('ur.fecha_fin')->orWhereDate('ur.fecha_fin', '>=', now()));
            });
        }

        $usuarios = $consulta->limit(200)->get()->map(fn (Usuario $u) => $this->serializar($u));

        $indicadores = [
            'total' => Usuario::query()->count(),
            'activos' => Usuario::query()->where('estado', 1)->count(),
            'alumnos' => $this->contarPorRol('ALUMNO_OPERADOR'),
            'docentes' => $this->contarPorRol('DOCENTE'),
            'administradores' => $this->contarPorRol('ADMINISTRADOR'),
            'administrativos' => $this->contarPorRol('ADMINISTRATIVO'),
        ];

        return response()->json([
            'data' => $usuarios,
            'indicadores' => $indicadores,
        ]);
    }

    public function mostrar(int $idUsuario): JsonResponse
    {
        $usuario = Usuario::query()->with('persona')->findOrFail($idUsuario);

        return response()->json($this->serializar($usuario));
    }

    public function crear(SolicitudGuardarUsuario $solicitud): JsonResponse
    {
        /** @var Usuario $operador */
        $operador = $solicitud->user();
        $usuario = $this->usuarios->crear($solicitud->validated(), (int) $operador->getKey());
        $this->accesos->olvidarMemoria($usuario);

        $this->auditoria->registrar(
            $solicitud,
            'usuario',
            $usuario->getKey(),
            'CREAR',
            null,
            $this->serializar($usuario),
        );

        return response()->json($this->serializar($usuario), 201);
    }

    public function actualizar(SolicitudGuardarUsuario $solicitud, int $idUsuario): JsonResponse
    {
        $usuario = Usuario::query()->with('persona')->findOrFail($idUsuario);
        $antes = $this->serializar($usuario);

        /** @var Usuario $operador */
        $operador = $solicitud->user();

        if ((int) $usuario->getKey() === (int) $operador->getKey()
            && array_key_exists('estado', $solicitud->validated())
            && ! $solicitud->boolean('estado')
        ) {
            throw ValidationException::withMessages([
                'estado' => 'No puedes desactivar tu propia cuenta.',
            ]);
        }

        $usuario = $this->usuarios->actualizar($usuario, $solicitud->validated(), (int) $operador->getKey());
        $this->accesos->olvidarMemoria($usuario);

        $this->auditoria->registrar(
            $solicitud,
            'usuario',
            $usuario->getKey(),
            'EDITAR',
            $antes,
            $this->serializar($usuario),
        );

        return response()->json($this->serializar($usuario));
    }

    public function cambiarEstado(Request $solicitud, int $idUsuario): JsonResponse
    {
        $solicitud->validate([
            'estado' => ['required', 'boolean'],
        ]);

        $usuario = Usuario::query()->with('persona')->findOrFail($idUsuario);
        $antes = $this->serializar($usuario);

        /** @var Usuario $operador */
        $operador = $solicitud->user();
        $usuario = $this->usuarios->cambiarEstado(
            $usuario,
            $solicitud->boolean('estado'),
            (int) $operador->getKey(),
        );
        $this->accesos->olvidarMemoria($usuario);

        $this->auditoria->registrar(
            $solicitud,
            'usuario',
            $usuario->getKey(),
            $usuario->estado ? 'ACTIVAR' : 'DESACTIVAR',
            $antes,
            $this->serializar($usuario),
        );

        return response()->json($this->serializar($usuario));
    }

    private function contarPorRol(string $codigoRol): int
    {
        return DB::table('usuario_rol as ur')
            ->join('rol as r', 'r.id_rol', '=', 'ur.id_rol')
            ->join('usuario as u', 'u.id_usuario', '=', 'ur.id_usuario')
            ->where('r.codigo_rol', $codigoRol)
            ->where('ur.permitido', 1)
            ->where('r.estado', 1)
            ->where('u.estado', 1)
            ->where(fn ($c) => $c->whereNull('ur.fecha_inicio')->orWhereDate('ur.fecha_inicio', '<=', now()))
            ->where(fn ($c) => $c->whereNull('ur.fecha_fin')->orWhereDate('ur.fecha_fin', '>=', now()))
            ->count(DB::raw('DISTINCT ur.id_usuario'));
    }

    /**
     * @return array<string, mixed>
     */
    private function serializar(Usuario $usuario): array
    {
        $usuario->loadMissing('persona');
        $roles = $this->accesos->roles($usuario);
        $codigoRol = $roles[0] ?? null;
        $nombreRol = $codigoRol
            ? Rol::query()->where('codigo_rol', $codigoRol)->value('nombre_rol')
            : null;

        return [
            'id' => (int) $usuario->getKey(),
            'nombre_usuario' => $usuario->nombre_usuario,
            'nombre' => $usuario->nombreCompleto(),
            'nombres' => $usuario->persona?->nombres,
            'apellidos' => $usuario->persona?->apellidos,
            'tipo_documento' => $usuario->persona?->tipo_documento,
            'numero_documento' => $usuario->persona?->numero_documento,
            'correo' => $usuario->persona?->correo,
            'telefono' => $usuario->persona?->telefono,
            'estado' => (bool) $usuario->estado,
            'bloqueado' => $usuario->estaBloqueado(),
            'codigo_rol' => $codigoRol,
            'rol' => $nombreRol,
            'roles' => $roles,
            'ultimo_inicio_sesion' => $usuario->ultimo_inicio_sesion?->toIso8601String(),
            'creado_en' => $usuario->creado_en?->toIso8601String(),
        ];
    }
}
