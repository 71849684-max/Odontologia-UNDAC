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
            'membresias' => ['required', 'array'],
            'membresias.*.personaId' => ['required', 'string'],
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
            'grupoId' => ['required', 'integer'],
            'cursoId' => ['required', 'integer'],
            'periodoId' => ['required', 'integer'],
            'fechaInicio' => $this->reglaFecha(true),
            'fechaFin' => $this->reglaFecha(true),
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

    /** Acepta día/mes/año y también la fecha ISO que envía el formulario. */
    private function reglaFecha(bool $requerida): array
    {
        return [
            $requerida ? 'required' : 'nullable',
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
