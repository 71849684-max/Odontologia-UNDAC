<?php

namespace App\Clinica\Http\Middleware;

use App\Clinica\Historias\AccesoHistorias;
use App\Identidad\Dominio\Cuenta;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AsegurarAccesoHistoria
{
    public function __construct(private readonly AccesoHistorias $acceso) {}

    public function handle(Request $solicitud, Closure $siguiente): Response
    {
        $usuario = $solicitud->user();

        if (! $usuario instanceof Cuenta) {
            abort(401, 'Sesion no iniciada.');
        }

        $id = $solicitud->route('idHistoria');

        // 404 y no 403: no se revela si la historia existe.
        if (! is_numeric($id) || ! $this->acceso->puedeVer($usuario, (int) $id)) {
            abort(404, 'Historia clínica no encontrada.');
        }

        if (! $solicitud->isMethodSafe() && ! $this->acceso->puedeModificar($usuario, (int) $id)) {
            abort(409, 'La historia clínica ya fue validada y no admite cambios.');
        }

        return $siguiente($solicitud);
    }
}
