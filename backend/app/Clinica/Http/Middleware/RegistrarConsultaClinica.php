<?php

namespace App\Clinica\Http\Middleware;

use App\Identidad\Dominio\Contratos\RegistradorAuditoria;
use App\Identidad\Http\ContextoDesdePeticion;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RegistrarConsultaClinica
{
    public function __construct(private readonly RegistradorAuditoria $auditoria) {}

    public function handle(Request $solicitud, Closure $siguiente): Response
    {
        $respuesta = $siguiente($solicitud);
        if ($solicitud->isMethod('GET') && $respuesta->isSuccessful()) {
            $id = (int) $solicitud->route('idHistoria');
            $archivo = $solicitud->route('idArchivo');
            if ($solicitud->routeIs('pacientes.*')) {
                $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'paciente', $solicitud->route('idPaciente') ?? 'listado', 'CONSULTAR_PACIENTES', null, ['ruta' => $solicitud->route()->getName()]);
            } else {
                $this->auditoria->registrar(ContextoDesdePeticion::de($solicitud), 'historia_clinica', $id ?: 'listado',
                    $archivo ? 'CONSULTAR_ARCHIVO' : ($id ? 'CONSULTAR_HISTORIA' : 'CONSULTAR_MODULO'), null,
                    ['historia' => $id ?: null, 'ruta' => $solicitud->route()->getName(), 'archivo' => $archivo]);
            }
            $respuesta->headers->set('Cache-Control', 'private, no-store');
        }

        return $respuesta;
    }
}
