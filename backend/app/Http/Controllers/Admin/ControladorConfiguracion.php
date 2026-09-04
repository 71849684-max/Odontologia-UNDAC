<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SolicitudGuardarConfiguracion;
use App\Models\Usuario;
use App\Servicios\ServicioAuditoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ControladorConfiguracion extends Controller
{
    public function __construct(private readonly ServicioAuditoria $auditoria) {}

    public function listar(): JsonResponse
    {
        $filas = DB::table('configuracion_sistema')
            ->where('estado', 1)
            ->orderBy('id_configuracion')
            ->get()
            ->map(fn ($fila) => $this->serializar($fila));

        return response()->json(['data' => $filas]);
    }

    public function guardar(SolicitudGuardarConfiguracion $solicitud): JsonResponse
    {
        $valores = $solicitud->valores();
        $codigos = array_keys($valores);

        $existentes = DB::table('configuracion_sistema')
            ->whereIn('codigo_configuracion', $codigos)
            ->where('estado', 1)
            ->get()
            ->keyBy('codigo_configuracion');

        $desconocidos = array_diff($codigos, $existentes->keys()->all());

        if ($desconocidos !== []) {
            throw ValidationException::withMessages([
                'valores' => 'Parametros desconocidos: '.implode(', ', $desconocidos),
            ]);
        }

        /** @var Usuario $operador */
        $operador = $solicitud->user();
        $antes = [];
        $despues = [];

        foreach ($valores as $codigo => $valor) {
            $fila = $existentes[$codigo];
            $antes[$codigo] = $fila->valor_texto;

            if ($fila->tipo_valor === 'BOOLEANO') {
                $valor = filter_var($valor, FILTER_VALIDATE_BOOLEAN) ? '1' : '0';
            }

            DB::table('configuracion_sistema')
                ->where('id_configuracion', $fila->id_configuracion)
                ->update([
                    'valor_texto' => $valor,
                    'actualizado_en' => now(),
                    'actualizado_por' => $operador->getKey(),
                ]);

            $despues[$codigo] = $valor;
        }

        $this->auditoria->registrar(
            $solicitud,
            'configuracion_sistema',
            implode(',', $codigos),
            'EDITAR',
            $antes,
            $despues,
        );

        return $this->listar();
    }

    /**
     * @param  object  $fila
     * @return array<string, mixed>
     */
    private function serializar(object $fila): array
    {
        $valor = $fila->valor_texto;

        if ($fila->tipo_valor === 'BOOLEANO') {
            $valor = filter_var($fila->valor_texto, FILTER_VALIDATE_BOOLEAN);
        }

        return [
            'id' => (int) $fila->id_configuracion,
            'codigo' => $fila->codigo_configuracion,
            'nombre' => $fila->nombre_configuracion,
            'valor' => $valor,
            'tipo' => $fila->tipo_valor,
            'descripcion' => $fila->descripcion,
            'actualizado_en' => $fila->actualizado_en,
        ];
    }
}
