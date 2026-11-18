<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\ClaveCuenta;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use InvalidArgumentException;

class RepositorioUsuariosEloquent implements RepositorioUsuarios
{
    public function buscarPorNombre(string $nombreUsuario): ?Cuenta
    {
        $fila = $this->consulta('ALUMNO')->where('ua.nombre_usuario', $nombreUsuario)->first()
            ?? $this->consulta('DOCENTE')->where('ua.nombre_usuario', $nombreUsuario)->first();

        return $fila === null ? null : CuentaSistema::desdeFila($fila);
    }

    public function buscarPorId(string $clave): Cuenta
    {
        try {
            [$tipo, $id] = ClaveCuenta::partes($clave);
        } catch (InvalidArgumentException) {
            throw (new ModelNotFoundException)->setModel(CuentaSistema::class, [$clave]);
        }

        $fila = $this->consulta($tipo)->where('ua.'.$this->columnaUsuario($tipo), $id)->first();

        if ($fila === null) {
            throw (new ModelNotFoundException)->setModel(CuentaSistema::class, [$clave]);
        }

        return CuentaSistema::desdeFila($fila);
    }

    public function idActorDe(string $clave): ?int
    {
        try {
            return $this->buscarPorId($clave)->idActor();
        } catch (ModelNotFoundException) {
            return null;
        }
    }

    public function listar(array $filtros): array
    {
        $busqueda = trim((string) ($filtros['q'] ?? ''));
        $rol = trim((string) ($filtros['rol'] ?? ''));
        $estado = $filtros['estado'] ?? null;

        $filas = collect(['ALUMNO', 'DOCENTE'])->flatMap(function (string $tipo) use ($busqueda, $rol, $estado) {
            $consulta = $this->consulta($tipo);

            if ($busqueda !== '') {
                $consulta->where(function ($q) use ($busqueda) {
                    $q->where('ua.nombre_usuario', 'like', "%{$busqueda}%")
                        ->orWhere('a.nombres', 'like', "%{$busqueda}%")
                        ->orWhere('a.apellidos', 'like', "%{$busqueda}%")
                        ->orWhere('a.numero_documento', 'like', "%{$busqueda}%")
                        ->orWhere('a.correo', 'like', "%{$busqueda}%");
                });
            }

            if ($estado !== null && $estado !== '') {
                $consulta->where('ua.estado', filter_var($estado, FILTER_VALIDATE_BOOLEAN) ? 1 : 0);
            }

            if ($rol !== '') {
                $consulta->where('r.codigo_rol', $rol);
            }

            return $consulta->get();
        });

        return $filas
            ->sortByDesc(fn ($fila) => $fila->creado_en)
            ->take(200)
            ->map(fn ($fila) => $this->serializar(CuentaSistema::desdeFila($fila)))
            ->values()
            ->all();
    }

    public function indicadores(): array
    {
        return [
            'total' => DB::table('usuario_alumno')->count() + DB::table('usuario_docente')->count(),
            'activos' => DB::table('usuario_alumno')->where('estado', 1)->count()
                + DB::table('usuario_docente')->where('estado', 1)->count(),
            'alumnos' => DB::table('usuario_alumno')->where('estado', 1)->count(),
            'docentes' => $this->contarDocentesPorRol('DOCENTE'),
            'administradores' => $this->contarDocentesPorRol('ADMINISTRADOR'),
            'administrativos' => 0,
        ];
    }

