<?php

namespace App\Academico;

use App\Clinica\Soporte\Valores;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Support\Facades\DB;

class ServicioAcademico
{
    public function estado(): array
    {
        return [
            'personas' => $this->personas(),
            'cursos' => $this->cursos(),
            'periodos' => $this->periodos(),
            'grupos' => $this->grupos(),
            'membresias' => $this->membresias(),
            'rotaciones' => $this->rotaciones(),
            'docentesRotacion' => $this->docentesRotacion(),
            'asignacionesExcepcionales' => $this->asignaciones(),
        ];
    }

    public function crearPeriodo(array $datos): array
    {
        $inicio = Valores::texto($datos['fechaInicio'] ?? null);
        $fin = Valores::texto($datos['fechaFin'] ?? null);
        if ($inicio === null || $fin === null || $fin < $inicio) {
            throw new OperacionNoPermitida('fechaFin', 'La fecha final debe ser igual o posterior a la fecha inicial.');
        }
        $codigo = strtoupper((string) Valores::texto($datos['codigo'] ?? null));
        if (DB::table('periodo_academico')->where('codigo', $codigo)->exists()) {
            throw new OperacionNoPermitida('codigo', 'Ya existe un periodo con ese código.');
        }
        $anio = (int) substr($inicio, 0, 4);
        $id = DB::table('periodo_academico')->insertGetId([
            'codigo' => $codigo,
            'nombre' => (string) Valores::texto($datos['nombre'] ?? null),
            'anio' => $anio > 0 ? $anio : (int) now()->format('Y'),
            'semestre' => $this->semestre($codigo, $inicio),
            'fecha_inicio' => $inicio,
            'fecha_fin' => $fin,
            'estado' => $this->activo($datos['estado'] ?? 'activo'),
            'creado_en' => now(),
        ]);

        return $this->periodo($id);
    }

    public function crearCurso(array $datos): array
    {
        return $this->guardarCurso(null, $datos);
    }

    public function actualizarCurso(int $id, array $datos): array
    {
        return $this->guardarCurso($id, $datos);
    }

    public function crearGrupo(array $datos): array
    {
        return $this->guardarGrupo(null, $datos);
    }

    public function actualizarGrupo(int $id, array $datos): array
    {
        return $this->guardarGrupo($id, $datos);
    }

    public function guardarMembresias(int $idGrupo, array $membresias): array
    {
        $this->exigir('grupo_academico', 'id_grupo', $idGrupo, 'No se encontró el grupo.');
        $creadas = [];
        foreach ($membresias as $item) {
            $idAlumno = $this->idAlumno($item['personaId'] ?? null);
            $inicio = Valores::texto($item['fechaInicio'] ?? null) ?? now()->toDateString();
            $activa = DB::table('grupo_miembro')
                ->where('id_grupo', $idGrupo)
                ->where('id_alumno', $idAlumno)
                ->where('estado', 'ACTIVA')
                ->whereNull('fecha_fin')
                ->exists();
            if ($activa) {
                throw new OperacionNoPermitida('personaId', 'La persona ya tiene una membresía activa en este grupo.');
            }
            $id = DB::table('grupo_miembro')->insertGetId([
                'id_grupo' => $idGrupo,
                'id_alumno' => $idAlumno,
                'fecha_inicio' => $inicio,
                'fecha_fin' => Valores::texto($item['fechaFin'] ?? null),
                'estado' => 'ACTIVA',
                'creado_en' => now(),
            ]);
            $creadas[] = $this->membresia($id);
        }

        return $creadas;
    }

    public function finalizarMembresia(int $id, string $fechaFin): array
    {
        $fila = DB::table('grupo_miembro')->where('id_grupo_miembro', $id)->first();
        if ($fila === null) {
            throw new OperacionNoPermitida('membresia', 'No se encontró la membresía.');
        }
        if ($fechaFin === '' || $fechaFin < $fila->fecha_inicio) {
            throw new OperacionNoPermitida('fechaFin', 'La fecha final debe ser igual o posterior a la fecha inicial.');
        }
        DB::table('grupo_miembro')->where('id_grupo_miembro', $id)->update([
            'fecha_fin' => $fechaFin,
            'estado' => 'FINALIZADA',
        ]);

        return $this->membresia($id);
    }

