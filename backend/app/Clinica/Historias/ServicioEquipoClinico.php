<?php

namespace App\Clinica\Historias;

use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Support\Facades\DB;

/**
 * Personal asignable a una historia, cambio de responsable y agenda de seguimientos.
 */
class ServicioEquipoClinico
{
    public function __construct(
        private readonly ServicioHistorias $historias,
        private readonly AccesoHistorias $acceso,
    ) {}

    /**
     * @return list<array<string, mixed>>
     */
    public function personal(?string $busqueda = null): array
    {
        $texto = trim((string) $busqueda);
        $filtro = function ($q) use ($texto) {
            if ($texto === '') {
                return;
            }
            $patron = '%'.addcslashes($texto, '%_\\').'%';
            $q->where(function ($w) use ($patron) {
                $w->where('nombres', 'like', $patron)
                    ->orWhere('apellidos', 'like', $patron)
                    ->orWhere('numero_documento', 'like', $patron);
            });
        };

        $alumnos = DB::table('alumno')->where('estado', 1)->tap($filtro)
            ->orderBy('apellidos')->limit(50)
            ->get(['id_alumno', 'codigo_alumno', 'numero_documento', 'nombres', 'apellidos'])
            ->map(fn ($fila) => [
                'id' => 'ALUMNO-'.$fila->id_alumno,
                'tipo' => 'ALUMNO',
                'nombre' => trim($fila->nombres.' '.$fila->apellidos),
                'dni' => $fila->numero_documento,
                'codigo' => $fila->codigo_alumno,
                'rol' => 'Alumno operador',
                'cop' => '',
            ]);

        $docentes = DB::table('docente')->where('estado', 1)->tap($filtro)
            ->orderBy('apellidos')->limit(50)
            ->get(['id_docente', 'codigo_docente', 'numero_documento', 'nombres', 'apellidos', 'numero_colegiatura', 'especialidad'])
            ->map(fn ($fila) => [
                'id' => 'DOCENTE-'.$fila->id_docente,
                'tipo' => 'DOCENTE',
                'nombre' => trim($fila->nombres.' '.$fila->apellidos),
                'dni' => $fila->numero_documento,
                'codigo' => $fila->codigo_docente,
                'rol' => $fila->especialidad ? 'Docente · '.$fila->especialidad : 'Docente',
                'cop' => $fila->numero_colegiatura ?? '',
            ]);

        return $alumnos->concat($docentes)->values()->all();
    }

    /**
     * Reemplaza al operador (alumno) o al docente encargado de la historia.
     *
     * @return array<string, mixed>
     */
    public function asignar(int $idHistoria, string $personal, Cuenta $actor): array
    {
        $this->historias->fila($idHistoria);

        if ($actor->tipoCuenta() !== 'DOCENTE') {
            throw new OperacionNoPermitida('personal', 'Solo un docente puede cambiar la asignación de la historia.');
        }

        if (! preg_match('/^(ALUMNO|DOCENTE)-(\d{1,18})$/', $personal, $partes)) {
            throw new OperacionNoPermitida('personal', 'El personal indicado no es válido.');
        }

        [$tipo, $id] = [$partes[1], (int) $partes[2]];
        $alumno = $tipo === 'ALUMNO';
        $tabla = $alumno ? 'historia_alumno' : 'historia_docente';
        $columna = $alumno ? 'id_alumno' : 'id_docente';
        $participacion = $alumno ? 'OPERADOR' : 'ENCARGADO';

        if (! DB::table($alumno ? 'alumno' : 'docente')->where($columna, $id)->where('estado', 1)->exists()) {
            throw new OperacionNoPermitida('personal', 'El personal indicado no existe o está inactivo.');
        }

        DB::transaction(function () use ($idHistoria, $tabla, $columna, $id, $participacion, $actor) {
            DB::table($tabla)
                ->where('id_historia_clinica', $idHistoria)
                ->where('tipo_participacion', $participacion)
                ->where('estado', 1)
                ->where($columna, '!=', $id)
                ->update(['estado' => 0, 'fecha_fin' => now()->toDateString()]);

            $vigente = DB::table($tabla)
                ->where('id_historia_clinica', $idHistoria)
                ->where($columna, $id)
                ->where('tipo_participacion', $participacion)
                ->where('estado', 1)
                ->exists();

            if (! $vigente) {
                DB::table($tabla)->insert([
                    'id_historia_clinica' => $idHistoria,
                    $columna => $id,
                    'tipo_participacion' => $participacion,
                    'fecha_asignacion' => now()->toDateString(),
                    'estado' => 1,
                    'asignado_por_tipo' => $actor->tipoCuenta(),
                    'asignado_por_id' => $actor->id(),
                    'creado_en' => now(),
                ]);
            }
        });

        return $this->historias->mostrar($idHistoria);
    }

