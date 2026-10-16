<?php

namespace App\Clinica\Pacientes;

use App\Clinica\Historias\AccesoHistorias;
use App\Clinica\Soporte\Valores;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class ServicioPacientes
{
    public function __construct(private readonly AccesoHistorias $acceso) {}

    public function listar(?string $busqueda = null, ?string $estado = null, ?Cuenta $actor = null): array
    {
        $consulta = DB::table('paciente as p')->whereNull('p.eliminado_en')->orderByDesc('p.id_paciente');

        if ($actor !== null) {
            $this->acceso->filtrarPacientes($consulta, $actor);
        }

        if ($busqueda !== null && trim($busqueda) !== '') {
            $patron = '%'.addcslashes(trim($busqueda), '%_\\').'%';
            $consulta->where(function ($q) use ($patron) {
                $q->where('p.nombres', 'like', $patron)
                    ->orWhere('p.apellidos', 'like', $patron)
                    ->orWhere('p.numero_documento', 'like', $patron);
            });
        }

        if ($estado !== null && $estado !== '') {
            $consulta->where('p.estado_atencion', $estado);
        }

        return $consulta->limit(300)->get()->map(fn ($fila) => $this->serializar($fila))->all();
    }

    public function mostrar(int $id, ?Cuenta $actor = null): array
    {
        $this->exigirVisibilidad($id, $actor);

        return $this->serializar($this->fila($id));
    }

    /**
     * Búsqueda exacta por documento (para abrir historia nueva).
     * Quien no tiene la ficha asignada solo recibe datos mínimos de identificación.
     *
     * @return array<string, mixed>|null
     */
    public function buscarPorDocumento(string $documento, string $tipoDocumento = 'DNI', ?Cuenta $actor = null): ?array
    {
        $documento = trim($documento);
        if ($documento === '') {
            return null;
        }

        $fila = DB::table('paciente')
            ->whereNull('eliminado_en')
            ->where('tipo_documento', $tipoDocumento)
            ->where('numero_documento', $documento)
            ->first();

        if ($fila === null) {
            return null;
        }

        if ($actor !== null && $this->acceso->puedeVerPaciente($actor, (int) $fila->id_paciente)) {
            return $this->serializar($fila);
        }

        if ($actor !== null && $this->acceso->restringido($actor)) {
            return [
                'id' => (int) $fila->id_paciente,
                'nombres' => trim($fila->nombres.' '.$fila->apellidos),
                'dni' => $fila->numero_documento,
                'tipoDocumento' => $fila->tipo_documento,
                'numeroDocumento' => $fila->numero_documento,
                'sexo' => $fila->sexo ?? '',
                'fechaNacimiento' => $fila->fecha_nacimiento,
                'edad' => Valores::edad($fila->fecha_nacimiento),
            ];
        }

        return $this->serializar($fila);
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

    /**
     * Actualización parcial: solo se escriben las columnas cuyas claves llegan en $datos.
     */
    public function actualizar(int $id, array $datos, ?Cuenta $actor = null): array
    {
        $this->exigirVisibilidad($id, $actor);
        $actual = $this->fila($id);
        $documento = Valores::texto($datos['numeroDocumento'] ?? $datos['dni'] ?? null);
        $tipoDocumento = Valores::texto($datos['tipoDocumento'] ?? $datos['tipo_documento'] ?? null) ?? $actual->tipo_documento;

        if ($documento !== null && DB::table('paciente')
            ->where('tipo_documento', $tipoDocumento)
            ->where('numero_documento', $documento)
            ->where('id_paciente', '!=', $id)
            ->whereNull('eliminado_en')
            ->exists()) {
            throw new OperacionNoPermitida('numeroDocumento', 'Ya existe un paciente con ese documento.');
        }

        $columnas = $this->columnas($datos, null, null, $documento, parcial: true);
        if (array_key_exists('nombres', $datos) || array_key_exists('apellidoPaterno', $datos)) {
            [$nombres, $apellidos] = Valores::nombresYApellidos($datos);
            if ($nombres !== '') {
                $columnas['nombres'] = mb_substr($nombres, 0, 180);
                $columnas['apellidos'] = mb_substr($apellidos !== '' ? $apellidos : $actual->apellidos, 0, 120);
            }
        }

        if ($columnas !== []) {
            DB::table('paciente')->where('id_paciente', $id)->update($columnas);
        }

        return $this->mostrar($id);
    }

    /**
     * @return array<string, mixed>
     */
    /**
     * Columna => [claves aceptadas (la primera es la del frontend), longitud máxima].
     */
    private const COLUMNAS = [
        'tipo_documento' => [['tipoDocumento', 'tipo_documento'], 20],
        'fecha_nacimiento' => [['fechaNacimiento', 'nacimiento'], 10],
        'telefono' => [['celular', 'telefono'], 30],
        'correo' => [['correo', 'email'], 150],
        'direccion' => [['domicilio', 'direccion'], 250],
        'ocupacion' => [['ocupacion'], 120],
        'observaciones' => [['observaciones'], 65535],
        'lugar_nacimiento' => [['lugarNacimiento'], 150],
        'procedencia' => [['procedencia'], 150],
        'estado_civil' => [['estadoCivil'], 40],
        'grado_instruccion' => [['gradoInstruccion'], 40],
        'centro_estudios' => [['centroEstudios'], 150],
        'idioma_materno' => [['idioma', 'idiomaMaterno'], 80],
        'religion' => [['religion'], 80],
        'lugar_trabajo' => [['lugarTrabajo'], 150],
        'tiempo_residencia' => [['tiempoResidencia'], 80],
        'modalidad_asistencia' => [['modalidadAsistencia'], 30],
        'departamento' => [['departamento'], 80],
        'provincia' => [['provincia'], 80],
        'distrito' => [['distrito'], 80],
        'direccion_alternativa' => [['domicilioRegistro2', 'direccionAlternativa'], 250],
        'telefono_adicional' => [['telefonoRegistro2', 'telefonoAdicional'], 30],
        'estado_atencion' => [['estado'], 40],
    ];

    /**
     * @return array<string, mixed>
     */
    public function columnas(array $datos, ?string $nombres, ?string $apellidos, ?string $documento, bool $parcial = false): array
    {
        $columnas = [];
        foreach (self::COLUMNAS as $columna => [$claves, $longitud]) {
            $clave = $this->primeraClave($datos, $claves);
            if ($clave === null && $parcial) {
                continue;
            }
            $valor = $clave === null ? null : Valores::texto($datos[$clave]);
            $columnas[$columna] = $valor === null ? null : mb_substr($valor, 0, $longitud);
        }
        if (! $parcial || array_key_exists('sexo', $datos)) {
            $columnas['sexo'] = $this->sexo($datos['sexo'] ?? null);
        }

        if (! $parcial) {
            $columnas['tipo_documento'] ??= 'DNI';
            $columnas['estado_atencion'] ??= 'Registrado';
            $columnas['nombres'] = mb_substr((string) $nombres, 0, 180);
            $columnas['apellidos'] = mb_substr((string) $apellidos, 0, 120);
        } elseif (array_key_exists('estado_atencion', $columnas) && $columnas['estado_atencion'] === null) {
            unset($columnas['estado_atencion']);
        }
        if (array_key_exists('tipo_documento', $columnas) && $columnas['tipo_documento'] === null) {
            unset($columnas['tipo_documento']);
        }

        if ($documento !== null) {
            $columnas['numero_documento'] = mb_substr($documento, 0, 20);
        }

        return $columnas;
    }

    private function primeraClave(array $datos, array $claves): ?string
    {
        foreach ($claves as $clave) {
            if (array_key_exists($clave, $datos)) {
                return $clave;
            }
        }

        return null;
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

    private function exigirVisibilidad(int $id, ?Cuenta $actor): void
    {
        if ($actor !== null && ! $this->acceso->puedeVerPaciente($actor, $id)) {
            throw (new ModelNotFoundException)->setModel('paciente', [$id]);
        }
    }

    public function fila(int $id): object
    {
        $fila = DB::table('paciente')->where('id_paciente', $id)->whereNull('eliminado_en')->first();

        if ($fila === null) {
            throw (new ModelNotFoundException)->setModel('paciente', [$id]);
        }

        return $fila;
    }

    /** Claves del contacto principal: columna => [claves aceptadas, longitud]. */
    private const CONTACTO = [
        'nombre' => [['acompanante'], 180],
        'informante' => [['informante'], 180],
        'parentesco' => [['tutorParentesco'], 80],
        'telefono' => [['tutorCelular', 'tutorTelefono', 'telefonoTutor'], 30],
        'numero_documento' => [['acompananteDni', 'tutorDocumento'], 20],
        'ocupacion' => [['tutorOcupacion'], 120],
        'direccion' => [['informanteDireccion', 'tutorDireccion'], 250],
        'confiabilidad' => [['confiabilidad'], 40],
    ];

    /** Filiación parental: sufijo de clave del frontend => [columna, longitud]. */
    private const FAMILIAR = [
        '' => ['nombre', 180],
        'Dni' => ['numero_documento', 20],
        'Celular' => ['telefono', 30],
        'Ocupacion' => ['ocupacion', 120],
    ];

    /**
     * Sincroniza la ficha de filiación de la historia clínica con las claves del frontend.
     */
    public function sincronizarFicha(int $id, array $datos, Cuenta $actor): void
    {
        $ficha = $datos;
        if (array_key_exists('nombres', $datos) || array_key_exists('apellidos', $datos)) {
            $actual = $this->fila($id);
            $ficha['nombres'] = Valores::texto($datos['nombres'] ?? null) ?? $actual->nombres;
            $ficha['apellidoPaterno'] = Valores::texto($datos['apellidos'] ?? null) ?? $actual->apellidos;
            $ficha['apellidoMaterno'] = '';
        }
        if (isset($ficha['fechaNacimiento']) && ! preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $ficha['fechaNacimiento'])) {
            unset($ficha['fechaNacimiento']);
        }
        unset($ficha['estado']);

        $this->actualizar($id, $ficha);
        $this->sincronizarContacto($id, $datos);
        $this->sincronizarFamiliares($id, $datos);
    }

    /**
     * Ficha completa con las claves que usa la sección "datos-paciente" del frontend.
     *
     * @return array<string, mixed>
     */
    public function ficha(int $id): array
    {
        $fila = $this->fila($id);
        $datos = [
            'dni' => $fila->numero_documento,
            'nombres' => $fila->nombres,
            'apellidos' => $fila->apellidos,
            'sexo' => $fila->sexo ?? '',
            'fechaNacimiento' => $fila->fecha_nacimiento,
            'edad' => Valores::edad($fila->fecha_nacimiento),
            'modalidadAsistencia' => $fila->modalidad_asistencia ?: 'acompanado',
        ];
        foreach (self::COLUMNAS as $columna => [$claves]) {
            if (in_array($columna, ['tipo_documento', 'fecha_nacimiento', 'observaciones', 'estado_atencion', 'modalidad_asistencia'], true)) {
                continue;
            }
            $datos[$claves[0]] = $fila->{$columna} ?? '';
        }

        $contacto = DB::table('paciente_contacto')->where('id_paciente', $id)->where('es_principal', 1)->first();
        foreach (self::CONTACTO as $columna => [$claves]) {
            $datos[$claves[0]] = $contacto->{$columna} ?? '';
        }

        foreach (DB::table('paciente_familiar')->where('id_paciente', $id)->get() as $familiar) {
            $prefijo = $familiar->parentesco === 'PADRE' ? 'padre' : 'madre';
            foreach (self::FAMILIAR as $sufijo => [$columna]) {
                $datos[$prefijo.$sufijo] = $familiar->{$columna} ?? '';
            }
        }

        return array_filter($datos, fn ($valor) => $valor !== null && $valor !== '');
    }

    private function sincronizarContacto(int $id, array $datos): void
    {
        $contacto = [];
        foreach (self::CONTACTO as $columna => [$claves, $longitud]) {
            $clave = $this->primeraClave($datos, $claves);
            if ($clave !== null) {
                $valor = Valores::texto($datos[$clave]);
                $contacto[$columna] = $valor === null ? null : mb_substr($valor, 0, $longitud);
            }
        }
        if ($contacto === []) {
            return;
        }
        if (array_key_exists('nombre', $contacto)) {
            $contacto['nombre'] ??= '';
        }

        $existente = DB::table('paciente_contacto')->where('id_paciente', $id)->where('es_principal', 1)->value('id_paciente_contacto');
        if ($existente) {
            DB::table('paciente_contacto')->where('id_paciente_contacto', $existente)->update($contacto);

            return;
        }

        $tieneDatos = array_filter($contacto, fn ($valor) => $valor !== null && $valor !== '') !== [];
        if ($tieneDatos) {
            DB::table('paciente_contacto')->insert($contacto + [
                'nombre' => '',
                'id_paciente' => $id,
                'tipo_contacto' => 'ACOMPANANTE',
                'es_principal' => 1,
                'estado' => 1,
                'creado_en' => now(),
            ]);
        }
    }

    private function sincronizarFamiliares(int $id, array $datos): void
    {
        foreach (['PADRE' => 'padre', 'MADRE' => 'madre'] as $parentesco => $prefijo) {
            $fila = [];
            foreach (self::FAMILIAR as $sufijo => [$columna, $longitud]) {
                if (array_key_exists($prefijo.$sufijo, $datos)) {
                    $valor = Valores::texto($datos[$prefijo.$sufijo]);
                    $fila[$columna] = $valor === null ? null : mb_substr($valor, 0, $longitud);
                }
            }
            if ($fila === []) {
                continue;
            }
            $existente = DB::table('paciente_familiar')->where('id_paciente', $id)->where('parentesco', $parentesco)->value('id_paciente_familiar');
            if ($existente) {
                DB::table('paciente_familiar')->where('id_paciente_familiar', $existente)->update($fila);
            } elseif (array_filter($fila, fn ($valor) => $valor !== null) !== []) {
                DB::table('paciente_familiar')->insert($fila + ['id_paciente' => $id, 'parentesco' => $parentesco, 'creado_en' => now()]);
            }
        }
    }

    private function sexo(mixed $valor): ?string
    {
        $sexo = strtoupper(substr(trim((string) ($valor ?? '')), 0, 1));

        return in_array($sexo, ['M', 'F', 'O'], true) ? $sexo : null;
    }
}