    public function crearRotacion(array $datos): array
    {
        $inicio = Valores::texto($datos['fechaInicio'] ?? null);
        $fin = Valores::texto($datos['fechaFin'] ?? null);
        if ($inicio === null || $fin === null || $fin < $inicio) {
            throw new OperacionNoPermitida('fechaFin', 'La fecha final debe ser igual o posterior a la fecha inicial.');
        }
        $id = DB::table('rotacion')->insertGetId([
            'id_grupo' => (int) ($datos['grupoId'] ?? 0),
            'id_curso' => (int) ($datos['cursoId'] ?? 0),
            'id_periodo_academico' => (int) ($datos['periodoId'] ?? 0),
            'fecha_inicio' => $inicio,
            'fecha_fin' => $fin,
            'estado' => strtoupper((string) (Valores::texto($datos['estado'] ?? null) ?? 'PROGRAMADA')),
            'creado_en' => now(),
        ]);

        return $this->rotacion($id);
    }

    public function guardarDocentes(int $idRotacion, array $docentes): array
    {
        $this->exigir('rotacion', 'id_rotacion', $idRotacion, 'No se encontró la rotación.');
        $creados = [];
        foreach ($docentes as $item) {
            $idDocente = $this->idDocente($item['personaId'] ?? null);
            if (DB::table('rotacion_docente')->where('id_rotacion', $idRotacion)->where('id_docente', $idDocente)->exists()) {
                throw new OperacionNoPermitida('personaId', 'El docente ya está asignado a esta rotación.');
            }
            $funcion = $this->funcionDocente($item['funcion'] ?? null);
            $id = DB::table('rotacion_docente')->insertGetId([
                'id_rotacion' => $idRotacion,
                'id_docente' => $idDocente,
                'funcion' => $funcion,
                'creado_en' => now(),
            ]);
            $creados[] = [
                'id' => $id,
                'rotacionId' => $idRotacion,
                'personaId' => 'docente-'.$idDocente,
                'funcion' => $this->funcionDocenteVisible($funcion),
            ];
        }

        return $creados;
    }

    public function guardarAsignaciones(int $idRotacion, array $personas): array
    {
        $this->exigir('rotacion', 'id_rotacion', $idRotacion, 'No se encontró la rotación.');
        $creadas = [];
        foreach ($personas as $item) {
            $idAlumno = $this->idAlumno($item['personaId'] ?? null);
            if (DB::table('rotacion_alumno')->where('id_rotacion', $idRotacion)->where('id_alumno', $idAlumno)->exists()) {
                throw new OperacionNoPermitida('personaId', 'La persona ya está asignada a esta rotación.');
            }
            $id = DB::table('rotacion_alumno')->insertGetId([
                'id_rotacion' => $idRotacion,
                'id_alumno' => $idAlumno,
                'tipo_asignacion' => 'EXCEPCIONAL',
                'estado' => 1,
                'creado_en' => now(),
            ]);
            $creadas[] = ['id' => $id, 'rotacionId' => $idRotacion, 'personaId' => 'alumno-'.$idAlumno];
        }

        return $creadas;
    }

    private function personas(): array
    {
        $alumnos = DB::table('alumno')->where('estado', 1)->orderBy('apellidos')->get()->map(fn ($fila) => [
            'id' => 'alumno-'.$fila->id_alumno,
            'tipo' => 'estudiante',
            'nombre' => trim($fila->nombres.' '.$fila->apellidos),
            'documento' => $fila->numero_documento,
        ]);
        $docentes = DB::table('docente')->where('estado', 1)->orderBy('apellidos')->get()->map(fn ($fila) => [
            'id' => 'docente-'.$fila->id_docente,
            'tipo' => 'docente',
            'nombre' => trim($fila->nombres.' '.$fila->apellidos),
            'documento' => $fila->numero_documento,
        ]);

        return $alumnos->concat($docentes)->values()->all();
    }

