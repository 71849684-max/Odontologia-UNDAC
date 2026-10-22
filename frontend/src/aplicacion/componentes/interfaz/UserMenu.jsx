import React from 'react';

const ETIQUETA_POR_PERFIL = {
    alumno: 'Asistente odontológico',
    docente: 'Cirujano dentista',
    administrador: 'Administrador',
    administrativo: 'Personal administrativo',
};

export default function UserMenu({ usuario = { nombre: 'Usuario' }, rol = 'Asistente odontológico', onNavigate }) {
    const etiquetaRol = ETIQUETA_POR_PERFIL[rol] ?? rol;
    return (
        <button type="button" className="user-menu" aria-label="Abrir mi perfil" onClick={() => onNavigate?.('perfil')}>
            <span className="user-menu__avatar" aria-hidden="true">{String(usuario.nombre || "U").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("")}</span>
            <div className="user-menu__texto">
                <strong>{usuario.nombre}</strong>
                <small>{etiquetaRol}</small>
            </div>
        </button>
    );
}