    /**
     * Cirugías programadas y controles postoperatorios, del más próximo al más antiguo.
     *
     * @return list<array<string, mixed>>
     */
    public function seguimientos(?string $busqueda = null, ?Cuenta $actor = null): array
    {
        $hoy = now()->toDateString();
        $texto = trim((string) $busqueda);
        $patron = '%'.addcslashes($texto, '%_\\').'%';
        $filtro = function ($q) use ($texto, $patron, $actor) {
            if ($actor !== null) {
                $this->acceso->filtrar($q, $actor);
            }
            if ($texto !== '') {
                $q->where(function ($w) use ($patron) {
                    $w->where('p.nombres', 'like', $patron)
                        ->orWhere('p.apellidos', 'like', $patron)
                        ->orWhere('h.numero_historia', 'like', $patron);
                });
            }
        };

        $programadas = DB::table('programacion_cirugia as pc')
            ->join('plan_quirurgico as pq', 'pq.id_plan_quirurgico', '=', 'pc.id_plan_quirurgico')
            ->join('historia_clinica as h', 'h.id_historia_clinica', '=', 'pq.id_historia_clinica')
            ->join('paciente as p', 'p.id_paciente', '=', 'h.id_paciente')
            ->whereNull('h.anulado_en')
            ->tap($filtro)
            ->orderBy('pc.fecha')
            ->limit(200)
            ->get(['pc.id_programacion_cirugia', 'pc.fecha', 'pc.hora', 'pc.estado', 'pq.procedimiento', 'h.id_historia_clinica', 'h.numero_historia', 'p.nombres', 'p.apellidos'])
            ->map(fn ($fila) => $this->serializarProgramacion($fila, $hoy));

        $controles = DB::table('seguimiento_quirurgico as s')
            ->join('reporte_operatorio as r', 'r.id_reporte_operatorio', '=', 's.id_reporte_operatorio')
            ->join('plan_quirurgico as pq', 'pq.id_plan_quirurgico', '=', 'r.id_plan_quirurgico')
            ->join('historia_clinica as h', 'h.id_historia_clinica', '=', 'pq.id_historia_clinica')
            ->join('paciente as p', 'p.id_paciente', '=', 'h.id_paciente')
            ->whereNull('h.anulado_en')
            ->tap($filtro)
            ->orderByDesc('s.fecha')
            ->limit(200)
            ->get(['s.id_seguimiento_quirurgico', 's.numero_control', 's.fecha', 's.hora', 's.procedimiento', 's.estado', 'h.id_historia_clinica', 'h.numero_historia', 'p.nombres', 'p.apellidos'])
            ->map(fn ($fila) => $this->serializarControl($fila, $hoy));

        return $programadas->concat($controles)
            ->sortBy(fn ($item) => [$item['fecha'] < $hoy ? 1 : 0, $item['fecha'] < $hoy ? -strtotime($item['fecha']) : strtotime($item['fecha'])])
            ->values()
            ->all();
    }

