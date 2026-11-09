<?php

namespace Tests\Unit;

use App\Academico\Http\ControladorAcademico;
use App\Clinica\Expediente\ServicioExpediente;
use App\Clinica\Http\Controladores\ControladorHistorias;
use App\Clinica\Http\Controladores\ControladorPacientes;
use App\Http\Validacion\ReglasBasicas;
use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Mockery;
use Tests\Soporte\CuentaFalsa;
use Tests\TestCase;

class ValidacionesRegistroTest extends TestCase
{
    public function test_documentos_y_telefonos_con_formatos_minimos(): void
    {
        foreach ([['DNI', '12345678', true], ['DNI', '123', false], ['DNI', 'abcdefgh', false], ['CE', 'CE12345', true], ['PAS', 'AB-12345', true], ['PAS', 'a', false]] as [$tipo, $numero, $valido]) {
            $this->assertSame($valido, Validator::make(['documento' => $numero], ['documento' => ['string', ReglasBasicas::documento($tipo)]])->passes());
        }
        foreach ([['+51 987-654-321', true], ['(01) 4567890', true], ['', true], ['12', false], ['987abc123', false], ['1234567890123456', false]] as [$telefono, $valido]) {
            $this->assertSame($valido, Validator::make(['telefono' => $telefono], ['telefono' => ReglasBasicas::telefono()])->passes());
        }
    }

    public function test_horas_validas_y_limites(): void
    {
        foreach (['00:00', '23:59', '09:30:20'] as $hora) {
            $this->assertTrue(Validator::make(['hora' => $hora], ['hora' => ReglasBasicas::hora()])->passes());
        }
        foreach (['24:00', '10:70', 'hola'] as $hora) {
            $this->assertTrue(Validator::make(['hora' => $hora], ['hora' => ReglasBasicas::hora()])->fails());
        }
    }

    public function test_los_endpoints_rechazan_datos_invalidos_antes_de_intentar_insertar(): void
    {
        Route::post('/prueba-validaciones/pacientes', [ControladorPacientes::class, 'crear']);
        Route::post('/prueba-validaciones/historias', function (Request $peticion) {
            $peticion->setUserResolver(fn () => new CuentaFalsa('ALUMNO'));

            return app(ControladorHistorias::class)->crear($peticion);
        });
        Route::post('/prueba-validaciones/miembros/{idGrupo}', [ControladorAcademico::class, 'membresias']);
        Route::post('/prueba-validaciones/periodos', [ControladorAcademico::class, 'crearPeriodo']);
        $this->postJson('/prueba-validaciones/pacientes', [
            'nombres' => 'Ana', 'apellidoPaterno' => 'Rojas', 'numeroDocumento' => '123',
            'correo' => 'correo inválido', 'telefono' => 'hola', 'fechaNacimiento' => '2999-01-01',
        ])->assertStatus(422)->assertJsonValidationErrors(['numeroDocumento', 'correo', 'telefono', 'fechaNacimiento']);
        $this->postJson('/prueba-validaciones/historias', [])->assertStatus(422)->assertJsonValidationErrors(['dni', 'nombres']);
        $this->postJson('/prueba-validaciones/miembros/1', ['membresias' => [
            ['personaId' => 'alumno-1'], ['personaId' => 'alumno-1'],
        ]])->assertStatus(422)->assertJsonValidationErrors('membresias.0.personaId');
        $this->postJson('/prueba-validaciones/periodos', [
            'codigo' => '2026-II', 'nombre' => 'Segundo semestre', 'fechaInicio' => ['dato inválido'], 'fechaFin' => '30/02/2026',
        ])->assertStatus(422)->assertJsonValidationErrors(['fechaInicio', 'fechaFin']);
    }

    public function test_mensajes_de_validacion_en_espanol(): void
    {
        $errores = Validator::make(['correo' => 'sin-arroba'], ['correo' => ['email']])->errors();
        $this->assertSame('Ingrese un correo electrónico válido en correo.', $errores->first('correo'));
    }

    public function test_validar_formatos_no_elimina_otros_campos_del_borrador_clinico(): void
    {
        $formulario = ['datos-paciente' => ['dni' => '12345678', 'ocupacion' => 'Docente', 'religion' => 'Sin especificar']];
        $expediente = Mockery::mock(ServicioExpediente::class);
        $expediente->shouldReceive('obtener')->once()->with(7)->andReturn(['formData' => []]);
        $expediente->shouldReceive('estadosSeccion')->twice()->with(7)->andReturn([]);
        $expediente->shouldReceive('guardar')->once()->withArgs(fn ($id, $datos) => $id === 7 && $datos === $formulario)->andReturn(['formData' => $formulario]);
        $this->app->instance(ServicioExpediente::class, $expediente);
        $auditoria = Mockery::mock(RegistradorAuditoria::class);
        $auditoria->shouldReceive('registrar')->once();
        $this->app->instance(RegistradorAuditoria::class, $auditoria);
        Route::post('/prueba-borrador', function (Request $peticion) {
            $peticion->setUserResolver(fn () => new CuentaFalsa('ALUMNO'));

            return app(ControladorHistorias::class)->guardarExpediente($peticion, 7);
        });
        $this->postJson('/prueba-borrador', ['formData' => $formulario])->assertOk()->assertJsonPath('formData.datos-paciente.ocupacion', 'Docente');
    }

    public function test_numeros_clinicos_admiten_coma_decimal_y_rechazan_negativos_y_objetos(): void
    {
        foreach ([['36,5', true], ['1.75', true], ['-1', false], ['texto', false], [['valor' => 70], false]] as [$valor, $valido]) {
            $this->assertSame($valido, Validator::make(['peso' => $valor], ['peso' => ReglasBasicas::numeroNoNegativo()])->passes());
        }
    }
}
