<?php

namespace App\Clinica\Notificaciones;

use App\Identidad\Dominio\Cuenta;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class ServicioNotificaciones
{
    /**
     * @param  list<array{tipo_destinatario: string, id_destinatario: int}>  $destinatarios
     */
    public function crear(
        array $destinatarios,
        string $tipo,
        string $titulo,
        string $mensaje,
        ?int $idHistoria = null,
        ?string $codigoSeccion = null,
    ): int {
        $creadas = 0;
        $ahora = now();
        foreach ($destinatarios as $destino) {
            if (! in_array($destino['tipo_destinatario'] ?? '', ['ALUMNO', 'DOCENTE'], true)) {
                continue;
            }
            DB::table('notificacion')->insert([
                'tipo_destinatario' => $destino['tipo_destinatario'],
                'id_destinatario' => (int) $destino['id_destinatario'],
                'tipo' => mb_substr($tipo, 0, 40),
                'titulo' => mb_substr($titulo, 0, 180),
                'mensaje' => mb_substr($mensaje, 0, 500),
                'id_historia_clinica' => $idHistoria,
                'codigo_seccion' => $codigoSeccion !== null ? mb_substr($codigoSeccion, 0, 80) : null,
                'leida' => 0,
                'creado_en' => $ahora,
            ]);
            $creadas++;
        }

        return $creadas;
    }

    /**
     * Docentes ENCARGADO/SUPERVISOR activos de la historia (id_docente = idActor del destinatario).
     *
     * @return list<array{tipo_destinatario: string, id_destinatario: int}>
     */
    public function docentesAsignados(int $idHistoria): array
    {
        return DB::table('historia_docente')
            ->where('id_historia_clinica', $idHistoria)
            ->where('estado', 1)
            ->whereIn('tipo_participacion', ['ENCARGADO', 'SUPERVISOR'])
            ->distinct()
            ->pluck('id_docente')
            ->map(fn ($id) => ['tipo_destinatario' => 'DOCENTE', 'id_destinatario' => (int) $id])
            ->values()
            ->all();
    }

    /**
     * Notifica revisión de sección a docentes asignados. Devuelve cuántas notificaciones se crearon.
     */
    public function notificarRevisionSeccion(int $idHistoria, string $codigoSeccion, Cuenta $autor): int
    {
        $destinatarios = $this->docentesAsignados($idHistoria);
        if ($destinatarios === []) {
            return 0;
        }

        $codigo = (string) DB::table('historia_clinica')->where('id_historia_clinica', $idHistoria)->value('numero_historia');
        $seccion = str_replace('-', ' ', $codigoSeccion);
        $autorNombre = $autor->nombreCompleto();

        return $this->crear(
            $destinatarios,
            'SECCION_REVISION',
            'Sección lista para revisión',
            "{$autorNombre} envió «{$seccion}» de {$codigo} a revisión.",
            $idHistoria,
            $codigoSeccion,
        );
    }

    /** @return list<array<string, mixed>> */
    public function listar(Cuenta $actor, int $limite = 50): array
    {
        $limite = min(100, max(1, $limite));

        return DB::table('notificacion as n')
            ->leftJoin('historia_clinica as h', 'h.id_historia_clinica', '=', 'n.id_historia_clinica')
            ->where('n.tipo_destinatario', $actor->tipoCuenta())
            ->where('n.id_destinatario', $actor->idActor())
            ->where(function ($q) {
                $q->whereNull('n.id_historia_clinica')
                    ->orWhere(function ($vigente) {
                        $vigente->whereNotNull('h.id_historia_clinica')->whereNull('h.anulado_en');
                    });
            })
            ->orderByDesc('n.creado_en')
            ->orderByDesc('n.id_notificacion')
            ->limit($limite)
            ->get(['n.*'])
            ->map(fn ($fila) => $this->serializar($fila))
            ->all();
    }

    public function marcarLeida(Cuenta $actor, int $id): array
    {
        $fila = DB::table('notificacion')
            ->where('id_notificacion', $id)
            ->where('tipo_destinatario', $actor->tipoCuenta())
            ->where('id_destinatario', $actor->idActor())
            ->first();
        if ($fila === null) {
            throw (new ModelNotFoundException)->setModel('notificacion', [$id]);
        }
        DB::table('notificacion')->where('id_notificacion', $id)->update(['leida' => 1]);

        return $this->serializar(DB::table('notificacion')->where('id_notificacion', $id)->first());
    }

    public function marcarTodas(Cuenta $actor): int
    {
        return DB::table('notificacion')
            ->where('tipo_destinatario', $actor->tipoCuenta())
            ->where('id_destinatario', $actor->idActor())
            ->where('leida', 0)
            ->update(['leida' => 1]);
    }

    private function serializar(object $fila): array
    {
        return [
            'id' => (int) $fila->id_notificacion,
            'tipo' => $fila->tipo,
            'titulo' => $fila->titulo,
            'mensaje' => $fila->mensaje,
            'texto' => $fila->mensaje,
            'historiaId' => $fila->id_historia_clinica !== null ? (int) $fila->id_historia_clinica : null,
            'seccion' => $fila->codigo_seccion,
            'leida' => (bool) $fila->leida,
            'leido' => (bool) $fila->leida,
            'creadoEn' => $fila->creado_en,
            'tiempo' => $fila->creado_en,
        ];
    }
}
