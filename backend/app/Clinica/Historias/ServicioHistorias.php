<?php

namespace App\Clinica\Historias;

use App\Clinica\Pacientes\ServicioPacientes;
use App\Clinica\Soporte\Valores;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class ServicioHistorias
{
    /** @var array<string, list<string>> */
    private const TRANSICIONES = [
        'BORRADOR' => ['EN_PROCESO', 'PENDIENTE_REVISION'],
        'EN_PROCESO' => ['PENDIENTE_REVISION'],
        'PENDIENTE_REVISION' => ['OBSERVADA', 'VALIDADA', 'EN_PROCESO'],
        'OBSERVADA' => ['EN_PROCESO', 'PENDIENTE_REVISION'],
        'VALIDADA' => [],
    ];

    public function __construct(private readonly ServicioPacientes $pacientes) {}

    public function listar(?string $busqueda = null): array
    {
        $consulta = $this->consulta()->orderByDesc('h.actualizado_en');

        if ($busqueda !== null && trim($busqueda) !== '') {
            $texto = trim($busqueda);
            $consulta->where(function ($q) use ($texto) {
                $q->where('h.numero_historia', 'like', "%{$texto}%")
                    ->orWhere('p.nombres', 'like', "%{$texto}%")
                    ->orWhere('p.apellidos', 'like', "%{$texto}%")
                    ->orWhere('p.numero_documento', 'like', "%{$texto}%");
            });
        }

        return $consulta->limit(300)->get()->map(fn ($fila) => $this->serializar($fila))->all();
    }

    public function mostrar(int $id): array
    {
        return $this->serializar($this->fila($id));
    }

    public function abrir(array $datos, Cuenta $actor): array
    {
        return DB::transaction(function () use ($datos, $actor) {
            $idPaciente = isset($datos['paciente_id']) ? (int) $datos['paciente_id'] : (isset($datos['pacienteId']) ? (int) $datos['pacienteId'] : 0);

            if ($idPaciente === 0) {
                $documento = Valores::texto($datos['dni'] ?? $datos['numeroDocumento'] ?? null);
                $existente = $documento
                    ? DB::table('paciente')->where('numero_documento', $documento)->whereNull('eliminado_en')->value('id_paciente')
                    : null;
                $idPaciente = $existente ? (int) $existente : (int) $this->pacientes->crear($datos)['id'];
            } else {
                $this->pacientes->fila($idPaciente);
            }

            $anio = now()->year;
            $correlativo = (int) DB::table('historia_clinica')->where('numero_historia', 'like', "HC-{$anio}-%")->count() + 1;
            $numero = sprintf('HC-%d-%03d', $anio, $correlativo);
            $idEstado = (int) DB::table('estado_historia_clinica')->where('codigo', 'BORRADOR')->value('id_estado_historia');

            $id = DB::table('historia_clinica')->insertGetId([
                'numero_historia' => $numero,
                'id_paciente' => $idPaciente,
                'id_periodo_academico' => $this->periodoVigente(),
                'id_estado_historia' => $idEstado ?: 1,
                'fecha_apertura' => now()->toDateString(),
                'tipo_atencion' => Valores::texto($datos['tipoAtencion'] ?? null),
                'motivo_consulta' => Valores::texto($datos['motivoConsulta'] ?? null),
                'creado_por_tipo' => $actor->tipoCuenta(),
                'creado_por_id' => $actor->id(),
                'actualizado_por_tipo' => $actor->tipoCuenta(),
                'actualizado_por_id' => $actor->id(),
                'creado_en' => now(),
                'actualizado_en' => now(),
            ]);

            $this->asignarActor($id, $actor);

            DB::table('paciente')->where('id_paciente', $idPaciente)->update(['estado_atencion' => 'Borrador']);

            return $this->mostrar($id);
        });
    }

    public function cambiarEstado(int $id, string $codigo, Cuenta $actor, ?string $observacion = null): array
    {
        $fila = $this->fila($id);
        $destino = DB::table('estado_historia_clinica')->where('codigo', $codigo)->where('estado', 1)->first();

        if ($destino === null) {
            throw new OperacionNoPermitida('estado', 'El estado indicado no existe.');
        }

        $permitidos = self::TRANSICIONES[$fila->codigo_estado] ?? [];

        if (! in_array($codigo, $permitidos, true)) {
            throw new OperacionNoPermitida('estado', 'No se puede pasar de '.$fila->codigo_estado.' a '.$codigo.'.');
        }

        if (in_array($codigo, ['VALIDADA', 'OBSERVADA'], true) && $actor->tipoCuenta() !== 'DOCENTE') {
            throw new OperacionNoPermitida('estado', 'Solo un docente puede observar o validar la historia.');
        }

        DB::table('historia_clinica')->where('id_historia_clinica', $id)->update([
            'id_estado_historia' => $destino->id_estado_historia,
            'fecha_cierre' => $codigo === 'VALIDADA' ? now()->toDateString() : null,
            'actualizado_por_tipo' => $actor->tipoCuenta(),
            'actualizado_por_id' => $actor->id(),
            'actualizado_en' => now(),
        ]);

        if ($observacion) {
            DB::table('historia_clinica_estado_historial')
                ->where('id_historia_clinica', $id)
                ->orderByDesc('id_historial_estado')
                ->limit(1)
                ->update(['observacion' => mb_substr($observacion, 0, 500)]);
        }

        DB::table('paciente')->where('id_paciente', $fila->id_paciente)->update([
            'estado_atencion' => $destino->nombre,
        ]);

        return $this->mostrar($id);
    }

    public function fila(int $id): object
    {
        $fila = $this->consulta()->where('h.id_historia_clinica', $id)->first();

        if ($fila === null) {
            throw (new ModelNotFoundException)->setModel('historia_clinica', [$id]);
        }

        return $fila;
    }

    private function consulta()
    {
        return DB::table('historia_clinica as h')
            ->join('paciente as p', 'p.id_paciente', '=', 'h.id_paciente')
            ->join('estado_historia_clinica as e', 'e.id_estado_historia', '=', 'h.id_estado_historia')
            ->whereNull('h.anulado_en')
            ->select([
                'h.id_historia_clinica',
                'h.numero_historia',
                'h.id_paciente',
                'h.fecha_apertura',
                'h.motivo_consulta',
                'h.tipo_atencion',
                'p.nombres',
                'p.apellidos',
                'p.numero_documento',
                'p.sexo',
                'p.telefono',
                'p.correo',
                'p.fecha_nacimiento',
                'e.codigo as codigo_estado',
                'e.nombre as nombre_estado',
            ]);
    }

    private function serializar(object $fila): array
    {
        $operador = DB::table('historia_alumno as ha')
            ->join('alumno as a', 'a.id_alumno', '=', 'ha.id_alumno')
            ->where('ha.id_historia_clinica', $fila->id_historia_clinica)
            ->where('ha.estado', 1)
            ->orderByRaw("FIELD(ha.tipo_participacion, 'OPERADOR', 'COLABORADOR')")
            ->value(DB::raw("CONCAT(a.nombres, ' ', a.apellidos)"));

        $docente = DB::table('historia_docente as hd')
            ->join('docente as d', 'd.id_docente', '=', 'hd.id_docente')
            ->where('hd.id_historia_clinica', $fila->id_historia_clinica)
            ->where('hd.estado', 1)
            ->orderByRaw("FIELD(hd.tipo_participacion, 'ENCARGADO', 'SUPERVISOR', 'COLABORADOR')")
            ->value(DB::raw("CONCAT(d.nombres, ' ', d.apellidos)"));

        $completas = DB::table('historia_seccion_estado')
            ->where('id_historia_clinica', $fila->id_historia_clinica)
            ->whereIn('estado', ['complete', 'review', 'approved', 'Completo'])
            ->count();

        return [
            'id' => (int) $fila->id_historia_clinica,
            'pacienteId' => (int) $fila->id_paciente,
            'codigo' => $fila->numero_historia,
            'paciente' => trim($fila->nombres.' '.$fila->apellidos),
            'nombres' => trim($fila->nombres.' '.$fila->apellidos),
            'dni' => $fila->numero_documento,
            'operador' => $operador ?? '',
            'docente' => $docente ?? '',
            'fecha' => $fila->fecha_apertura,
            'estado' => $fila->nombre_estado,
            'codigoEstado' => $fila->codigo_estado,
            'progreso' => (int) round(($completas / 18) * 100),
            'pacienteRegistro' => [
                'id' => (int) $fila->id_paciente,
                'nombres' => trim($fila->nombres.' '.$fila->apellidos),
                'dni' => $fila->numero_documento,
                'edad' => Valores::edad($fila->fecha_nacimiento),
                'sexo' => $fila->sexo ?? '',
                'telefono' => $fila->telefono ?? '',
                'correo' => $fila->correo ?? '',
                'fechaNacimiento' => $fila->fecha_nacimiento,
            ],
        ];
    }

    private function periodoVigente(): int
    {
        $hoy = now()->toDateString();
        $id = DB::table('periodo_academico')
            ->where('estado', 1)
            ->whereDate('fecha_inicio', '<=', $hoy)
            ->whereDate('fecha_fin', '>=', $hoy)
            ->value('id_periodo_academico');

        if ($id) {
            return (int) $id;
        }

        $mes = (int) now()->format('n');
        $anio = (int) now()->format('Y');
        $segundo = $mes >= 8;
        $codigo = $anio.'-'.($segundo ? 'II' : 'I');
        $existente = DB::table('periodo_academico')->where('codigo', $codigo)->value('id_periodo_academico');

        if ($existente) {
            return (int) $existente;
        }

        return (int) DB::table('periodo_academico')->insertGetId([
            'codigo' => $codigo,
            'nombre' => 'Periodo '.$codigo,
            'anio' => $anio,
            'semestre' => $segundo ? 'II' : 'I',
            'fecha_inicio' => $segundo ? "{$anio}-08-01" : "{$anio}-03-01",
            'fecha_fin' => $segundo ? "{$anio}-12-15" : "{$anio}-07-31",
            'estado' => 1,
            'creado_en' => now(),
        ]);
    }

    private function asignarActor(int $idHistoria, Cuenta $actor): void
    {
        if ($actor->tipoCuenta() === 'ALUMNO') {
            DB::table('historia_alumno')->insert([
                'id_historia_clinica' => $idHistoria,
                'id_alumno' => $actor->idActor(),
                'tipo_participacion' => 'OPERADOR',
                'fecha_asignacion' => now()->toDateString(),
                'estado' => 1,
                'asignado_por_tipo' => $actor->tipoCuenta(),
                'asignado_por_id' => $actor->id(),
                'creado_en' => now(),
            ]);

            return;
        }

        DB::table('historia_docente')->insert([
            'id_historia_clinica' => $idHistoria,
            'id_docente' => $actor->idActor(),
            'tipo_participacion' => 'ENCARGADO',
            'fecha_asignacion' => now()->toDateString(),
            'estado' => 1,
            'asignado_por_tipo' => $actor->tipoCuenta(),
            'asignado_por_id' => $actor->id(),
            'creado_en' => now(),
        ]);
    }
}
