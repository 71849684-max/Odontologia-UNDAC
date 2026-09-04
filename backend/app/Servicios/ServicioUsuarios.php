<?php

namespace App\Servicios;

use App\Models\Persona;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Altas y cambios de cuentas institucionales desde el modulo de administracion.
 */
class ServicioUsuarios
{
    /**
     * @param  array<string, mixed>  $datos
     */
    public function crear(array $datos, int $idOperador): Usuario
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

    /**
     * @param  array<string, mixed>  $datos
     */
    public function actualizar(Usuario $usuario, array $datos, int $idOperador): Usuario
    {
        return DB::transaction(function () use ($usuario, $datos, $idOperador) {
            $persona = $usuario->persona;

            if ($persona === null) {
                throw ValidationException::withMessages([
                    'nombres' => 'El usuario no tiene una persona asociada.',
                ]);
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

    public function cambiarEstado(Usuario $usuario, bool $estado, int $idOperador): Usuario
    {
        if ((int) $usuario->getKey() === $idOperador && ! $estado) {
            throw ValidationException::withMessages([
                'estado' => 'No puedes desactivar tu propia cuenta.',
            ]);
        }

        $usuario->forceFill([
            'estado' => $estado,
            'actualizado_por' => $idOperador,
        ])->save();

        return $usuario->fresh(['persona']);
    }

    private function asignarRolUnico(Usuario $usuario, string $codigoRol, int $idOperador): void
    {
        $idRol = Rol::query()
            ->where('codigo_rol', $codigoRol)
            ->where('estado', 1)
            ->value('id_rol');

        if ($idRol === null) {
            throw ValidationException::withMessages([
                'codigo_rol' => 'El rol indicado no existe o esta inactivo.',
            ]);
        }

        // Un solo rol vigente por cuenta: se revocan los demas y se asegura el elegido.
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
}
