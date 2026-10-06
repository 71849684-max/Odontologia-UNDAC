<?php

namespace App\Identidad\Http\Solicitudes\Admin;

use App\Identidad\Dominio\ClaveCuenta;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use InvalidArgumentException;

class SolicitudGuardarUsuario extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $esCreacion = $this->isMethod('POST');
        $clave = (string) $this->route('idUsuario');

        return [
            'nombre_usuario' => [
                'required',
                'string',
                'max:120',
                function (string $atributo, mixed $valor, \Closure $fallo) use ($clave): void {
                    $ocupado = DB::table('usuario_alumno')->where('nombre_usuario', $valor)->when(
                        $this->tipoDe($clave) === 'ALUMNO',
                        fn ($q) => $q->where('id_usuario_alumno', '!=', $this->idDe($clave)),
                    )->exists()
                        || DB::table('usuario_docente')->where('nombre_usuario', $valor)->when(
                            $this->tipoDe($clave) === 'DOCENTE',
                            fn ($q) => $q->where('id_usuario_docente', '!=', $this->idDe($clave)),
                        )->exists();

                    if ($ocupado) {
                        $fallo('Ese correo institucional ya esta en uso.');
                    }
                },
            ],
            'contrasena' => [$esCreacion ? 'required' : 'nullable', 'string', 'min:8', 'max:255'],
            'estado' => ['sometimes', 'boolean'],
            'codigo_rol' => ['required', 'string', Rule::exists('rol', 'codigo_rol')->where('estado', 1)],
            'tipo_documento' => ['required', 'string', 'max:20'],
            'numero_documento' => [
                'required',
                'string',
                'max:20',
                function (string $atributo, mixed $valor, \Closure $fallo): void {
                    $tipo = (string) $this->input('tipo_documento');
                    $clave = (string) $this->route('idUsuario');
                    $tipoCuenta = $this->tipoDe($clave);
                    $idActor = $clave !== ''
                        ? app(RepositorioUsuarios::class)->idActorDe($clave)
                        : null;

                    $enAlumno = DB::table('alumno')
                        ->where('tipo_documento', $tipo)
                        ->where('numero_documento', $valor)
                        ->when($tipoCuenta === 'ALUMNO' && $idActor, fn ($q) => $q->where('id_alumno', '!=', $idActor))
                        ->exists();
                    $enDocente = DB::table('docente')
                        ->where('tipo_documento', $tipo)
                        ->where('numero_documento', $valor)
                        ->when($tipoCuenta === 'DOCENTE' && $idActor, fn ($q) => $q->where('id_docente', '!=', $idActor))
                        ->exists();

                    if ($enAlumno || $enDocente) {
                        $fallo('Ya existe una persona con ese documento.');
                    }
                },
            ],
            'nombres' => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:120'],
            'correo' => ['nullable', 'email', 'max:150'],
            'telefono' => ['nullable', 'string', 'max:30'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre_usuario.required' => 'Ingresa el correo institucional.',
            'contrasena.required' => 'Define una contrasena inicial.',
            'contrasena.min' => 'La contrasena debe tener al menos 8 caracteres.',
            'codigo_rol.required' => 'Selecciona un rol.',
            'codigo_rol.exists' => 'El rol indicado no existe o esta inactivo.',
            'nombres.required' => 'Ingresa los nombres.',
            'apellidos.required' => 'Ingresa los apellidos.',
        ];
    }

    private function tipoDe(string $clave): ?string
    {
        try {
            return ClaveCuenta::partes($clave)[0];
        } catch (InvalidArgumentException) {
            return null;
        }
    }

    private function idDe(string $clave): int
    {
        try {
            return ClaveCuenta::partes($clave)[1];
        } catch (InvalidArgumentException) {
            return 0;
        }
    }
}