    private function cursos(): array
    {
        return DB::table('curso')->orderBy('codigo')->get()->map(fn ($fila) => [
            'id' => (int) $fila->id_curso,
            'codigo' => $fila->codigo,
            'nombre' => $fila->nombre,
            'descripcion' => $fila->descripcion ?? '',
            'estado' => $fila->estado ? 'activo' : 'inactivo',
        ])->all();
    }

    private function periodos(): array
    {
        return DB::table('periodo_academico')->orderByDesc('fecha_inicio')->get()->map(fn ($fila) => $this->periodo((int) $fila->id_periodo_academico))->all();
    }

    private function grupos(): array
    {
        return DB::table('grupo_academico')->orderBy('codigo')->get()->map(fn ($fila) => [
            'id' => (int) $fila->id_grupo,
            'codigo' => $fila->codigo,
            'nombre' => $fila->nombre,
            'semestre' => $fila->semestre,
            'estado' => $fila->estado ? 'activo' : 'inactivo',
        ])->all();
    }

    private function membresias(): array
    {
        return DB::table('grupo_miembro')->orderByDesc('id_grupo_miembro')->get()->map(fn ($fila) => $this->membresia((int) $fila->id_grupo_miembro))->all();
    }

    private function rotaciones(): array
    {
        return DB::table('rotacion')->orderByDesc('fecha_inicio')->get()->map(fn ($fila) => $this->rotacion((int) $fila->id_rotacion))->all();
    }

    private function docentesRotacion(): array
    {
        return DB::table('rotacion_docente')->get()->map(fn ($fila) => [
            'id' => (int) $fila->id_rotacion_docente,
            'rotacionId' => (int) $fila->id_rotacion,
            'personaId' => 'docente-'.$fila->id_docente,
            'funcion' => $this->funcionDocenteVisible($fila->funcion),
        ])->all();
    }

    private function asignaciones(): array
    {
        return DB::table('rotacion_alumno')->where('estado', 1)->get()->map(fn ($fila) => [
            'id' => (int) $fila->id_rotacion_alumno,
            'rotacionId' => (int) $fila->id_rotacion,
            'personaId' => 'alumno-'.$fila->id_alumno,
        ])->all();
    }

    private function guardarCurso(?int $id, array $datos): array
    {
        $codigo = strtoupper((string) Valores::texto($datos['codigo'] ?? null));
        $duplicado = DB::table('curso')->where('codigo', $codigo)->when($id, fn ($q) => $q->where('id_curso', '!=', $id))->exists();
        if ($duplicado) {
            throw new OperacionNoPermitida('codigo', 'Ya existe un curso con ese código.');
        }
        $fila = [
            'codigo' => $codigo,
            'nombre' => (string) Valores::texto($datos['nombre'] ?? null),
            'descripcion' => Valores::texto($datos['descripcion'] ?? null),
            'estado' => $this->activo($datos['estado'] ?? 'activo'),
        ];
        if ($id === null) {
            $id = (int) DB::table('curso')->insertGetId($fila + ['creado_en' => now()]);
        } else {
            $this->exigir('curso', 'id_curso', $id, 'No se encontró el curso.');
            DB::table('curso')->where('id_curso', $id)->update($fila);
        }
        $guardado = DB::table('curso')->where('id_curso', $id)->first();

        return [
            'id' => $id,
            'codigo' => $guardado->codigo,
            'nombre' => $guardado->nombre,
            'descripcion' => $guardado->descripcion ?? '',
            'estado' => $guardado->estado ? 'activo' : 'inactivo',
        ];
    }

    private function guardarGrupo(?int $id, array $datos): array
    {
        $codigo = strtoupper((string) Valores::texto($datos['codigo'] ?? null));
        $duplicado = DB::table('grupo_academico')->where('codigo', $codigo)->when($id, fn ($q) => $q->where('id_grupo', '!=', $id))->exists();
        if ($duplicado) {
            throw new OperacionNoPermitida('codigo', 'Ya existe un grupo con ese código.');
        }
        $fila = [
            'codigo' => $codigo,
            'nombre' => (string) Valores::texto($datos['nombre'] ?? null),
            'semestre' => (string) Valores::texto($datos['semestre'] ?? null),
            'estado' => $this->activo($datos['estado'] ?? 'activo'),
        ];
        if ($id === null) {
            $id = (int) DB::table('grupo_academico')->insertGetId($fila + ['creado_en' => now()]);
        } else {
            $this->exigir('grupo_academico', 'id_grupo', $id, 'No se encontró el grupo.');
            DB::table('grupo_academico')->where('id_grupo', $id)->update($fila);
        }
        $guardado = DB::table('grupo_academico')->where('id_grupo', $id)->first();

        return [
            'id' => $id,
            'codigo' => $guardado->codigo,
            'nombre' => $guardado->nombre,
            'semestre' => $guardado->semestre,
            'estado' => $guardado->estado ? 'activo' : 'inactivo',
        ];
    }