    /**
     * @param  array{fecha?: string, hora?: string|null, detalle?: string|null, estado?: string|null}  $datos
     * @return array<string, mixed>
     */
    public function crearControl(int $idHistoria, array $datos, Cuenta $actor): array
    {
        if (! $this->acceso->puedeVer($actor, $idHistoria)) {
            throw (new \Illuminate\Database\Eloquent\ModelNotFoundException)->setModel('historia_clinica', [$idHistoria]);
        }
        $this->historias->fila($idHistoria);

        $fecha = trim((string) ($datos['fecha'] ?? ''));
        if ($fecha === '' || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
            throw new OperacionNoPermitida('fecha', 'Indique una fecha válida.');
        }
        $estado = strtoupper(trim((string) ($datos['estado'] ?? 'PROGRAMADO')));
        if (! in_array($estado, ['PROGRAMADO', 'REALIZADO', 'CANCELADO'], true)) {
            throw new OperacionNoPermitida('estado', 'Estado de control no válido.');
        }

        $id = DB::transaction(function () use ($idHistoria, $datos, $fecha, $estado, $actor) {
            $idPlan = (int) (DB::table('plan_quirurgico')->where('id_historia_clinica', $idHistoria)->orderByDesc('id_plan_quirurgico')->value('id_plan_quirurgico')
                ?: DB::table('plan_quirurgico')->insertGetId([
                    'id_historia_clinica' => $idHistoria,
                    'procedimiento' => 'Control clínico',
                    'estado' => 'BORRADOR',
                    'creado_en' => now(),
                ]));
            $idReporte = (int) (DB::table('reporte_operatorio')->where('id_plan_quirurgico', $idPlan)->value('id_reporte_operatorio')
                ?: DB::table('reporte_operatorio')->insertGetId([
                    'id_plan_quirurgico' => $idPlan,
                    'fecha' => $fecha,
                    'procedimiento_realizado' => 'Control clínico',
                    'estado' => 'BORRADOR',
                    'creado_en' => now(),
                ]));
            $numero = (int) DB::table('seguimiento_quirurgico')->where('id_reporte_operatorio', $idReporte)->max('numero_control') + 1;
            $hora = $this->horaOpcional($datos['hora'] ?? null);

            return (int) DB::table('seguimiento_quirurgico')->insertGetId([
                'id_reporte_operatorio' => $idReporte,
                'numero_control' => $numero,
                'fecha' => $fecha,
                'hora' => $hora,
                'procedimiento' => mb_substr(trim((string) ($datos['detalle'] ?? 'Control clínico')), 0, 255) ?: 'Control clínico',
                'estado' => $estado,
                'id_docente' => $actor->tipoCuenta() === 'DOCENTE' ? $actor->idActor() : null,
                'id_alumno' => $actor->tipoCuenta() === 'ALUMNO' ? $actor->idActor() : null,
                'creado_en' => now(),
            ]);
        });

        return $this->mostrarControl($id);
    }

    /**
     * @param  array{fecha?: string, hora?: string|null, detalle?: string|null, estado?: string|null}  $datos
     * @return array<string, mixed>
     */
    public function actualizarControl(int $idControl, array $datos, Cuenta $actor): array
    {
        $fila = DB::table('seguimiento_quirurgico as s')
            ->join('reporte_operatorio as r', 'r.id_reporte_operatorio', '=', 's.id_reporte_operatorio')
            ->join('plan_quirurgico as pq', 'pq.id_plan_quirurgico', '=', 'r.id_plan_quirurgico')
            ->where('s.id_seguimiento_quirurgico', $idControl)
            ->first(['s.*', 'pq.id_historia_clinica']);
        if ($fila === null || ! $this->acceso->puedeVer($actor, (int) $fila->id_historia_clinica)) {
            throw (new \Illuminate\Database\Eloquent\ModelNotFoundException)->setModel('seguimiento_quirurgico', [$idControl]);
        }

        $cambios = [];
        if (array_key_exists('fecha', $datos)) {
            $fecha = trim((string) $datos['fecha']);
            if ($fecha === '' || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
                throw new OperacionNoPermitida('fecha', 'Indique una fecha válida.');
            }
            $cambios['fecha'] = $fecha;
        }
        if (array_key_exists('hora', $datos)) {
            $cambios['hora'] = $this->horaOpcional($datos['hora']);
        }
        if (array_key_exists('detalle', $datos)) {
            $cambios['procedimiento'] = mb_substr(trim((string) $datos['detalle']), 0, 255) ?: null;
        }
        if (array_key_exists('estado', $datos)) {
            $estado = strtoupper(trim((string) $datos['estado']));
            if (! in_array($estado, ['PROGRAMADO', 'REALIZADO', 'CANCELADO'], true)) {
                throw new OperacionNoPermitida('estado', 'Estado de control no válido.');
            }
            $cambios['estado'] = $estado;
        }
        if ($cambios !== []) {
            DB::table('seguimiento_quirurgico')->where('id_seguimiento_quirurgico', $idControl)->update($cambios);
        }

        return $this->mostrarControl($idControl);
    }

