<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SolicitudGuardarConfiguracion extends FormRequest
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
            'valores' => ['required', 'array', 'min:1'],
            'valores.*' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'valores.required' => 'Envía al menos un parametro a actualizar.',
        ];
    }

    /**
     * @return array<string, string|null>
     */
    public function valores(): array
    {
        /** @var array<string, mixed> $valores */
        $valores = $this->input('valores', []);

        return array_map(
            fn ($valor) => $valor === null ? null : (string) $valor,
            $valores,
        );
    }
}