    public function crear(array $datos, int $idOperador): Cuenta
    {
        $rol = $this->rolActivo((string) $datos['codigo_rol']);
        $tipo = (string) $rol->tipo_usuario;

        try {
            $idUsuario = DB::transaction(function () use ($datos, $rol, $tipo) {
                $tablaActor = $tipo === 'ALUMNO' ? 'alumno' : 'docente';
                $columnaActor = $tipo === 'ALUMNO' ? 'id_alumno' : 'id_docente';
                $columnaCodigo = $tipo === 'ALUMNO' ? 'codigo_alumno' : 'codigo_docente';

                $actor = [
                    $columnaCodigo => $this->codigoDisponible($tablaActor, $columnaCodigo, $tipo, (string) $datos['numero_documento']),
                    'tipo_documento' => $datos['tipo_documento'],
                    'numero_documento' => $datos['numero_documento'],
                    'nombres' => $datos['nombres'],
                    'apellidos' => $datos['apellidos'],
                    'correo' => $datos['correo'] ?? null,
                    'telefono' => $datos['telefono'] ?? null,
                    ...($tipo === 'DOCENTE' ? ['numero_colegiatura' => $datos['numero_colegiatura'] ?? null] : []),
                    'estado' => 1,
                    'creado_en' => now(),
                ];

                $idActor = DB::table($tablaActor)->insertGetId($actor);

                return DB::table($tipo === 'ALUMNO' ? 'usuario_alumno' : 'usuario_docente')->insertGetId([
                    $columnaActor => $idActor,
                    'id_rol' => $rol->id_rol,
                    'nombre_usuario' => $datos['nombre_usuario'],
                    'contrasena_hash' => Hash::make($datos['contrasena']),
                    'estado' => array_key_exists('estado', $datos) ? ($datos['estado'] ? 1 : 0) : 1,
                    'contrasena_cambiada_en' => now(),
                    'intentos_fallidos' => 0,
                    'creado_en' => now(),
                ]);
            });
        } catch (QueryException $excepcion) {
            throw $this->traducirRestriccion($excepcion);
        }

        return $this->buscarPorId(ClaveCuenta::de($tipo, $idUsuario));
    }

    public function actualizar(Cuenta $cuenta, array $datos, int $idOperador): Cuenta
    {
        $actual = $this->comoCuenta($cuenta);
        $rol = $this->rolActivo((string) $datos['codigo_rol']);

        if ((string) $rol->tipo_usuario !== $actual->tipoCuenta()) {
            return $this->trasladarCuenta($actual, $datos, $rol);
        }

        try {
            DB::transaction(function () use ($actual, $datos, $rol) {
                DB::table($actual->tablaActor())->where($actual->columnaActor(), $actual->idActor())->update([
                    'tipo_documento' => $datos['tipo_documento'],
                    'numero_documento' => $datos['numero_documento'],
                    'nombres' => $datos['nombres'],
                    'apellidos' => $datos['apellidos'],
                    'correo' => $datos['correo'] ?? null,
                    'telefono' => $datos['telefono'] ?? null,
                    ...($actual->tipoCuenta() === 'DOCENTE' && array_key_exists('numero_colegiatura', $datos) ? ['numero_colegiatura' => $datos['numero_colegiatura'] ?? null] : []),
                ]);

                $cambios = [
                    'nombre_usuario' => $datos['nombre_usuario'],
                    'id_rol' => $rol->id_rol,
                ];

                if (array_key_exists('estado', $datos)) {
                    $cambios['estado'] = $datos['estado'] ? 1 : 0;
                }

                if (! empty($datos['contrasena'])) {
                    $cambios['contrasena_hash'] = Hash::make($datos['contrasena']);
                    $cambios['contrasena_cambiada_en'] = now();
                    $cambios['intentos_fallidos'] = 0;
                    $cambios['bloqueado_hasta'] = null;
                }

                DB::table($actual->tablaCuenta())->where($actual->columnaId(), $actual->id())->update($cambios);
            });
        } catch (QueryException $excepcion) {
            throw $this->traducirRestriccion($excepcion);
        }

        return $this->buscarPorId($actual->clave());
    }

