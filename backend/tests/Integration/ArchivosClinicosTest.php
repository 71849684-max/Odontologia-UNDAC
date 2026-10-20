<?php

namespace Tests\Integration;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\CreaUsuarios;
use Tests\TestCase;

class ArchivosClinicosTest extends TestCase
{
    use CreaUsuarios, DatabaseTransactions;

    private const CLAVE = 'ClaveDePrueba123*';

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    private function historia(object $usuario, string $dni = '70000101'): int
    {
        return (int) $this->actingAs($usuario, 'web')->postJson('/api/historias', [
            'dni' => $dni,
            'nombres' => 'Paciente Archivos Prueba',
            'sexo' => 'F',
        ])->assertCreated()->json('id');
    }

    public function test_sube_lista_descarga_y_elimina_una_fotografia(): void
    {
        $alumno = $this->crearUsuario('alumno.archivos', self::CLAVE, 'ALUMNO');
        $id = $this->historia($alumno);

        $subida = $this->actingAs($alumno, 'web')->post("/api/historias/{$id}/archivos", [
            'campo' => 'fotosModelos',
            'archivo' => UploadedFile::fake()->image('modelo superior.jpg', 120, 80),
        ], ['Accept' => 'application/json'])->assertCreated();

        $archivoId = $subida->json('archivoId');
        $subida->assertJsonPath('nombre', 'modelo superior.jpg')
            ->assertJsonPath('url', "/api/historias/{$id}/archivos/{$archivoId}");

        $fila = DB::table('archivo_clinico')->where('id_archivo', $archivoId)->first();
        $this->assertSame('modelos', $fila->seccion);
        $this->assertSame(64, strlen($fila->hash_sha256));
        $this->assertStringNotContainsString('modelo', $fila->nombre_guardado);
        Storage::disk('local')->assertExists($fila->ruta);

        $this->actingAs($alumno, 'web')->getJson("/api/historias/{$id}/expediente")
            ->assertOk()
            ->assertJsonPath('formData.modelos.fotosModelos.0.archivoId', $archivoId);

        $descarga = $this->actingAs($alumno, 'web')->get("/api/historias/{$id}/archivos/{$archivoId}")->assertOk();
        $this->assertSame('image/jpeg', $descarga->headers->get('Content-Type'));
        $this->assertSame('nosniff', $descarga->headers->get('X-Content-Type-Options'));

        $this->actingAs($alumno, 'web')->deleteJson("/api/historias/{$id}/archivos/{$archivoId}")->assertNoContent();
        $this->actingAs($alumno, 'web')->get("/api/historias/{$id}/archivos/{$archivoId}")->assertNotFound();
        $this->assertNull($this->actingAs($alumno, 'web')->getJson("/api/historias/{$id}/expediente")->json('formData.modelos.fotosModelos'));
    }

    public function test_la_firma_reemplaza_la_anterior_y_se_vincula_al_consentimiento(): void
    {
        $alumno = $this->crearUsuario('alumno.firmas', self::CLAVE, 'ALUMNO');
        $id = $this->historia($alumno);

        foreach (['firma1.png', 'firma2.png'] as $nombre) {
            $this->actingAs($alumno, 'web')->post("/api/historias/{$id}/archivos", [
                'campo' => 'firmaPaciente',
                'archivo' => UploadedFile::fake()->image($nombre, 300, 100),
            ], ['Accept' => 'application/json'])->assertCreated();
        }

        $this->assertSame(1, DB::table('archivo_clinico')->where('id_historia_clinica', $id)->where('clave_campo', 'firmaPaciente')->where('estado', 1)->count());

        $this->actingAs($alumno, 'web')->putJson("/api/historias/{$id}/expediente", [
            'formData' => ['consentimiento' => ['consent1' => true, 'doctor' => 'Dra. Ríos']],
        ])->assertOk()->assertJsonPath('formData.consentimiento.firmaPaciente.nombre', 'firma2.png');

        $vigente = DB::table('archivo_clinico')->where('id_historia_clinica', $id)->where('clave_campo', 'firmaPaciente')->where('estado', 1)->value('id_archivo');
        $firma = DB::table('firma_consentimiento as f')
            ->join('consentimiento_informado as c', 'c.id_consentimiento', '=', 'f.id_consentimiento')
            ->where('c.id_historia_clinica', $id)
            ->where('f.tipo_firmante', 'PACIENTE')
            ->first(['f.id_archivo', 'f.nombre_firmante']);
        $this->assertSame((int) $vigente, (int) $firma->id_archivo);
        $this->assertStringContainsString('Paciente', $firma->nombre_firmante);
    }

    public function test_rechaza_formatos_no_permitidos_y_campos_desconocidos(): void
    {
        $alumno = $this->crearUsuario('alumno.formatos', self::CLAVE, 'ALUMNO');
        $id = $this->historia($alumno);

        $this->actingAs($alumno, 'web')->post("/api/historias/{$id}/archivos", [
            'campo' => 'firmaPaciente',
            'archivo' => UploadedFile::fake()->createWithContent('firma.png', '<?php echo "no";'),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('archivo');

        $this->actingAs($alumno, 'web')->post("/api/historias/{$id}/archivos", [
            'campo' => 'resultadosLaboratorio',
            'archivo' => UploadedFile::fake()->createWithContent('script.html', '<html><script>alert(1)</script></html>'),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('archivo');

        $this->actingAs($alumno, 'web')->post("/api/historias/{$id}/archivos", [
            'campo' => 'ruta/../../otro',
            'archivo' => UploadedFile::fake()->image('a.png'),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('campo');

        $this->assertSame(0, DB::table('archivo_clinico')->where('id_historia_clinica', $id)->count());
    }

    public function test_un_archivo_no_se_obtiene_desde_otra_historia_ni_sin_sesion(): void
    {
        $alumno = $this->crearUsuario('alumno.aislado', self::CLAVE, 'ALUMNO');
        $primera = $this->historia($alumno, '70000102');
        $segunda = $this->historia($alumno, '70000103');

        $archivoId = $this->actingAs($alumno, 'web')->post("/api/historias/{$primera}/archivos", [
            'campo' => 'radiografias',
            'archivo' => UploadedFile::fake()->image('rx.png'),
        ], ['Accept' => 'application/json'])->assertCreated()->json('archivoId');

        $this->actingAs($alumno, 'web')->get("/api/historias/{$segunda}/archivos/{$archivoId}")->assertNotFound();
        $this->actingAs($alumno, 'web')->deleteJson("/api/historias/{$segunda}/archivos/{$archivoId}")->assertNotFound();

        auth('web')->logout();
        $this->getJson("/api/historias/{$primera}/archivos/{$archivoId}")->assertUnauthorized();
    }

    public function test_respeta_el_maximo_de_vistas_del_bloque(): void
    {
        $alumno = $this->crearUsuario('alumno.maximo', self::CLAVE, 'ALUMNO');
        $id = $this->historia($alumno);

        foreach (range(1, 4) as $indice) {
            $this->actingAs($alumno, 'web')->post("/api/historias/{$id}/archivos", [
                'campo' => 'fotosModelos',
                'archivo' => UploadedFile::fake()->image("vista{$indice}.png"),
            ], ['Accept' => 'application/json'])->assertCreated();
        }

        $this->actingAs($alumno, 'web')->post("/api/historias/{$id}/archivos", [
            'campo' => 'fotosModelos',
            'archivo' => UploadedFile::fake()->image('vista5.png'),
        ], ['Accept' => 'application/json'])->assertUnprocessable();
    }
}
