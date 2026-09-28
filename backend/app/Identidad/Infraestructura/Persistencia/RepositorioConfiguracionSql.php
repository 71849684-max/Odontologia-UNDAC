<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\Contratos\RepositorioConfiguracion;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Support\Facades\DB;

class RepositorioConfiguracionSql implements RepositorioConfiguracion
{
    public function listar(): array
    {
        return DB::table('configuracion_sistema')
            ->where('estado', 1)
            ->orderBy('id_configuracion')
            ->get()
            ->map(fn ($fila) => $this->serializar($fila))
            ->all();
    }

    public function guardar(array $valores, int $idOperador): array
    {
        $codigos = array_keys($valores);

        $existentes = DB::table('configuracion_sistema')
            ->whereIn('codigo_configuracion', $codigos)
            ->where('estado', 1)
            ->get()
            ->keyBy('codigo_configuracion');

        $desconocidos = array_diff($codigos, $existentes->keys()->all());

        if ($desconocidos !== []) {
            throw new OperacionNoPermitida(
                'valores',
                'Parametros desconocidos: '.implode(', ', $desconocidos),
            );
        }

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
                    'actualizado_por' => $idOperador,
                ]);

            $despues[$codigo] = $valor;
        }

        return ['antes' => $antes, 'despues' => $despues];
    }

    /**
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