    /** Traslada la identidad de acceso, sin borrar al actor de sus historias anteriores. */
    private function trasladarCuenta(CuentaSistema $actual, array $datos, object $rol): Cuenta
    {
        $tipo = (string) $rol->tipo_usuario;
        $destino = $tipo === 'ALUMNO' ? 'alumno' : 'docente';
        $origen = $actual->tipoCuenta() === 'ALUMNO' ? 'alumno' : 'docente';
        $columnaActor = 'id_'.$destino;
        $columnaCuenta = 'id_usuario_'.$destino;

        try {
            $idNuevo = DB::transaction(function () use ($actual, $datos, $rol, $tipo, $destino, $origen, $columnaActor, $columnaCuenta) {
                $cuenta = DB::table($actual->tablaCuenta())->where($actual->columnaId(), $actual->id())->lockForUpdate()->first();
                if ($cuenta === null) {
                    throw new OperacionNoPermitida('codigo_rol', 'La cuenta cambió. Actualice el listado antes de editarla.');
                }
                $persona = [
                    'codigo_'.$destino => $this->codigoDisponible($destino, 'codigo_'.$destino, $tipo, $datos['numero_documento']),
                    'tipo_documento' => $datos['tipo_documento'],
                    'numero_documento' => $datos['numero_documento'],
                    'nombres' => $datos['nombres'],
                    'apellidos' => $datos['apellidos'],
                    'correo' => $datos['correo'] ?? null,
                    'telefono' => $datos['telefono'] ?? null,
                    ...($tipo === 'DOCENTE' ? ['numero_colegiatura' => $datos['numero_colegiatura'] ?? null] : []),
                    'estado' => 1,
                    'creado_en' => now(),
                ];
                $existente = DB::table($destino)->where('tipo_documento', $datos['tipo_documento'])
                    ->where('numero_documento', $datos['numero_documento'])->lockForUpdate()->first();
                if ($existente !== null) {
                    $idActor = $existente->{$columnaActor};
                    if (DB::table('usuario_'.$destino)->where($columnaActor, $idActor)->exists()) {
                        throw new OperacionNoPermitida('numero_documento', 'La persona ya tiene una cuenta en el rol de destino.');
                    }
                    unset($persona['codigo_'.$destino], $persona['creado_en']);
                    DB::table($destino)->where($columnaActor, $idActor)->update($persona);
                } else {
                    $idActor = DB::table($destino)->insertGetId($persona);
                }

                // Las credenciales dejan de existir en origen antes de insertarlas:
                // los triggers exigen un nombre único entre ambas tablas.
                $accesos = DB::table('usuario_'.$origen.'_submodulo')->where($actual->columnaId(), $actual->id())->get();
                $inicios = DB::table('login_historial_'.$origen)->where($actual->columnaId(), $actual->id())->get();
                DB::table($actual->tablaCuenta())->where($actual->columnaId(), $actual->id())->delete();
                $valores = (array) $cuenta;
                unset($valores[$actual->columnaId()], $valores[$actual->columnaActor()]);
                $valores[$columnaActor] = $idActor;
                $valores['id_rol'] = $rol->id_rol;
                $valores['nombre_usuario'] = $datos['nombre_usuario'];
                $valores['estado'] = array_key_exists('estado', $datos) ? (int) $datos['estado'] : $cuenta->estado;
                if (! empty($datos['contrasena'])) {
                    $valores['contrasena_hash'] = Hash::make($datos['contrasena']);
                    $valores['contrasena_cambiada_en'] = now();
                    $valores['intentos_fallidos'] = 0;
                    $valores['bloqueado_hasta'] = null;
                }
                $id = DB::table('usuario_'.$destino)->insertGetId($valores);
                foreach ($accesos as $acceso) {
                    DB::table('usuario_'.$destino.'_submodulo')->insert([
                        $columnaCuenta => $id, 'id_submodulo' => $acceso->id_submodulo,
                        'permitido' => $acceso->permitido, 'creado_en' => $acceso->creado_en,
                    ]);
                }
                foreach ($inicios as $inicio) {
                    $registro = (array) $inicio;
                    unset($registro['id_login_'.$origen], $registro[$actual->columnaId()]);
                    $registro[$columnaCuenta] = $id;
                    DB::table('login_historial_'.$destino)->insert($registro);
                    DB::table('login_historial_'.$origen)->where('id_login_'.$origen, $inicio->{'id_login_'.$origen})->delete();
                }

                return $id;
            });
        } catch (QueryException $excepcion) {
            throw $this->traducirRestriccion($excepcion);
        }

        return $this->buscarPorId(ClaveCuenta::de($tipo, $idNuevo));
    }

