import React from 'react';

const ETIQUETA_POR_PERFIL = {
    alumno: 'Alumno operador',
    docente: 'Docente',
    administrador: 'Administrador',
    administrativo: 'Personal administrativo',
};

export default function UserMenu({ usuario = { nombre: 'Usuario Demo' }, rol = 'Alumno operador', onLogout }) {
    const etiquetaRol = ETIQUETA_POR_PERFIL[rol] ?? rol;
    return (
        <div className="user-menu" aria-label="Usuario">
            <span className="user-menu__avatar" aria-hidden="true">{String(usuario.nombre || "U").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("")}</span>
            <div className="user-menu__texto">
                <strong>{usuario.nombre}</strong>
                <small>{etiquetaRol}</small>
            </div>
            <button type="button" className="user-menu__accion" onClick={onLogout}>Cerrar sesión</button>
        </div>
    );
}
