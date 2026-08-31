import React from 'react';
import { MOCK_HISTORIAS } from '../../configuracion/mockHistorias';

export default function PacienteDetalle({ paciente, onClose }) {
    const historias = MOCK_HISTORIAS.filter(h => h.paciente === paciente.nombres || h.paciente === `${paciente.nombres} ${paciente.apellidoPaterno}`);
    return (
        <div className="paciente-detalle">
            <header>
                <h3>{paciente.nombres} {paciente.apellidoPaterno} {paciente.apellidoMaterno}</h3>
                <small>{paciente.codigo}</small>
            </header>
            <div className="datos">
                <p><strong>Documento:</strong> {paciente.numeroDocumento}</p>
                <p><strong>Edad:</strong> {paciente.edad ?? '-'}</p>
                <p><strong>Sexo:</strong> {paciente.sexo}</p>
                <p><strong>Teléfono:</strong> {paciente.telefono}</p>
                <p><strong>Correo:</strong> {paciente.correo}</p>
                <p><strong>Dirección:</strong> {paciente.direccion}</p>
            </div>
            <section className="historias-relacionadas">
                <h4>Historias clínicas</h4>
                <ul>
                    {historias.length ? historias.map(h => (
                        <li key={h.id}><strong>{h.codigo}</strong> · {h.estado} <button onClick={() => { if (window.onNavigate) window.onNavigate({ id: 'historia-clinica', params: { historiaId: h.id } }); }} aria-label={`Abrir ${h.codigo}`}>Abrir</button></li>
                    )) : <li>No hay historias registradas</li>}
                </ul>
            </section>
            <div className="acciones"><button onClick={onClose}>Cerrar</button></div>
        </div>
    );
}
