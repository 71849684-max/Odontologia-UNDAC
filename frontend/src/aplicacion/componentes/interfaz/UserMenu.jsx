import React from 'react';

export default function UserMenu({ usuario = { nombre: 'Usuario Demo' }, rol = 'Alumno operador', onLogout }) {
    const etiquetaRol = rol === 'alumno' ? 'Alumno operador' : rol === 'docente' ? 'Docente' : rol === 'administrador' ? 'Administrador' : rol;
    return (
        <div className="user-menu" aria-label="Usuario">
            <div className="user-menu__texto">
                <strong>{usuario.nombre}</strong>
                <small>{etiquetaRol}</small>
            </div>
            <button type="button" className="user-menu__accion" onClick={onLogout}>Cerrar sesión</button>
        </div>
    );
}
