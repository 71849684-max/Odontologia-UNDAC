<?php

namespace App\Clinica\Http\Controladores;

use App\Clinica\Http\RespondeOperacion;
use App\Clinica\Pacientes\ServicioPacientes;
use App\Http\Controllers\Controller;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ControladorPacientes extends Controller
{
    use RespondeOperacion;

    private const TIPOS_DOCUMENTO = ['DNI', 'CE', 'PAS'];

    public function __construct(private readonly ServicioPacientes $pacientes) {}

    public function listar(Request $solicitud): JsonResponse
    {
        $filtros = $solicitud->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'estado' => ['nullable', 'string', 'max:40'],
        ]);

        return response()->json([
            'data' => $this->pacientes->listar(
                $filtros['q'] ?? null,
                $filtros['estado'] ?? null,
                $solicitud->user(),
            ),
        ]);
    }

    public function buscar(Request $solicitud): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'documento' => ['required', 'string', 'max:20'],
            'tipoDocumento' => ['nullable', 'string', Rule::in(self::TIPOS_DOCUMENTO)],
        ]);

        $paciente = $this->pacientes->buscarPorDocumento(
            $datos['documento'],
            $datos['tipoDocumento'] ?? 'DNI',
            $actor,
        );

        if ($paciente === null) {
            abort(404, 'Paciente no encontrado.');
        }

        return response()->json($paciente);
    }

    public function mostrar(Request $solicitud, int $idPaciente): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();

        return response()->json($this->pacientes->mostrar($idPaciente, $actor));
    }

    public function crear(Request $solicitud): JsonResponse
    {
        $datos = $solicitud->validate([
            'nombres' => ['required', 'string', 'max:180'],
            'apellidoPaterno' => ['required', 'string', 'max:120'],
            'apellidoMaterno' => ['nullable', 'string', 'max:120'],
            'tipoDocumento' => ['nullable', 'string', Rule::in(self::TIPOS_DOCUMENTO)],
            'numeroDocumento' => ['required_without:dni', 'nullable', 'string', 'max:20'],
            'dni' => ['nullable', 'string', 'max:20'],
            'fechaNacimiento' => ['nullable', 'date', 'before_or_equal:today'],
            'nacimiento' => ['nullable', 'date', 'before_or_equal:today'],
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
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'nombres' => ['required', 'string', 'max:180'],
            'apellidoPaterno' => ['nullable', 'string', 'max:120'],
            'apellidoMaterno' => ['nullable', 'string', 'max:120'],
            'apellidos' => ['nullable', 'string', 'max:120'],
            'tipoDocumento' => ['nullable', 'string', Rule::in(self::TIPOS_DOCUMENTO)],
            'numeroDocumento' => ['nullable', 'string', 'max:20'],
            'dni' => ['nullable', 'string', 'max:20'],
            'fechaNacimiento' => ['nullable', 'date', 'before_or_equal:today'],
            'sexo' => ['nullable', 'string', 'max:20'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'celular' => ['nullable', 'string', 'max:30'],
            'correo' => ['nullable', 'email', 'max:150'],
            'direccion' => ['nullable', 'string', 'max:250'],
            'domicilio' => ['nullable', 'string', 'max:250'],
            'ocupacion' => ['nullable', 'string', 'max:120'],
            'observaciones' => ['nullable', 'string', 'max:5000'],
            'estado' => ['nullable', 'string', 'max:40'],
            'gradoInstruccion' => ['nullable', 'string', 'max:40'],
            'estadoCivil' => ['nullable', 'string', 'max:40'],
            'departamento' => ['nullable', 'string', 'max:80'],
            'provincia' => ['nullable', 'string', 'max:80'],
            'distrito' => ['nullable', 'string', 'max:80'],
            'modalidadAsistencia' => ['nullable', 'string', 'max:30'],
            'lugarNacimiento' => ['nullable', 'string', 'max:150'],
            'procedencia' => ['nullable', 'string', 'max:150'],
            'centroEstudios' => ['nullable', 'string', 'max:150'],
            'idioma' => ['nullable', 'string', 'max:80'],
            'religion' => ['nullable', 'string', 'max:80'],
            'lugarTrabajo' => ['nullable', 'string', 'max:150'],
            'tiempoResidencia' => ['nullable', 'string', 'max:80'],
            'domicilioRegistro2' => ['nullable', 'string', 'max:250'],
            'telefonoRegistro2' => ['nullable', 'string', 'max:30'],
        ]);

        return response()->json($this->operacion(fn () => $this->pacientes->actualizar($idPaciente, $datos, $actor)));
    }
}
