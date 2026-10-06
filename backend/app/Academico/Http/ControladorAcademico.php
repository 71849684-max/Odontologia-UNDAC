<?php

namespace App\Academico\Http;

use App\Academico\ServicioAcademico;
use App\Clinica\Http\RespondeOperacion;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControladorAcademico extends Controller
{
    use RespondeOperacion;

    public function __construct(private readonly ServicioAcademico $academico) {}

    public function estado(): JsonResponse
    {
        return response()->json($this->academico->estado());
    }

    public function crearPeriodo(Request $solicitud): JsonResponse
    {
        $datos = $this->validarPeriodo($solicitud);

        return response()->json($this->operacion(fn () => $this->academico->crearPeriodo($datos)), 201);
    }

    public function crearCurso(Request $solicitud): JsonResponse
    {
        return response()->json($this->operacion(fn () => $this->academico->crearCurso($this->validarCurso($solicitud))), 201);
    }

    public function actualizarCurso(Request $solicitud, int $idCurso): JsonResponse
    {
        return response()->json($this->operacion(fn () => $this->academico->actualizarCurso($idCurso, $this->validarCurso($solicitud))));
    }

    public function crearGrupo(Request $solicitud): JsonResponse
    {
        return response()->json($this->operacion(fn () => $this->academico->crearGrupo($this->validarGrupo($solicitud))), 201);
    }

    public function actualizarGrupo(Request $solicitud, int $idGrupo): JsonResponse
    {
        return response()->json($this->operacion(fn () => $this->academico->actualizarGrupo($idGrupo, $this->validarGrupo($solicitud))));
    }

    public function membresias(Request $solicitud, int $idGrupo): JsonResponse
    {
        $datos = $solicitud->validate([
            'membresias' => ['required', 'array'],
            'membresias.*.personaId' => ['required', 'string'],
            'membresias.*.fechaInicio' => ['nullable', 'date'],
            'membresias.*.fechaFin' => ['nullable', 'date'],
        ]);

        return response()->json($this->operacion(fn () => $this->academico->guardarMembresias($idGrupo, $datos['membresias'])), 201);
    }

    public function finalizarMembresia(Request $solicitud, int $idMembresia): JsonResponse
    {
        $datos = $solicitud->validate(['fechaFin' => ['required', 'date']]);

        return response()->json($this->operacion(fn () => $this->academico->finalizarMembresia($idMembresia, $datos['fechaFin'])));
    }

    public function crearRotacion(Request $solicitud): JsonResponse
    {
        $datos = $solicitud->validate([
            'grupoId' => ['required', 'integer'],
            'cursoId' => ['required', 'integer'],
            'periodoId' => ['required', 'integer'],
            'fechaInicio' => ['required', 'date'],
            'fechaFin' => ['required', 'date'],
            'estado' => ['nullable', 'string', 'max:30'],
        ]);

        return response()->json($this->operacion(fn () => $this->academico->crearRotacion($datos)), 201);
    }

    public function docentesRotacion(Request $solicitud, int $idRotacion): JsonResponse
    {
        $datos = $solicitud->validate([
            'docentes' => ['required', 'array'],
            'docentes.*.personaId' => ['required', 'string'],
            'docentes.*.funcion' => ['nullable', 'string', 'max:40'],
        ]);

        return response()->json($this->operacion(fn () => $this->academico->guardarDocentes($idRotacion, $datos['docentes'])), 201);
    }

    public function asignaciones(Request $solicitud, int $idRotacion): JsonResponse
    {
        $datos = $solicitud->validate([
            'personas' => ['required', 'array'],
            'personas.*.personaId' => ['required', 'string'],
        ]);

        return response()->json($this->operacion(fn () => $this->academico->guardarAsignaciones($idRotacion, $datos['personas'])), 201);
    }

    private function validarPeriodo(Request $solicitud): array
    {
        return $solicitud->validate([
            'codigo' => ['required', 'string', 'max:30'],
            'nombre' => ['required', 'string', 'max:120'],
            'fechaInicio' => ['required', 'date'],
            'fechaFin' => ['required', 'date'],
            'estado' => ['nullable', 'string', 'max:20'],
        ]);
    }

    private function validarCurso(Request $solicitud): array
    {
        return $solicitud->validate([
            'codigo' => ['required', 'string', 'max:30'],
            'nombre' => ['required', 'string', 'max:120'],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'estado' => ['nullable', 'string', 'max:20'],
        ]);
    }

    private function validarGrupo(Request $solicitud): array
    {
        return $solicitud->validate([
            'codigo' => ['required', 'string', 'max:30'],
            'nombre' => ['required', 'string', 'max:120'],
            'semestre' => ['required', 'string', 'max:30'],
            'estado' => ['nullable', 'string', 'max:20'],
        ]);
    }
}
