<?php

namespace App\Clinica\Historias;

use App\Identidad\Dominio\Cuenta;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Los docentes supervisan todas las historias; un alumno solo accede a las que
 * tiene asignadas con participación vigente en historia_alumno.
 */
class AccesoHistorias
{
    public function restringido(Cuenta $actor): bool
    {
        return $actor->tipoCuenta() === 'ALUMNO';
    }

    public function puedeVer(Cuenta $actor, int $idHistoria): bool
    {
        $vigente = DB::table('historia_clinica')
            ->where('id_historia_clinica', $idHistoria)
            ->whereNull('anulado_en')
            ->exists();

        if (! $vigente) {
            return false;
        }

        if (! $this->restringido($actor)) {
            return true;
        }

        return DB::table('historia_alumno')
            ->where('id_historia_clinica', $idHistoria)
            ->where('id_alumno', $actor->idActor())
            ->where('estado', 1)
            ->exists();
    }

    /** Una historia validada solo puede corregirla un docente. */
    public function puedeModificar(Cuenta $actor, int $idHistoria): bool
    {
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
        if (! $this->restringido($actor)) {
            return [];
        }

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
        if (! $this->restringido($actor)) {
            return $consulta;
        }

        return $consulta->whereExists(function ($q) use ($actor, $columna) {
            $q->select(DB::raw(1))
                ->from('historia_alumno as acceso')
                ->whereColumn('acceso.id_historia_clinica', $columna)
                ->where('acceso.id_alumno', $actor->idActor())
                ->where('acceso.estado', 1);
        });
    }

    /** Paciente visible si el alumno tiene alguna historia activa asociada. */
    public function puedeVerPaciente(Cuenta $actor, int $idPaciente): bool
    {
        if (! $this->restringido($actor)) {
            return true;
        }

        return DB::table('historia_clinica as h')
            ->join('historia_alumno as ha', 'ha.id_historia_clinica', '=', 'h.id_historia_clinica')
            ->where('h.id_paciente', $idPaciente)
            ->whereNull('h.anulado_en')
            ->where('ha.id_alumno', $actor->idActor())
            ->where('ha.estado', 1)
            ->exists();
    }

    /** Limita una consulta sobre paciente (alias p) a los pacientes del alumno. */
    public function filtrarPacientes(Builder $consulta, Cuenta $actor, string $columna = 'p.id_paciente'): Builder
    {
        if (! $this->restringido($actor)) {
            return $consulta;
        }

        return $consulta->whereExists(function ($q) use ($actor, $columna) {
            $q->select(DB::raw(1))
                ->from('historia_clinica as acceso_h')
                ->join('historia_alumno as acceso_ha', 'acceso_ha.id_historia_clinica', '=', 'acceso_h.id_historia_clinica')
                ->whereColumn('acceso_h.id_paciente', $columna)
                ->whereNull('acceso_h.anulado_en')
                ->where('acceso_ha.id_alumno', $actor->idActor())
                ->where('acceso_ha.estado', 1);
        });
    }
}
