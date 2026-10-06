<?php

namespace App\Identidad\Infraestructura\Persistencia;

use App\Identidad\Dominio\Contratos\RepositorioConfiguracion;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Support\Facades\DB;

class RepositorioConfiguracionSql implements RepositorioConfiguracion
{
    /** @var list<string> */
    private const BOOLEANOS = [
        'ELIMINACION_CLINICA_PERMITIDA',
    ];

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
            ->whereIn('clave', $codigos)
            ->where('estado', 1)
            ->get()
            ->keyBy('clave');

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
            $antes[$codigo] = $fila->valor;
            $texto = $valor === null ? null : (string) $valor;

            if (in_array($codigo, self::BOOLEANOS, true)) {
                $texto = filter_var($valor, FILTER_VALIDATE_BOOLEAN) ? '1' : '0';
            }

            DB::table('configuracion_sistema')
                ->where('id_configuracion', $fila->id_configuracion)
                ->update([
                    'valor' => $texto,
                    'actualizado_en' => now(),
                ]);

            $despues[$codigo] = $texto;
        }

        return ['antes' => $antes, 'despues' => $despues];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializar(object $fila): array
    {
        $booleano = in_array($fila->clave, self::BOOLEANOS, true);
        $valor = $booleano
            ? filter_var($fila->valor, FILTER_VALIDATE_BOOLEAN)
            : $fila->valor;

        return [
            'id' => (int) $fila->id_configuracion,
            'codigo' => $fila->clave,
            'nombre' => $fila->descripcion ?: $fila->clave,
            'valor' => $valor,
            'tipo' => $booleano ? 'BOOLEANO' : 'TEXTO',
            'descripcion' => $fila->descripcion,
            'actualizado_en' => $fila->actualizado_en,
        ];
    }
}
