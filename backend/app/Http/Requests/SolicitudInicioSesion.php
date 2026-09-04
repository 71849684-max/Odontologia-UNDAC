<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SolicitudInicioSesion extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'nombre_usuario' => ['required', 'string', 'max:80'],
            'contrasena' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre_usuario.required' => 'Ingresa tu usuario.',
            'contrasena.required' => 'Ingresa tu contrasena.',
        ];
    }

    public function nombreUsuario(): string
    {
        return trim((string) $this->input('nombre_usuario'));
    }

    public function contrasena(): string
    {
        return (string) $this->input('contrasena');
    }

    /**
     * Clave del limitador: usuario + IP, para que un atacante no pueda bloquear
     * a un usuario legitimo desde otra direccion.
     */
    public function claveLimitador(): string
    {
        return 'inicio-sesion|'.mb_strtolower($this->nombreUsuario()).'|'.$this->ip();
    }
}