    private function periodo(int $id): array
    {
        $fila = DB::table('periodo_academico')->where('id_periodo_academico', $id)->first();

        return [
            'id' => (int) $fila->id_periodo_academico,
            'codigo' => $fila->codigo,
            'nombre' => $fila->nombre,
            'fechaInicio' => $fila->fecha_inicio,
            'fechaFin' => $fila->fecha_fin,
            'estado' => $fila->estado ? 'activo' : 'inactivo',
        ];
    }

    private function membresia(int $id): array
    {
        $fila = DB::table('grupo_miembro')->where('id_grupo_miembro', $id)->first();

        return [
            'id' => (int) $fila->id_grupo_miembro,
            'grupoId' => (int) $fila->id_grupo,
            'personaId' => 'alumno-'.$fila->id_alumno,
            'funcion' => 'estudiante',
            'fechaInicio' => $fila->fecha_inicio,
            'fechaFin' => $fila->fecha_fin ?? '',
            'estado' => strtolower($fila->estado) === 'finalizada' ? 'finalizada' : 'activa',
        ];
    }

    private function rotacion(int $id): array
    {
        $fila = DB::table('rotacion')->where('id_rotacion', $id)->first();

        return [
            'id' => (int) $fila->id_rotacion,
            'grupoId' => (int) $fila->id_grupo,
            'cursoId' => (int) $fila->id_curso,
            'periodoId' => (int) $fila->id_periodo_academico,
            'fechaInicio' => $fila->fecha_inicio,
            'fechaFin' => $fila->fecha_fin,
            'estado' => strtolower($fila->estado),
        ];
    }

    private function idAlumno(mixed $personaId): int
    {
        if (! preg_match('/^alumno-(\d+)$/', (string) $personaId, $coincidencia)) {
            throw new OperacionNoPermitida('personaId', 'Selecciona un alumno válido.');
        }

        return (int) $coincidencia[1];
    }

    private function idDocente(mixed $personaId): int
    {
        if (! preg_match('/^docente-(\d+)$/', (string) $personaId, $coincidencia)) {
            throw new OperacionNoPermitida('personaId', 'Selecciona un docente válido.');
        }

        return (int) $coincidencia[1];
    }

    private function exigir(string $tabla, string $pk, int $id, string $mensaje): void
    {
        if (! DB::table($tabla)->where($pk, $id)->exists()) {
            throw new OperacionNoPermitida('id', $mensaje);
        }
    }

    private function activo(mixed $estado): int
    {
        return in_array(strtolower((string) $estado), ['inactivo', '0', 'false'], true) ? 0 : 1;
    }

    private function semestre(string $codigo, string $inicio): string
    {
        if (str_contains($codigo, 'II')) {
            return 'II';
        }
        if (str_contains($codigo, 'I')) {
            return 'I';
        }

        return ((int) substr($inicio, 5, 2)) >= 8 ? 'II' : 'I';
    }

    private function funcionDocente(mixed $valor): string
    {
        return match (strtolower((string) Valores::texto($valor))) {
            'responsable', 'encargado' => 'ENCARGADO',
            'supervisor' => 'SUPERVISOR',
            default => 'COLABORADOR',
        };
    }

    private function funcionDocenteVisible(mixed $valor): string
    {
        return match (strtoupper((string) $valor)) {
            'ENCARGADO' => 'responsable',
            'SUPERVISOR' => 'supervisor',
            default => 'colaborador',
        };
    }
}
