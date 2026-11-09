<?php

namespace App\Academico\Http;

use App\Academico\ServicioAcademico;
use App\Clinica\Http\RespondeOperacion;
use App\Clinica\Soporte\Valores;
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
            'membresias' => ['required', 'array', 'max:100'],
            'membresias.*' => ['array'],
            'membresias.*.personaId' => ['required', 'string', 'max:30', 'distinct', 'regex:/^alumno-[1-9][0-9]*$/D'],
            'membresias.*.fechaInicio' => $this->reglaFecha(false),
            'membresias.*.fechaFin' => $this->reglaFecha(false),
        ]);

        return response()->json($this->operacion(fn () => $this->academico->guardarMembresias($idGrupo, $datos['membresias'])), 201);
    }

    public function finalizarMembresia(Request $solicitud, int $idMembresia): JsonResponse
    {
        $datos = $solicitud->validate(['fechaFin' => $this->reglaFecha(true)]);

        return response()->json($this->operacion(fn () => $this->academico->finalizarMembresia($idMembresia, $datos['fechaFin'])));
    }

    public function crearRotacion(Request $solicitud): JsonResponse
    {
        $datos = $solicitud->validate([
            'grupoId' => ['required', 'integer', 'min:1', 'exists:grupo_academico,id_grupo'],
            'cursoId' => ['required', 'integer', 'min:1', 'exists:curso,id_curso'],
            'periodoId' => ['required', 'integer', 'min:1', 'exists:periodo_academico,id_periodo_academico'],
            'fechaInicio' => $this->reglaFecha(true),
            'fechaFin' => $this->reglaFecha(true),
            'estado' => ['nullable', 'string', 'max:30'],
        ]);

        return response()->json($this->operacion(fn () => $this->academico->crearRotacion($datos)), 201);
    }

    public function docentesRotacion(Request $solicitud, int $idRotacion): JsonResponse
    {
        $datos = $solicitud->validate([
            'docentes' => ['required', 'array', 'max:100'],
            'docentes.*' => ['array'],
            'docentes.*.personaId' => ['required', 'string', 'max:30', 'distinct', 'regex:/^docente-[1-9][0-9]*$/D'],
            'docentes.*.funcion' => ['nullable', 'string', 'max:40'],
        ]);

        return response()->json($this->operacion(fn () => $this->academico->guardarDocentes($idRotacion, $datos['docentes'])), 201);
    }

    public function asignaciones(Request $solicitud, int $idRotacion): JsonResponse
    {
        $datos = $solicitud->validate([
            'personas' => ['required', 'array', 'max:100'],
            'personas.*' => ['array'],
            'personas.*.personaId' => ['required', 'string', 'max:30', 'distinct', 'regex:/^alumno-[1-9][0-9]*$/D'],
        ]);

        return response()->json($this->operacion(fn () => $this->academico->guardarAsignaciones($idRotacion, $datos['personas'])), 201);
    }

    /** Acepta día/mes/año y también la fecha ISO que envía el formulario. */
    private function reglaFecha(bool $requerida): array
    {
        return [
            $requerida ? 'required' : 'nullable',
            'bail',
            'string',
            'max:10',
            function (string $atributo, mixed $valor, \Closure $fallo): void {
                if ($valor === null || $valor === '') {
                    return;
                }
                if (Valores::fecha($valor) === null) {
                    $fallo('Use el formato día/mes/año.');
                }
            },
        ];
    }

    private function validarPeriodo(Request $solicitud): array
    {
        return $solicitud->validate([
            'codigo' => ['required', 'string', 'max:30'],
            'nombre' => ['required', 'string', 'max:120'],
            'fechaInicio' => $this->reglaFecha(true),
            'fechaFin' => $this->reglaFecha(true),
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
