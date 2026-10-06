<?php

namespace App\Clinica\Http\Controladores;

use App\Clinica\Http\RespondeOperacion;
use App\Clinica\Pacientes\ServicioPacientes;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControladorPacientes extends Controller
{
    use RespondeOperacion;

    public function __construct(private readonly ServicioPacientes $pacientes) {}

    public function listar(Request $solicitud): JsonResponse
    {
        return response()->json([
            'data' => $this->pacientes->listar(
                $solicitud->query('q'),
                $solicitud->query('estado'),
            ),
        ]);
    }

    public function mostrar(int $idPaciente): JsonResponse
    {
        return response()->json($this->pacientes->mostrar($idPaciente));
    }

    public function crear(Request $solicitud): JsonResponse
    {
        $datos = $solicitud->validate([
            'nombres' => ['required', 'string', 'max:180'],
            'apellidoPaterno' => ['nullable', 'string', 'max:120'],
            'apellidoMaterno' => ['nullable', 'string', 'max:120'],
            'tipoDocumento' => ['nullable', 'string', 'max:20'],
            'numeroDocumento' => ['nullable', 'string', 'max:20'],
            'dni' => ['nullable', 'string', 'max:20'],
            'fechaNacimiento' => ['nullable', 'date'],
            'nacimiento' => ['nullable', 'date'],
            'sexo' => ['nullable', 'string', 'max:20'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'celular' => ['nullable', 'string', 'max:30'],
            'correo' => ['nullable', 'email', 'max:150'],
            'email' => ['nullable', 'email', 'max:150'],
            'direccion' => ['nullable', 'string', 'max:250'],
            'ocupacion' => ['nullable', 'string', 'max:120'],
            'observaciones' => ['nullable', 'string'],
        ]);

        $paciente = $this->operacion(fn () => $this->pacientes->crear($datos));

        return response()->json($paciente, 201);
    }

    public function actualizar(Request $solicitud, int $idPaciente): JsonResponse
    {
        $datos = $solicitud->validate([
            'nombres' => ['required', 'string', 'max:180'],
            'apellidoPaterno' => ['nullable', 'string', 'max:120'],
            'apellidoMaterno' => ['nullable', 'string', 'max:120'],
            'apellidos' => ['nullable', 'string', 'max:120'],
            'tipoDocumento' => ['nullable', 'string', 'max:20'],
            'numeroDocumento' => ['nullable', 'string', 'max:20'],
            'dni' => ['nullable', 'string', 'max:20'],
            'fechaNacimiento' => ['nullable', 'date'],
            'sexo' => ['nullable', 'string', 'max:20'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'celular' => ['nullable', 'string', 'max:30'],
            'correo' => ['nullable', 'email', 'max:150'],
            'direccion' => ['nullable', 'string', 'max:250'],
            'domicilio' => ['nullable', 'string', 'max:250'],
            'ocupacion' => ['nullable', 'string', 'max:120'],
            'estado' => ['nullable', 'string', 'max:40'],
            'gradoInstruccion' => ['nullable', 'string', 'max:40'],
            'estadoCivil' => ['nullable', 'string', 'max:40'],
            'departamento' => ['nullable', 'string', 'max:80'],
            'provincia' => ['nullable', 'string', 'max:80'],
            'distrito' => ['nullable', 'string', 'max:80'],
            'modalidadAsistencia' => ['nullable', 'string', 'max:30'],
        ]);

        return response()->json($this->operacion(fn () => $this->pacientes->actualizar($idPaciente, $datos)));
    }
}