    public function cambiarEstado(Cuenta $cuenta, bool $estado, int $idOperador): Cuenta
    {
        $actual = $this->comoCuenta($cuenta);

        DB::table($actual->tablaCuenta())->where($actual->columnaId(), $actual->id())->update([
            'estado' => $estado ? 1 : 0,
        ]);

        return $this->buscarPorId($actual->clave());
    }

    public function actualizarPerfil(Cuenta $cuenta, array $datos): Cuenta
    {
        $actual = $this->comoCuenta($cuenta);

        DB::table($actual->tablaActor())->where($actual->columnaActor(), $actual->idActor())->update([
            'nombres' => $datos['nombres'],
            'apellidos' => $datos['apellidos'],
            'correo' => $datos['correo'] ?? null,
            'telefono' => $datos['telefono'] ?? null,
        ]);

        return $this->buscarPorId($actual->clave());
    }

    public function cambiarContrasena(Cuenta $cuenta, string $nueva): Cuenta
    {
        $actual = $this->comoCuenta($cuenta);

        DB::table($actual->tablaCuenta())->where($actual->columnaId(), $actual->id())->update([
            'contrasena_hash' => Hash::make($nueva),
            'contrasena_cambiada_en' => now(),
            'intentos_fallidos' => 0,
            'bloqueado_hasta' => null,
        ]);

        return $this->buscarPorId($actual->clave());
    }

    public function registrarInicioExitoso(Cuenta $cuenta): void
    {
        $actual = $this->comoCuenta($cuenta);

        DB::table($actual->tablaCuenta())->where($actual->columnaId(), $actual->id())->update([
            'intentos_fallidos' => 0,
            'bloqueado_hasta' => null,
            'ultimo_inicio_sesion' => now(),
        ]);
    }

    public function acumularFallo(Cuenta $cuenta): void
    {
        $actual = $this->comoCuenta($cuenta);
        $fallos = $actual->intentos_fallidos + 1;

        if ($fallos >= (int) config('acceso.fallos_antes_de_bloqueo')) {
            DB::table($actual->tablaCuenta())->where($actual->columnaId(), $actual->id())->update([
                'intentos_fallidos' => 0,
                'bloqueado_hasta' => now()->addMinutes((int) config('acceso.minutos_de_bloqueo')),
            ]);

            return;
        }

        DB::table($actual->tablaCuenta())->where($actual->columnaId(), $actual->id())->update([
            'intentos_fallidos' => $fallos,
        ]);
    }

    public function serializar(Cuenta $cuenta): array
    {
        $actual = $cuenta instanceof CuentaSistema
            ? $cuenta
            : $this->buscarPorId($cuenta->clave());

        return [
            'id' => $actual->clave(),
            'tipo_usuario' => $actual->tipoCuenta(),
            'nombre_usuario' => $actual->nombreUsuario(),
            'nombre' => $actual->nombreCompleto(),
            'nombres' => $actual->nombres,
            'apellidos' => $actual->apellidos,
            'tipo_documento' => $actual->tipoDocumento,
            'numero_documento' => $actual->numeroDocumento,
            'correo' => $actual->correo(),
            'telefono' => $actual->telefono,
            'numero_colegiatura' => $cuenta->tipoCuenta() === 'DOCENTE' ? DB::table('docente')->where('id_docente', $cuenta->idActor())->value('numero_colegiatura') : null,
            'estado' => $actual->estaActiva(),
            'bloqueado' => $actual->estaBloqueada(),
            'codigo_rol' => $actual->codigoRol,
            'rol' => $actual->nombreRol,
            'roles' => [$actual->codigoRol],
            'ultimo_inicio_sesion' => $actual->ultimoInicioSesionIso(),
            'creado_en' => $actual->creado_en?->toIso8601String(),
        ];
    }

