<?php

namespace App\Clinica\Http\Controladores;

use App\Clinica\Expediente\ServicioExpediente;
use App\Clinica\Historias\ServicioHistorias;
use App\Clinica\Http\RespondeOperacion;
use App\Clinica\Odontograma\ServicioOdontograma;
use App\Http\Controllers\Controller;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControladorHistorias extends Controller
{
    use RespondeOperacion;

    public function __construct(
        private readonly ServicioHistorias $historias,
        private readonly ServicioExpediente $expediente,
        private readonly ServicioOdontograma $odontograma,
    ) {}

    public function listar(Request $solicitud): JsonResponse
    {
        return response()->json(['data' => $this->historias->listar($solicitud->query('q'))]);
    }

    public function mostrar(int $idHistoria): JsonResponse
    {
        return response()->json($this->historias->mostrar($idHistoria));
    }

    public function crear(Request $solicitud): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'paciente_id' => ['nullable', 'integer'],
            'pacienteId' => ['nullable', 'integer'],
            'dni' => ['nullable', 'string', 'max:20'],
            'nombres' => ['nullable', 'string', 'max:180'],
            'apellidoPaterno' => ['nullable', 'string', 'max:120'],
            'apellidoMaterno' => ['nullable', 'string', 'max:120'],
            'numeroDocumento' => ['nullable', 'string', 'max:20'],
            'nacimiento' => ['nullable', 'date'],
            'fechaNacimiento' => ['nullable', 'date'],
            'sexo' => ['nullable', 'string', 'max:20'],
            'celular' => ['nullable', 'string', 'max:30'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'correo' => ['nullable', 'email', 'max:150'],
        ]);

        $historia = $this->operacion(fn () => $this->historias->abrir($datos, $actor));

        return response()->json($historia, 201);
    }

    public function cambiarEstado(Request $solicitud, int $idHistoria): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'codigo' => ['required', 'string', 'max:40'],
            'observacion' => ['nullable', 'string', 'max:500'],
        ]);

        return response()->json($this->operacion(
            fn () => $this->historias->cambiarEstado($idHistoria, $datos['codigo'], $actor, $datos['observacion'] ?? null),
        ));
    }

    public function expediente(int $idHistoria): JsonResponse
    {
        return response()->json($this->expediente->obtener($idHistoria));
    }

    public function guardarExpediente(Request $solicitud, int $idHistoria): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'formData' => ['required', 'array'],
            'sectionStatus' => ['nullable', 'array'],
        ]);

        return response()->json($this->operacion(
            fn () => $this->expediente->guardar($idHistoria, $datos['formData'], $datos['sectionStatus'] ?? [], $actor),
        ));
    }

    public function odontograma(int $idHistoria): JsonResponse
    {
        return response()->json(['registro' => $this->odontograma->leer($idHistoria)]);
    }

    public function guardarOdontograma(Request $solicitud, int $idHistoria): JsonResponse
    {
        /** @var Cuenta $actor */
        $actor = $solicitud->user();
        $datos = $solicitud->validate([
            'registro' => ['required', 'array'],
        ]);

        return response()->json([
            'registro' => $this->operacion(fn () => $this->odontograma->guardar($idHistoria, $datos['registro'], $actor)),
        ]);
    }
}
