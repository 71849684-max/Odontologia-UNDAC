<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use App\Identidad\Infraestructura\Persistencia\Eloquent\Persona;
use App\Identidad\Infraestructura\Persistencia\Eloquent\Rol;
use App\Identidad\Infraestructura\Persistencia\Eloquent\Usuario;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RepositorioUsuariosEloquent implements RepositorioUsuarios
{
    public function __construct(private readonly ConsultaAccesos $accesos) {}

    public function buscarPorNombre(string $nombreUsuario): ?Cuenta
    {
        return Usuario::query()->where('nombre_usuario', $nombreUsuario)->first();
    }

    public function buscarPorId(int $idUsuario): Cuenta
    {
        $usuario = Usuario::query()->with('persona')->find($idUsuario);

        if ($usuario === null) {
            throw (new ModelNotFoundException)->setModel(Usuario::class, [$idUsuario]);
        }

        return $usuario;
    }

    public function idPersonaDe(int $idUsuario): ?int
    {
        $idPersona = Usuario::query()->whereKey($idUsuario)->value('id_persona');

        return $idPersona === null ? null : (int) $idPersona;
    }

    public function listar(array $filtros): array
    {
        $busqueda = trim((string) ($filtros['q'] ?? ''));
        $rol = trim((string) ($filtros['rol'] ?? ''));
        $estado = $filtros['estado'] ?? null;

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

        return $consulta->limit(200)->get()->map(fn (Usuario $u) => $this->serializar($u))->all();
    }

    public function indicadores(): array
    {
        return [
            'total' => Usuario::query()->count(),
            'activos' => Usuario::query()->where('estado', 1)->count(),
            'alumnos' => $this->contarPorRol('ALUMNO_OPERADOR'),
            'docentes' => $this->contarPorRol('DOCENTE'),
            'administradores' => $this->contarPorRol('ADMINISTRADOR'),
            'administrativos' => $this->contarPorRol('ADMINISTRATIVO'),
        ];
    }

    public function crear(array $datos, int $idOperador): Cuenta
    {
        return DB::transaction(function () use ($datos, $idOperador) {
            $persona = Persona::create([
                'tipo_documento' => $datos['tipo_documento'],
                'numero_documento' => $datos['numero_documento'],
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'correo' => $datos['correo'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'estado' => true,
                'creado_por' => $idOperador,
            ]);

            $usuario = new Usuario;
            $usuario->forceFill([
                'id_persona' => $persona->getKey(),
                'nombre_usuario' => $datos['nombre_usuario'],
                'contrasena_hash' => Hash::make($datos['contrasena']),
                'estado' => array_key_exists('estado', $datos) ? (bool) $datos['estado'] : true,
                'contrasena_cambiada_en' => now(),
                'intentos_fallidos' => 0,
                'creado_por' => $idOperador,
            ])->save();

            $this->asignarRolUnico($usuario, (string) $datos['codigo_rol'], $idOperador);

            return $usuario->fresh(['persona']);
        });
    }

    public function actualizar(Cuenta $cuenta, array $datos, int $idOperador): Cuenta
    {
        $usuario = ModelosCuenta::usuario($cuenta);

        return DB::transaction(function () use ($usuario, $datos, $idOperador) {
            $persona = $usuario->persona;

            if ($persona === null) {
                throw new OperacionNoPermitida('nombres', 'El usuario no tiene una persona asociada.');
            }

            $persona->fill([
                'tipo_documento' => $datos['tipo_documento'],
                'numero_documento' => $datos['numero_documento'],
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'correo' => $datos['correo'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'actualizado_por' => $idOperador,
            ])->save();

            $cambios = [
                'nombre_usuario' => $datos['nombre_usuario'],
                'actualizado_por' => $idOperador,
            ];

            if (array_key_exists('estado', $datos)) {
                $cambios['estado'] = (bool) $datos['estado'];
            }

            if (! empty($datos['contrasena'])) {
                $cambios['contrasena_hash'] = Hash::make($datos['contrasena']);
                $cambios['contrasena_cambiada_en'] = now();
                $cambios['intentos_fallidos'] = 0;
                $cambios['bloqueado_hasta'] = null;
            }

            $usuario->forceFill($cambios)->save();
            $this->asignarRolUnico($usuario, (string) $datos['codigo_rol'], $idOperador);

            return $usuario->fresh(['persona']);
        });
    }

    public function cambiarEstado(Cuenta $cuenta, bool $estado, int $idOperador): Cuenta
    {
        $usuario = ModelosCuenta::usuario($cuenta);

        $usuario->forceFill([
            'estado' => $estado,
            'actualizado_por' => $idOperador,
        ])->save();

        return $usuario->fresh(['persona']);
    }

    public function registrarInicioExitoso(Cuenta $cuenta): void
    {
        ModelosCuenta::usuario($cuenta)->forceFill([
            'intentos_fallidos' => 0,
            'bloqueado_hasta' => null,
            'ultimo_inicio_sesion' => now(),
        ])->save();
    }

    public function acumularFallo(Cuenta $cuenta): void
    {
        $usuario = ModelosCuenta::usuario($cuenta);
        $fallos = (int) $usuario->intentos_fallidos + 1;

        if ($fallos >= (int) config('acceso.fallos_antes_de_bloqueo')) {
            $usuario->forceFill([
                'intentos_fallidos' => 0,
                'bloqueado_hasta' => now()->addMinutes((int) config('acceso.minutos_de_bloqueo')),
            ])->save();

            return;
        }

        $usuario->forceFill(['intentos_fallidos' => $fallos])->save();
    }

    public function serializar(Cuenta $cuenta): array
    {
        $usuario = ModelosCuenta::usuario($cuenta);
        $usuario->loadMissing('persona');
        $roles = $this->accesos->roles($usuario);
        $codigoRol = $roles[0] ?? null;
        $nombreRol = $codigoRol
            ? Rol::query()->where('codigo_rol', $codigoRol)->value('nombre_rol')
            : null;

        return [
            'id' => $usuario->id(),
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

    private function asignarRolUnico(Usuario $usuario, string $codigoRol, int $idOperador): void
    {
        $idRol = Rol::query()
            ->where('codigo_rol', $codigoRol)
            ->where('estado', 1)
            ->value('id_rol');

        if ($idRol === null) {
            throw new OperacionNoPermitida('codigo_rol', 'El rol indicado no existe o esta inactivo.');
        }

        DB::table('usuario_rol')
            ->where('id_usuario', $usuario->getKey())
            ->where('id_rol', '!=', $idRol)
            ->update(['permitido' => 0]);

        $existente = DB::table('usuario_rol')
            ->where('id_usuario', $usuario->getKey())
            ->where('id_rol', $idRol)
            ->first();

        if ($existente === null) {
            DB::table('usuario_rol')->insert([
                'id_usuario' => $usuario->getKey(),
                'id_rol' => $idRol,
                'permitido' => 1,
                'fecha_inicio' => null,
                'fecha_fin' => null,
                'asignado_en' => now(),
                'asignado_por' => $idOperador,
            ]);

            return;
        }

        DB::table('usuario_rol')
            ->where('id_usuario_rol', $existente->id_usuario_rol)
            ->update([
                'permitido' => 1,
                'fecha_inicio' => null,
                'fecha_fin' => null,
                'asignado_por' => $idOperador,
            ]);
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
}
