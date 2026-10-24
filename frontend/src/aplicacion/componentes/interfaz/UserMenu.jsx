import React from 'react';
import { etiquetaRol } from '../../configuracion/etiquetasRoles.js';

export default function UserMenu({ usuario = { nombre: 'Usuario' }, rol = 'Asistente', onNavigate }) {
    const etiqueta = etiquetaRol(rol, rol);
    return (
        <button type="button" className="user-menu" aria-label="Abrir mi perfil" onClick={() => onNavigate?.('perfil')}>
            <span className="user-menu__avatar" aria-hidden="true">{String(usuario.nombre || "U").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("")}</span>
            <div className="user-menu__texto">
                <strong>{usuario.nombre}</strong>
                <small>{etiqueta}</small>
            </div>
        </button>
    );
}
