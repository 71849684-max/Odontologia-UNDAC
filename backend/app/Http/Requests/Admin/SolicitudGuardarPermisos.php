<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SolicitudGuardarPermisos extends FormRequest
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
        return [
            'permisos' => ['required', 'array'],
            'permisos.*' => ['integer', 'distinct', 'exists:permiso,id_permiso'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'permisos.required' => 'Envía la lista de permisos efectivos deseados.',
            'permisos.*.exists' => 'Uno de los permisos indicados no existe.',
        ];
    }

    /**
     * @return list<int>
     */
    public function idsPermisos(): array
    {
        return array_map('intval', $this->input('permisos', []));
    }
}