    private function consulta(string $tipo)
    {
        $tablaUsuario = $tipo === 'ALUMNO' ? 'usuario_alumno' : 'usuario_docente';
        $tablaActor = $tipo === 'ALUMNO' ? 'alumno' : 'docente';
        $columnaUsuario = $this->columnaUsuario($tipo);
        $columnaActor = $tipo === 'ALUMNO' ? 'id_alumno' : 'id_docente';

        return DB::table($tablaUsuario.' as ua')
            ->join($tablaActor.' as a', 'a.'.$columnaActor, '=', 'ua.'.$columnaActor)
            ->join('rol as r', 'r.id_rol', '=', 'ua.id_rol')
            ->select([
                'ua.'.$columnaUsuario.' as id_usuario',
                'ua.'.$columnaActor.' as id_actor',
                'ua.id_rol',
                'ua.nombre_usuario',
                'ua.contrasena_hash',
                'ua.estado',
                'ua.bloqueado_hasta',
                'ua.ultimo_inicio_sesion',
                'ua.intentos_fallidos',
                'ua.creado_en',
                'a.nombres',
                'a.apellidos',
                'a.tipo_documento',
                'a.numero_documento',
                'a.correo',
                'a.telefono',
                'r.codigo_rol',
                'r.nombre_rol',
            ])
            ->selectRaw('? as tipo', [$tipo]);
    }

    private function columnaUsuario(string $tipo): string
    {
        return $tipo === 'ALUMNO' ? 'id_usuario_alumno' : 'id_usuario_docente';
    }

    private function rolActivo(string $codigo): object
    {
        $rol = DB::table('rol')->where('codigo_rol', $codigo)->where('estado', 1)->first();

        if ($rol === null) {
            throw new OperacionNoPermitida('codigo_rol', 'El rol indicado no existe o esta inactivo.');
        }

        return $rol;
    }

    private function codigoDisponible(string $tabla, string $columna, string $tipo, string $documento): string
    {
        $base = ($tipo === 'ALUMNO' ? 'ALU-' : 'DOC-').preg_replace('/\W+/', '', $documento);
        $codigo = mb_substr($base, 0, 30);
        $sufijo = 1;

        while (DB::table($tabla)->where($columna, $codigo)->exists()) {
            $codigo = mb_substr($base, 0, 26).'-'.$sufijo;
            $sufijo++;
        }

        return $codigo;
    }

    private function contarDocentesPorRol(string $codigoRol): int
    {
        return DB::table('usuario_docente as ua')
            ->join('rol as r', 'r.id_rol', '=', 'ua.id_rol')
            ->where('r.codigo_rol', $codigoRol)
            ->where('r.estado', 1)
            ->where('ua.estado', 1)
            ->count();
    }

    private function comoCuenta(Cuenta $cuenta): CuentaSistema
    {
        return $cuenta instanceof CuentaSistema ? $cuenta : $this->buscarPorId($cuenta->clave());
    }

    private function traducirRestriccion(QueryException $excepcion): QueryException|OperacionNoPermitida
    {
        $mensaje = $excepcion->getMessage();

        if (str_contains($mensaje, 'uq_usuario_alumno_nombre') || str_contains($mensaje, 'uq_usuario_docente_nombre') || str_contains($mensaje, 'ya existe')) {
            return new OperacionNoPermitida('nombre_usuario', 'Ese correo institucional ya esta en uso.');
        }

        if (str_contains($mensaje, 'uq_alumno_documento') || str_contains($mensaje, 'uq_docente_documento')) {
            return new OperacionNoPermitida('numero_documento', 'Ya existe una persona con ese documento.');
        }

        if (str_contains($mensaje, 'SQLSTATE[45000]')) {
            if (preg_match("/MESSAGE_TEXT = '([^']+)'/", $mensaje, $coincidencia) || preg_match('/1644 (.+)$/', $mensaje, $coincidencia)) {
                return new OperacionNoPermitida('codigo_rol', trim($coincidencia[1]));
            }

            return new OperacionNoPermitida('codigo_rol', 'La cuenta no cumple una regla de la base de datos.');
        }

        return $excepcion;
    }
}