    /**
     * @param  array{fecha?: string, hora?: string|null, detalle?: string|null, estado?: string|null}  $datos
     * @return array<string, mixed>
     */
    public function actualizarProgramacion(int $idProgramacion, array $datos, Cuenta $actor): array
    {
        $fila = DB::table('programacion_cirugia as pc')
            ->join('plan_quirurgico as pq', 'pq.id_plan_quirurgico', '=', 'pc.id_plan_quirurgico')
            ->where('pc.id_programacion_cirugia', $idProgramacion)
            ->first(['pc.*', 'pq.id_historia_clinica', 'pq.procedimiento']);
        if ($fila === null || ! $this->acceso->puedeVer($actor, (int) $fila->id_historia_clinica)) {
            throw (new \Illuminate\Database\Eloquent\ModelNotFoundException)->setModel('programacion_cirugia', [$idProgramacion]);
        }

        $cambios = [];
        if (array_key_exists('fecha', $datos)) {
            $fecha = trim((string) $datos['fecha']);
            if ($fecha === '' || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
                throw new OperacionNoPermitida('fecha', 'Indique una fecha válida.');
            }
            $cambios['fecha'] = $fecha;
        }
        if (array_key_exists('hora', $datos)) {
            $cambios['hora'] = $this->horaOpcional($datos['hora']);
        }
        if (array_key_exists('detalle', $datos)) {
            $cambios['observaciones'] = trim((string) $datos['detalle']) ?: null;
        }
        if (array_key_exists('estado', $datos)) {
            $estado = strtoupper(trim((string) $datos['estado']));
            if (! in_array($estado, ['PROGRAMADA', 'REALIZADA', 'CANCELADA'], true)) {
                throw new OperacionNoPermitida('estado', 'Estado de programación no válido.');
            }
            $cambios['estado'] = $estado;
        }
        if ($cambios !== []) {
            $cambios['actualizado_en'] = now();
            DB::table('programacion_cirugia')->where('id_programacion_cirugia', $idProgramacion)->update($cambios);
        }

        $actual = DB::table('programacion_cirugia as pc')
            ->join('plan_quirurgico as pq', 'pq.id_plan_quirurgico', '=', 'pc.id_plan_quirurgico')
            ->join('historia_clinica as h', 'h.id_historia_clinica', '=', 'pq.id_historia_clinica')
            ->join('paciente as p', 'p.id_paciente', '=', 'h.id_paciente')
            ->where('pc.id_programacion_cirugia', $idProgramacion)
            ->first(['pc.id_programacion_cirugia', 'pc.fecha', 'pc.hora', 'pc.estado', 'pq.procedimiento', 'h.id_historia_clinica', 'h.numero_historia', 'p.nombres', 'p.apellidos']);

        return $this->serializarProgramacion($actual, now()->toDateString());
    }

