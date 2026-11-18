<?php

namespace App\Clinica\Expediente;

use App\Clinica\Historias\AccesoHistorias;
use App\Identidad\Dominio\Cuenta;
use App\Identidad\Dominio\Excepciones\OperacionNoPermitida;
use Illuminate\Support\Facades\DB;

class ServicioConsentimientos
{
    public function __construct(
        private readonly ServicioExpediente $expediente,
        private readonly AccesoHistorias $acceso,
    ) {}

    public function decidir(int $historia, string $decision, string $motivo, Cuenta $actor): array
    {
        return DB::transaction(function () use ($historia, $decision, $motivo, $actor) {
            DB::table('historia_clinica')->where('id_historia_clinica', $historia)->lockForUpdate()->first();
            if (! $this->acceso->puedeModificar($actor, $historia) || ! $this->acceso->puedeAprobar($actor)) {
                throw new OperacionNoPermitida('decision', 'La decisión debe registrarla un profesional con acceso vigente.');
            }
            $expediente = $this->expediente->obtener($historia);
            $datos = $expediente['formData']['consentimiento'] ?? [];
            $fila = DB::table('consentimiento_informado')->where('id_historia_clinica', $historia)->orderByDesc('version_documento')->first();
            if (! $fila || ! trim((string) ($datos['intervencionAutorizada'] ?? ''))) {
                throw new OperacionNoPermitida('intervencionAutorizada', 'Guarde primero el procedimiento sobre el que se informa al paciente.');
            }
            if ($decision === 'REVOCADO' && $fila->estado !== 'OTORGADO') {
                throw new OperacionNoPermitida('decision', 'Solo puede revocarse un consentimiento otorgado.');
            }
            if ($decision !== 'REVOCADO' && $fila->estado !== 'BORRADOR') {
                throw new OperacionNoPermitida('decision', 'Esta versión ya tiene una decisión registrada. Prepare una nueva versión para otro procedimiento.');
            }
            if (in_array($decision, ['NEGADO', 'REVOCADO'], true) && empty($datos['constanciaDecisionConsentimiento'])) {
                throw new OperacionNoPermitida('constanciaDecisionConsentimiento', 'Adjunte la constancia de la negativa o revocación del paciente.');
            }
            if ($decision === 'OTORGADO') {
                foreach (['fecha', 'doctor', 'riesgosPersonalizados', 'alternativas'] as $campo) {
                    if (empty($datos[$campo])) {
                        throw new OperacionNoPermitida($campo, 'Complete fecha, profesional, riesgos y alternativas explicadas.');
                    }
                }
                $representado = ($datos['representanteTipo'] ?? 'paciente') === 'representante';
                if ((($expediente['paciente']['edad'] ?? 100) < 18 || $representado) && (! $representado || empty($datos['representacionSustento']) || empty($datos['firmaAcompanante']))) {
                    throw new OperacionNoPermitida('representacionSustento', 'Registre la representación, su sustento y la constancia del representante.');
                }
                if (! $representado && empty($datos['firmaPaciente']) && empty($datos['huellaDactilar'])) {
                    throw new OperacionNoPermitida('firmaPaciente', 'Adjunte la constancia de firma o huella del paciente.');
                }
                if (empty($datos['firmaDocente'])) {
                    throw new OperacionNoPermitida('firmaDocente', 'Adjunte la constancia del profesional informante.');
                }
            }
            if (trim($motivo) === '') {
                throw new OperacionNoPermitida('motivo', 'Describa la constancia de información y decisión del paciente.');
            }
            $datos['estadoConsentimiento'] = $decision;
            DB::table('consentimiento_informado')->where('id_consentimiento', $fila->id_consentimiento)->update(['estado' => $decision, ...($decision !== 'REVOCADO' ? ['id_docente_informante' => $actor->idActor()] : [])]);

            return ['version' => (int) $fila->version_documento, 'estado' => $decision, 'documento' => $datos];
        });
    }
}
