<?php

namespace App\Console\Commands;

use App\Clinica\Expediente\ServicioExpediente;
use App\Clinica\Historias\ServicioHistorias;
use App\Clinica\Soporte\AplicadorParches;
use App\Clinica\Soporte\EsquemaPruebas;
use App\Identidad\Dominio\Contratos\RepositorioUsuarios;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PDO;
use RuntimeException;

class PrepararPruebas extends Command
{
    protected $signature = 'pruebas:preparar {--usuarios=5} {--historias=0}';

    protected $description = 'Prepara datos sintéticos de navegador o rendimiento sin borrar bases existentes';

    public function handle(RepositorioUsuarios $usuarios, ServicioHistorias $historias, ServicioExpediente $expedientes): int
    {
        $entorno = app()->environment();
        $destino = config('database.connections.mysql.database');
        $permitidos = ['pruebas_navegador' => 'bd_clinica_undac_navegador', 'pruebas_rendimiento' => 'bd_clinica_undac_rendimiento'];
        if (($permitidos[$entorno] ?? null) !== $destino || config('database.default') !== 'mysql' || config('database.connections.mysql.url')) {
            $this->error("Preparación rechazada: entorno {$entorno} o base {$destino} fuera de la lista permitida.");

            return self::FAILURE;
        }
        $cantidad = (int) $this->option('usuarios');
        $cantidadHistorias = (int) $this->option('historias');
        if ($cantidad < 5 || $cantidad > 200 || $cantidadHistorias < 0 || $cantidadHistorias > 1000) {
            $this->error('Use entre 5 y 200 usuarios y entre 0 y 1000 historias.');

            return self::FAILURE;
        }
        $this->prepararEsquema($destino);
        (new AplicadorParches(database_path('parches')))->aplicar('mysql');
        if ($this->call('clinica:verificar') !== self::SUCCESS) {
            throw new RuntimeException('El esquema exclusivo está incompleto. Corríjalo antes de generar datos sintéticos.');
        }
        $clave = bin2hex(random_bytes(12)).'Aa9*';
        $actores = [];
        $roles = ['alumnoA' => 'ALUMNO', 'alumnoB' => 'ALUMNO', 'docente' => 'DOCENTE', 'administrador' => 'ADMINISTRADOR', 'administradorB' => 'ADMINISTRADOR'];
        for ($indice = 5; $indice < $cantidad; $indice++) {
            $roles['carga'.$indice] = 'ALUMNO';
        }
        foreach ($roles as $alias => $rol) {
            $nombre = 'prueba.'.$alias;
            $cuenta = $usuarios->buscarPorNombre($nombre);
            if (! $cuenta) {
                $filaRol = DB::table('rol')->where('codigo_rol', $rol)->first();
                $tipo = $filaRol->tipo_usuario;
                $tabla = $tipo === 'ALUMNO' ? 'alumno' : 'docente';
                $columna = $tipo === 'ALUMNO' ? 'id_alumno' : 'id_docente';
                $codigo = $tipo === 'ALUMNO' ? 'codigo_alumno' : 'codigo_docente';
                $documento = substr((string) (90000000 + count($actores)), -8);
                $idActor = DB::table($tabla)->insertGetId([
                    $codigo => 'PRUEBA-'.$alias, 'tipo_documento' => 'DNI', 'numero_documento' => $documento,
                    'nombres' => 'Persona Sintética', 'apellidos' => $alias, 'estado' => 1, 'creado_en' => now(),
                ]);
                DB::table('usuario_'.$tabla)->insert([
                    $columna => $idActor, 'id_rol' => $filaRol->id_rol, 'nombre_usuario' => $nombre,
                    'contrasena_hash' => Hash::make($clave), 'estado' => 1, 'intentos_fallidos' => 0, 'creado_en' => now(),
                ]);
                $cuenta = $usuarios->buscarPorNombre($nombre);
            } else {
                $usuarios->cambiarContrasena($cuenta, $clave);
            }
            if ($cuenta->tipoCuenta() === 'DOCENTE') {
                DB::table('docente')->where('id_docente', $cuenta->idActor())->whereNull('numero_colegiatura')->update(['numero_colegiatura' => (string) (90000000 + count($actores))]);
            }
            $actores[$alias] = ['usuario' => $nombre, 'clave' => $clave, 'tipo' => $cuenta->tipoCuenta(), 'actor' => $cuenta->idActor(), 'historias' => []];
        }
        $alumnos = array_keys(array_filter($actores, fn (array $actor) => $actor['tipo'] === 'ALUMNO'));
        $docente = $usuarios->buscarPorNombre($actores['docente']['usuario']);
        for ($indice = 0; $indice < $cantidadHistorias; $indice++) {
            $alias = $alumnos[$indice % count($alumnos)];
            $cuenta = $usuarios->buscarPorNombre($actores[$alias]['usuario']);
            $documento = (string) (80000000 + $indice);
            $existente = DB::table('historia_clinica as h')
                ->join('paciente as p', 'p.id_paciente', '=', 'h.id_paciente')
                ->join('historia_alumno as a', 'a.id_historia_clinica', '=', 'h.id_historia_clinica')
                ->where('p.numero_documento', $documento)->where('a.id_alumno', $cuenta->idActor())
                ->whereNull('h.anulado_en')->value('h.id_historia_clinica');
            $historia = $existente ? $historias->mostrar((int) $existente) : $historias->abrir([
                'dni' => $documento, 'nombres' => 'Paciente Sintético '.$indice,
                'apellidoPaterno' => 'Laboratorio', 'apellidoMaterno' => 'Pruebas', 'sexo' => $indice % 2 ? 'M' : 'F',
            ], $cuenta);
            $actores[$alias]['historias'][] = $historia['id'];
            $asignado = DB::table('historia_docente')->where('id_historia_clinica', $historia['id'])->where('id_docente', $docente->idActor())->where('estado', 1)->exists();
            if (! $asignado) {
                DB::table('historia_docente')->updateOrInsert([
                    'id_historia_clinica' => $historia['id'], 'id_docente' => $docente->idActor(),
                    'fecha_asignacion' => now()->toDateString(),
                ], ['tipo_participacion' => 'ENCARGADO', 'estado' => 1, 'creado_en' => now()]);
            }
            $expedientes->guardar($historia['id'], ['anamnesis' => [
                'motivoConsulta' => "inicial|{$actores[$alias]['usuario']}|{$historia['id']}|0",
                'historiaEnfermedad' => str_repeat('Descripción sintética para medición. ', $indice % 10 === 0 ? 30 : 3),
            ]], ['anamnesis' => 'in-progress'], $cuenta);
            // La primera historia de cada operador permanece editable para la
            // carga; el resto aporta estados clínicos distintos al listado.
            if ($entorno === 'pruebas_rendimiento' && $indice >= $cantidad) {
                $estado = ['EN_PROCESO', 'PENDIENTE_REVISION', 'OBSERVADA', 'VALIDADA'][$indice % 4];
                $actual = $historias->mostrar($historia['id'])['codigoEstado'];
                if ($estado !== 'EN_PROCESO' && $actual !== $estado) {
                    if ($actual !== 'PENDIENTE_REVISION') {
                        $historias->cambiarEstado($historia['id'], 'PENDIENTE_REVISION', $docente);
                    }
                    if ($estado !== 'PENDIENTE_REVISION') {
                        $historias->cambiarEstado($historia['id'], $estado, $docente, $estado === 'OBSERVADA' ? 'Observación sintética de laboratorio.' : null);
                    }
                }
            }
        }
        $ruta = storage_path('app/manifiesto-pruebas.json');
        if (! is_dir(dirname($ruta))) {
            mkdir(dirname($ruta), 0700, true);
        }
        file_put_contents($ruta, json_encode(['base' => $destino, 'entorno' => $entorno, 'actores' => $actores], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->limitarConexion($destino, $entorno);
        $this->info('Datos sintéticos preparados. Manifiesto privado: '.$ruta);

        return self::SUCCESS;
    }

    private function limitarConexion(string $destino, string $entorno): void
    {
        if (config('database.connections.mysql.username') !== 'root') {
            return;
        }
        $archivo = base_path('.env.'.$entorno);
        if (! is_file($archivo) || ! in_array(config('database.connections.mysql.host'), ['127.0.0.1', 'localhost'], true)) {
            throw new RuntimeException('Configure un usuario MySQL limitado a la base exclusiva antes de continuar.');
        }
        $usuario = 'undac_'.substr($entorno, 8).'_'.bin2hex(random_bytes(3));
        $clave = bin2hex(random_bytes(24));
        $conexion = DB::connection()->getPdo();
        // En contenedores la conexión local llega desde la pasarela de red,
        // no desde 127.0.0.1 vista por el servidor MySQL.
        $identidad = (string) $conexion->query('SELECT USER()')->fetchColumn();
        $origen = substr($identidad, strrpos($identidad, '@') + 1);
        if (! preg_match('/^[A-Za-z0-9.:-]+$/', $origen)) {
            throw new RuntimeException('No se pudo determinar el origen para limitar la cuenta MySQL.');
        }
        $origenSql = $conexion->quote($origen);
        $conexion->exec("CREATE USER '{$usuario}'@{$origenSql} IDENTIFIED BY '{$clave}'");
        $conexion->exec("GRANT ALL PRIVILEGES ON `{$destino}`.* TO '{$usuario}'@{$origenSql}");
        $texto = file_get_contents($archivo);
        foreach (['DB_USERNAME' => $usuario, 'DB_PASSWORD' => $clave] as $nombre => $valor) {
            $texto = preg_replace('/^'.$nombre.'=.*$/m', $nombre.'="'.$valor.'"', $texto);
        }
        file_put_contents($archivo, $texto);
        $this->info('Conexión de pruebas limitada a su base.');
    }

    private function prepararEsquema(string $destino): void
    {
        $configuracion = config('database.connections.mysql');
        $conexion = new PDO("mysql:host={$configuracion['host']};port={$configuracion['port']};charset=utf8mb4", $configuracion['username'], $configuracion['password']);
        $conexion->exec("CREATE DATABASE IF NOT EXISTS `{$destino}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $conexion->exec("USE `{$destino}`");
        if ($conexion->query("SHOW TABLES LIKE 'historia_clinica'")->fetch()) {
            if (! $conexion->query("SHOW TABLES LIKE 'pruebas_esquema'")->fetch()
                || (int) $conexion->query('SELECT version FROM pruebas_esquema')->fetchColumn() !== 1) {
                throw new RuntimeException('Esquema de pruebas sin certificación de saneamiento. Recréelo con pruebas:esquema; no se importarán datos operativos.');
            }

            return;
        }
        if ($conexion->query('SHOW TABLES')->fetch()) {
            throw new RuntimeException('La base contiene un esquema parcial. Revíselo antes de importar; no se eliminarán sus tablas.');
        }
        try {
            $conexion->exec('SET SESSION sql_log_bin = 0');
        } catch (\PDOException) {
        }
        foreach ((new EsquemaPruebas)->sentencias(file_get_contents(base_path('../bd_clinica_undac.sql'))) as $sentencia) {
            $conexion->exec($sentencia);
        }
    }
}
