import React from 'react';
import StatusBadge from '../interfaz/StatusBadge';

export default function ProgressCard({ historia = {} }) {
    return (
        <article className="tarjeta-progreso">
            <h3>{historia.codigo}</h3>
            <p className="paciente">{historia.paciente}</p>
            <div className="progreso-valor">{historia.progreso}%</div>
            <StatusBadge estado={historia.estado} />
            <button type="button">Continuar</button>
        </article>
    );
}
