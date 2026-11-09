<?php

namespace App\Clinica\Historias;

use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use App\Identidad\Dominio\Cuenta;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Los usuarios clínicos acceden por asignación vigente; el administrador
 * conserva acceso general. La visibilidad es independiente de la aprobación.
 */
class AccesoHistorias
{
    public function __construct(private readonly ConsultaAccesos $accesos) {}

    public function visibilidadRestringida(Cuenta $actor): bool
    {
        return ! $this->accesos->esAdministrador($actor);
    }

    public function puedeAprobar(Cuenta $actor): bool
    {
        if ($actor->tipoCuenta() !== 'DOCENTE') {
            return false;
        }
        $cop = DB::table('docente')->where('id_docente', $actor->idActor())->where('estado', 1)->value('numero_colegiatura');

        return $actor->estaActiva() && ! $actor->estaBloqueada() && preg_match('/^\d{4,8}$/', (string) $cop) === 1;
    }

    public function restringido(Cuenta $actor): bool
    {
        return $actor->tipoCuenta() === 'ALUMNO';
    }

    public function puedeVer(Cuenta $actor, int $idHistoria): bool
    {
        $consulta = DB::table('historia_clinica as h')
            ->where('id_historia_clinica', $idHistoria)
            ->whereNull('h.anulado_en');

        return $this->filtrar($consulta, $actor)->exists();
    }

    /** Una historia validada solo puede corregirla un docente. */
    public function puedeModificar(Cuenta $actor, int $idHistoria): bool
    {
        if (! $this->puedeVer($actor, $idHistoria)) {
            return false;
        }
        if (! $this->restringido($actor)) {
            return true;
        }

        return DB::table('historia_clinica as h')
            ->join('estado_historia_clinica as e', 'e.id_estado_historia', '=', 'h.id_estado_historia')
            ->where('h.id_historia_clinica', $idHistoria)
            ->value('e.codigo') !== 'VALIDADA';
    }

    /**
     * Secciones aprobadas por un docente: su contenido queda congelado para el alumno.
     *
     * @return list<string>
     */
    public function seccionesBloqueadas(Cuenta $actor, int $idHistoria): array
    {
        return DB::table('historia_seccion_estado')
            ->where('id_historia_clinica', $idHistoria)
            ->where('estado', 'approved')
            ->pluck('codigo_seccion')
            ->all();
    }

    public function seccionEditable(Cuenta $actor, int $idHistoria, string $seccion): bool
    {
        return ! in_array($seccion, $this->seccionesBloqueadas($actor, $idHistoria), true);
    }

    /** Limita una consulta que expone h.id_historia_clinica a las historias visibles por el actor. */
    public function filtrar(Builder $consulta, Cuenta $actor, string $columna = 'h.id_historia_clinica'): Builder
    {
        if (! $this->visibilidadRestringida($actor)) {
            return $consulta;
        }

        return $consulta->whereExists(function ($q) use ($actor, $columna) {
            $tipo = $actor->tipoCuenta() === 'ALUMNO' ? 'alumno' : 'docente';
            $q->select(DB::raw(1))
                ->from('historia_'.$tipo.' as acceso')
                ->whereColumn('acceso.id_historia_clinica', $columna)
                ->where('acceso.id_'.$tipo, $actor->idActor())
                ->where('acceso.estado', 1);
        });
    }

    /** Paciente visible si el usuario clínico tiene alguna historia activa asociada. */
    public function puedeVerPaciente(Cuenta $actor, int $idPaciente): bool
    {
        if (! $this->visibilidadRestringida($actor)) {
            return true;
        }

        $consulta = DB::table('historia_clinica as h')
            ->where('h.id_paciente', $idPaciente)
            ->whereNull('h.anulado_en');

        return $this->filtrar($consulta, $actor)->exists();
    }

    /** Limita una consulta sobre paciente (alias p) según asignaciones clínicas. */
    public function filtrarPacientes(Builder $consulta, Cuenta $actor, string $columna = 'p.id_paciente'): Builder
    {
        if (! $this->visibilidadRestringida($actor)) {
            return $consulta;
        }

        return $consulta->whereExists(function ($q) use ($actor, $columna) {
            $q->select(DB::raw(1))
                ->from('historia_clinica as acceso_h')
                ->whereColumn('acceso_h.id_paciente', $columna)
                ->whereNull('acceso_h.anulado_en');
            $this->filtrar($q, $actor, 'acceso_h.id_historia_clinica');
        });
    }
}