    private function mostrarControl(int $id): array
    {
        $fila = DB::table('seguimiento_quirurgico as s')
            ->join('reporte_operatorio as r', 'r.id_reporte_operatorio', '=', 's.id_reporte_operatorio')
            ->join('plan_quirurgico as pq', 'pq.id_plan_quirurgico', '=', 'r.id_plan_quirurgico')
            ->join('historia_clinica as h', 'h.id_historia_clinica', '=', 'pq.id_historia_clinica')
            ->join('paciente as p', 'p.id_paciente', '=', 'h.id_paciente')
            ->where('s.id_seguimiento_quirurgico', $id)
            ->first(['s.id_seguimiento_quirurgico', 's.numero_control', 's.fecha', 's.hora', 's.procedimiento', 's.estado', 'h.id_historia_clinica', 'h.numero_historia', 'p.nombres', 'p.apellidos']);

        return $this->serializarControl($fila, now()->toDateString());
    }

    private function serializarControl(object $fila, string $hoy): array
    {
        $estado = strtoupper((string) ($fila->estado ?? 'PROGRAMADO'));
        $etiqueta = match ($estado) {
            'REALIZADO' => 'Realizado',
            'CANCELADO' => 'Cancelado',
            default => ($fila->fecha < $hoy ? 'Vencido' : 'Programado'),
        };

        return [
            'id' => 'control-'.$fila->id_seguimiento_quirurgico,
            'tipo' => 'Control '.$fila->numero_control,
            'detalle' => $fila->procedimiento ?? '',
            'fecha' => $fila->fecha,
            'hora' => $fila->hora ? substr((string) $fila->hora, 0, 5) : '',
            'estado' => $etiqueta,
            'codigoEstado' => $estado,
            'historiaId' => (int) $fila->id_historia_clinica,
            'codigo' => $fila->numero_historia,
            'paciente' => trim($fila->nombres.' '.$fila->apellidos),
            'responsable' => $this->operador((int) $fila->id_historia_clinica),
            'seccion' => 'seguimiento',
        ];
    }

    private function serializarProgramacion(object $fila, string $hoy): array
    {
        $estado = strtoupper((string) $fila->estado);
        $etiqueta = match ($estado) {
            'REALIZADA' => 'Realizada',
            'CANCELADA' => 'Cancelada',
            default => ($estado === 'PROGRAMADA' && $fila->fecha < $hoy ? 'Vencida' : 'Programada'),
        };

        return [
            'id' => 'cirugia-'.$fila->id_programacion_cirugia,
            'tipo' => 'Cirugía programada',
            'detalle' => $fila->procedimiento,
            'fecha' => $fila->fecha,
            'hora' => $fila->hora ? substr((string) $fila->hora, 0, 5) : '',
            'estado' => $etiqueta,
            'codigoEstado' => $estado,
            'historiaId' => (int) $fila->id_historia_clinica,
            'codigo' => $fila->numero_historia,
            'paciente' => trim($fila->nombres.' '.$fila->apellidos),
            'responsable' => $this->operador((int) $fila->id_historia_clinica),
            'seccion' => 'consentimiento',
        ];
    }

    private function horaOpcional(mixed $valor): ?string
    {
        $hora = trim((string) ($valor ?? ''));
        if ($hora === '') {
            return null;
        }
        if (! preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $hora)) {
            throw new OperacionNoPermitida('hora', 'Indique una hora válida (HH:MM).');
        }

        return strlen($hora) === 5 ? $hora.':00' : $hora;
    }

    private function operador(int $idHistoria): string
    {
        return (string) (DB::table('historia_alumno as ha')
            ->join('alumno as a', 'a.id_alumno', '=', 'ha.id_alumno')
            ->where('ha.id_historia_clinica', $idHistoria)
            ->where('ha.estado', 1)
            ->where('ha.tipo_participacion', 'OPERADOR')
            ->value(DB::raw("CONCAT(a.nombres, ' ', a.apellidos)")) ?? '');
    }
}
