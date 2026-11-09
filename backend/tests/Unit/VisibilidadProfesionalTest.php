<?php

namespace Tests\Unit;

use App\Clinica\Historias\AccesoHistorias;
use App\Clinica\Notificaciones\ServicioNotificaciones;
use App\Identidad\Dominio\Contratos\ConsultaAccesos;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Mockery;
use Tests\Soporte\CuentaFalsa;
use Tests\TestCase;

class VisibilidadProfesionalTest extends TestCase
{
    private AccesoHistorias $acceso;

    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'visibilidad', 'database.connections.visibilidad' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '']]);
        Schema::create('historia_clinica', function (Blueprint $tabla) {
            $tabla->integer('id_historia_clinica');
            $tabla->integer('id_paciente');
            $tabla->integer('id_estado_historia');
            $tabla->timestamp('anulado_en')->nullable();
        });
        foreach (['alumno', 'docente'] as $tipo) {
            Schema::create('historia_'.$tipo, function (Blueprint $tabla) use ($tipo) {
                $tabla->integer('id_historia_clinica');
                $tabla->integer('id_'.$tipo);
                $tabla->integer('estado');
                $tabla->string('tipo_participacion');
            });
        }
        Schema::create('paciente', fn (Blueprint $tabla) => $tabla->integer('id_paciente'));
        Schema::create('estado_historia_clinica', function (Blueprint $tabla) {
            $tabla->integer('id_estado_historia');
            $tabla->string('codigo');
        });
        DB::table('estado_historia_clinica')->insert(['id_estado_historia' => 1, 'codigo' => 'VALIDADA']);
        foreach ([1, 2, 3] as $id) {
            DB::table('paciente')->insert(['id_paciente' => $id]);
            DB::table('historia_clinica')->insert(['id_historia_clinica' => $id, 'id_paciente' => $id, 'id_estado_historia' => 1, 'anulado_en' => $id === 3 ? now() : null]);
        }
        DB::table('historia_docente')->insert([
            ['id_historia_clinica' => 1, 'id_docente' => 10, 'estado' => 1, 'tipo_participacion' => 'ENCARGADO'],
            ['id_historia_clinica' => 2, 'id_docente' => 11, 'estado' => 1, 'tipo_participacion' => 'COLABORADOR'],
            ['id_historia_clinica' => 3, 'id_docente' => 10, 'estado' => 1, 'tipo_participacion' => 'ENCARGADO'],
        ]);
        DB::table('historia_alumno')->insert(['id_historia_clinica' => 1, 'id_alumno' => 1, 'estado' => 1, 'tipo_participacion' => 'OPERADOR']);
        $permisos = Mockery::mock(ConsultaAccesos::class);
        $permisos->shouldReceive('esAdministrador')->andReturnUsing(fn ($cuenta) => $cuenta->id() === 99);
        $this->acceso = new AccesoHistorias($permisos);
    }

    public function test_filtra_historias_y_pacientes_por_asignacion_vigente(): void
    {
        $profesional = new CuentaFalsa('DOCENTE', 1, 10);
        $this->assertTrue($this->acceso->puedeVer($profesional, 1));
        $this->assertFalse($this->acceso->puedeVer($profesional, 2));
        $this->assertFalse($this->acceso->puedeVer($profesional, 3));
        $this->assertTrue($this->acceso->puedeVerPaciente($profesional, 1));
        $this->assertFalse($this->acceso->puedeVerPaciente($profesional, 2));
        $this->assertSame([1], $this->acceso->filtrar(DB::table('historia_clinica as h')->whereNull('h.anulado_en'), $profesional)->pluck('id_historia_clinica')->all());
        $this->assertSame([1], $this->acceso->filtrarPacientes(DB::table('paciente as p'), $profesional)->pluck('id_paciente')->all());
        $this->assertTrue($this->acceso->puedeVer(new CuentaFalsa('DOCENTE', 2, 11), 2));
    }

    public function test_retirar_asignacion_revoca_lectura_escritura_y_paciente(): void
    {
        $profesional = new CuentaFalsa('DOCENTE', 1, 10);
        $this->assertTrue($this->acceso->puedeModificar($profesional, 1));
        DB::table('historia_docente')->where('id_docente', 10)->update(['estado' => 0]);
        $this->assertFalse($this->acceso->puedeVer($profesional, 1));
        $this->assertFalse($this->acceso->puedeModificar($profesional, 1));
        $this->assertFalse($this->acceso->puedeVerPaciente($profesional, 1));
    }

    public function test_preserva_acceso_general_del_admin_y_facultades_del_profesional_asignado(): void
    {
        $admin = new CuentaFalsa('DOCENTE', 99, 50);
        $this->assertTrue($this->acceso->puedeVer($admin, 1));
        $this->assertTrue($this->acceso->puedeVer($admin, 2));
        $this->assertFalse($this->acceso->puedeVer($admin, 3));
        $profesional = new CuentaFalsa('DOCENTE', 1, 10);
        $this->assertFalse($this->acceso->restringido($profesional));
        $this->assertTrue($this->acceso->puedeModificar($profesional, 1));
        $this->assertFalse($this->acceso->puedeModificar(new CuentaFalsa('ALUMNO'), 1));
    }

    public function test_un_aviso_antiguo_del_profesional_pierde_el_enlace_al_retirar_su_asignacion(): void
    {
        Schema::create('notificacion', function (Blueprint $tabla) {
            $tabla->increments('id_notificacion');
            $tabla->string('tipo_destinatario');
            $tabla->integer('id_destinatario');
            $tabla->integer('id_historia_clinica')->nullable();
            $tabla->string('codigo_seccion')->nullable();
            $tabla->string('tipo');
            $tabla->string('titulo');
            $tabla->string('mensaje');
            $tabla->boolean('leida');
            $tabla->timestamp('creado_en');
        });
        DB::table('notificacion')->insert([
            'tipo_destinatario' => 'DOCENTE', 'id_destinatario' => 10, 'id_historia_clinica' => 1,
            'codigo_seccion' => 'anamnesis', 'tipo' => 'SECCION_REVISION', 'titulo' => 'Revisión',
            'mensaje' => 'Historia lista para revisión', 'leida' => false, 'creado_en' => now(),
        ]);
        $servicio = new ServicioNotificaciones($this->acceso);
        $profesional = new CuentaFalsa('DOCENTE', 1, 10);
        $this->assertSame(1, $servicio->listar($profesional)[0]['historiaId']);
        DB::table('historia_docente')->where('id_docente', 10)->update(['estado' => 0]);
        $this->assertNull($servicio->listar($profesional)[0]['historiaId']);
        $this->assertSame([], $servicio->listar(new CuentaFalsa('DOCENTE', 2, 11)));
    }
}
