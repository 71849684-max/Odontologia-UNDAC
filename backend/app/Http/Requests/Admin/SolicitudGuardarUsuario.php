<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $idUsuario = $this->route('idUsuario');
        $esCreacion = $this->isMethod('POST');

        return [
            'nombre_usuario' => [
                'required',
                'string',
                'max:80',
                Rule::unique('usuario', 'nombre_usuario')->ignore($idUsuario, 'id_usuario'),
            ],
            'contrasena' => [$esCreacion ? 'required' : 'nullable', 'string', 'min:8', 'max:255'],
            'estado' => ['sometimes', 'boolean'],
            'codigo_rol' => ['required', 'string', Rule::exists('rol', 'codigo_rol')->where('estado', 1)],
            'tipo_documento' => ['required', 'string', 'max:20'],
            'numero_documento' => [
                'required',
                'string',
                'max:20',
                Rule::unique('persona', 'numero_documento')
                    ->where(fn ($consulta) => $consulta->where('tipo_documento', $this->input('tipo_documento')))
                    ->ignore($this->idPersonaActual(), 'id_persona'),
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
            'nombre_usuario.unique' => 'Ese correo institucional ya esta en uso.',
            'contrasena.required' => 'Define una contrasena inicial.',
            'contrasena.min' => 'La contrasena debe tener al menos 8 caracteres.',
            'codigo_rol.required' => 'Selecciona un rol.',
            'codigo_rol.exists' => 'El rol indicado no existe o esta inactivo.',
            'numero_documento.unique' => 'Ya existe una persona con ese documento.',
            'nombres.required' => 'Ingresa los nombres.',
            'apellidos.required' => 'Ingresa los apellidos.',
        ];
    }

    private function idPersonaActual(): ?int
    {
        $idUsuario = $this->route('idUsuario');

        if ($idUsuario === null) {
            return null;
        }

        $idPersona = \App\Models\Usuario::query()
            ->whereKey($idUsuario)
            ->value('id_persona');

        return $idPersona === null ? null : (int) $idPersona;
    }
}
