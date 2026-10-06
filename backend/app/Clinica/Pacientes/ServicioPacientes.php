<?php

namespace App\Clinica\Pacientes;

use App\Clinica\Soporte\Valores;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class ServicioPacientes
{
    public function listar(?string $busqueda = null, ?string $estado = null): array
    {
        $consulta = DB::table('paciente')->whereNull('eliminado_en')->orderByDesc('id_paciente');

        if ($busqueda !== null && trim($busqueda) !== '') {
            $texto = trim($busqueda);
            $consulta->where(function ($q) use ($texto) {
                $q->where('nombres', 'like', "%{$texto}%")
                    ->orWhere('apellidos', 'like', "%{$texto}%")
                    ->orWhere('numero_documento', 'like', "%{$texto}%");
            });
        }

        if ($estado !== null && $estado !== '') {
            $consulta->where('estado_atencion', $estado);
        }

        return $consulta->limit(300)->get()->map(fn ($fila) => $this->serializar($fila))->all();
    }

    public function mostrar(int $id): array
    {
        return $this->serializar($this->fila($id));
    }

    public function crear(array $datos): array
    {
        [$nombres, $apellidos] = Valores::nombresYApellidos($datos);
        $documento = Valores::texto($datos['numeroDocumento'] ?? $datos['dni'] ?? null);

        if ($nombres === '' || $documento === null) {
            throw new OperacionNoPermitida('nombres', 'Indica nombres y número de documento.');
        }

        if ($apellidos === '') {
            $apellidos = '-';
        }

        if (DB::table('paciente')->where('tipo_documento', $datos['tipoDocumento'] ?? $datos['tipo_documento'] ?? 'DNI')->where('numero_documento', $documento)->whereNull('eliminado_en')->exists()) {
            throw new OperacionNoPermitida('numeroDocumento', 'Ya existe un paciente con ese documento.');
        }

        $id = DB::table('paciente')->insertGetId($this->columnas($datos, $nombres, $apellidos, $documento));

        return $this->mostrar($id);
    }

    public function actualizar(int $id, array $datos): array
    {
        $this->fila($id);
        [$nombres, $apellidos] = Valores::nombresYApellidos($datos);
        $documento = Valores::texto($datos['numeroDocumento'] ?? $datos['dni'] ?? null);

        if ($documento !== null && DB::table('paciente')
            ->where('tipo_documento', $datos['tipoDocumento'] ?? 'DNI')
            ->where('numero_documento', $documento)
            ->where('id_paciente', '!=', $id)
            ->whereNull('eliminado_en')
            ->exists()) {
            throw new OperacionNoPermitida('numeroDocumento', 'Ya existe un paciente con ese documento.');
        }

        DB::table('paciente')->where('id_paciente', $id)->update($this->columnas($datos, $nombres, $apellidos, $documento));

        return $this->mostrar($id);
    }

    /**
     * @return array<string, mixed>
     */
    public function columnas(array $datos, string $nombres, string $apellidos, ?string $documento): array
    {
        $columnas = [
            'tipo_documento' => Valores::texto($datos['tipoDocumento'] ?? $datos['tipo_documento'] ?? null) ?? 'DNI',
            'nombres' => $nombres,
            'apellidos' => $apellidos,
            'fecha_nacimiento' => Valores::texto($datos['fechaNacimiento'] ?? $datos['nacimiento'] ?? null),
            'sexo' => $this->sexo($datos['sexo'] ?? null),
            'telefono' => Valores::texto($datos['telefono'] ?? $datos['celular'] ?? null),
            'correo' => Valores::texto($datos['correo'] ?? $datos['email'] ?? null),
            'direccion' => Valores::texto($datos['direccion'] ?? $datos['domicilio'] ?? null),
            'ocupacion' => Valores::texto($datos['ocupacion'] ?? null),
            'observaciones' => Valores::texto($datos['observaciones'] ?? null),
            'lugar_nacimiento' => Valores::texto($datos['lugarNacimiento'] ?? null),
            'procedencia' => Valores::texto($datos['procedencia'] ?? null),
            'estado_civil' => Valores::texto($datos['estadoCivil'] ?? null),
            'grado_instruccion' => Valores::texto($datos['gradoInstruccion'] ?? null),
            'centro_estudios' => Valores::texto($datos['centroEstudios'] ?? null),
            'idioma_materno' => Valores::texto($datos['idiomaMaterno'] ?? null),
            'religion' => Valores::texto($datos['religion'] ?? null),
            'lugar_trabajo' => Valores::texto($datos['lugarTrabajo'] ?? null),
            'tiempo_residencia' => Valores::texto($datos['tiempoResidencia'] ?? null),
            'modalidad_asistencia' => Valores::texto($datos['modalidadAsistencia'] ?? null),
            'departamento' => Valores::texto($datos['departamento'] ?? null),
            'provincia' => Valores::texto($datos['provincia'] ?? null),
            'distrito' => Valores::texto($datos['distrito'] ?? null),
            'direccion_alternativa' => Valores::texto($datos['direccionAlternativa'] ?? null),
            'telefono_adicional' => Valores::texto($datos['telefonoAdicional'] ?? null),
            'estado_atencion' => Valores::texto($datos['estado'] ?? null) ?? 'Registrado',
        ];

        if ($documento !== null) {
            $columnas['numero_documento'] = $documento;
        }

        return $columnas;
    }

    public function serializar(object $fila): array
    {
        $historias = DB::table('historia_clinica')
            ->where('id_paciente', $fila->id_paciente)
            ->whereNull('anulado_en')
            ->orderByDesc('fecha_apertura')
            ->get(['numero_historia', 'fecha_apertura']);

        $apellidos = preg_split('/\s+/', (string) $fila->apellidos) ?: [];

        return [
            'id' => (int) $fila->id_paciente,
            'nombres' => trim($fila->nombres.' '.$fila->apellidos),
            'apellidoPaterno' => $apellidos[0] ?? '',
            'apellidoMaterno' => implode(' ', array_slice($apellidos, 1)),
            'dni' => $fila->numero_documento,
            'tipoDocumento' => $fila->tipo_documento,
            'numeroDocumento' => $fila->numero_documento,
            'edad' => Valores::edad($fila->fecha_nacimiento),
            'sexo' => $fila->sexo ?? '',
            'telefono' => $fila->telefono ?? '',
            'correo' => $fila->correo ?? '',
            'fechaNacimiento' => $fila->fecha_nacimiento,
            'direccion' => $fila->direccion ?? '',
            'ocupacion' => $fila->ocupacion ?? '',
            'observaciones' => $fila->observaciones ?? '',
            'historias' => $historias->count(),
            'hc' => $historias->first()->numero_historia ?? '',
            'ultimaAtencion' => $historias->first()->fecha_apertura ?? 'Sin atención',
            'estado' => $fila->estado_atencion,
        ];
    }

    public function fila(int $id): object
    {
        $fila = DB::table('paciente')->where('id_paciente', $id)->whereNull('eliminado_en')->first();

        if ($fila === null) {
            throw (new ModelNotFoundException)->setModel('paciente', [$id]);
        }

        return $fila;
    }

    public function sincronizarFicha(int $id, array $datos, Cuenta $actor): void
    {
        $actual = $this->fila($id);
        $fusion = array_merge([
            'nombres' => trim($actual->nombres.' '.$actual->apellidos),
            'dni' => $actual->numero_documento,
            'tipoDocumento' => $actual->tipo_documento,
        ], $datos);

        if (isset($datos['nombres']) || isset($datos['apellidos'])) {
            $fusion['nombres'] = $datos['nombres'] ?? $actual->nombres;
            $fusion['apellidoPaterno'] = $datos['apellidos'] ?? $actual->apellidos;
            $fusion['apellidoMaterno'] = '';
        }

        $this->actualizar($id, $fusion);

        $nombreContacto = Valores::texto($datos['acompanante'] ?? $datos['informante'] ?? null);
        if ($nombreContacto === null) {
            return;
        }

        $contacto = [
            'tipo_contacto' => 'ACOMPANANTE',
            'nombre' => $nombreContacto,
            'parentesco' => Valores::texto($datos['tutorParentesco'] ?? null),
            'telefono' => Valores::texto($datos['tutorTelefono'] ?? $datos['telefonoTutor'] ?? null),
            'numero_documento' => Valores::texto($datos['tutorDocumento'] ?? null),
            'ocupacion' => Valores::texto($datos['tutorOcupacion'] ?? null),
            'direccion' => Valores::texto($datos['tutorDireccion'] ?? null),
            'confiabilidad' => Valores::texto($datos['confiabilidad'] ?? null),
            'es_principal' => 1,
            'estado' => 1,
        ];

        $existente = DB::table('paciente_contacto')->where('id_paciente', $id)->where('es_principal', 1)->value('id_paciente_contacto');

        if ($existente) {
            DB::table('paciente_contacto')->where('id_paciente_contacto', $existente)->update($contacto);
        } else {
            DB::table('paciente_contacto')->insert($contacto + ['id_paciente' => $id, 'creado_en' => now()]);
        }
    }

    private function sexo(mixed $valor): ?string
    {
        $sexo = strtoupper(substr(trim((string) ($valor ?? '')), 0, 1));

        return in_array($sexo, ['M', 'F', 'O'], true) ? $sexo : null;
    }
}
