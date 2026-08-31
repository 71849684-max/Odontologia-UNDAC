import React from 'react';

export default function UserMenu({ usuario = { nombre: 'Usuario Demo' }, rol = 'Alumno operador' }) {
    return (
        <div className="user-menu" aria-label="Usuario">
            <div className="user-menu__texto">
                <strong>{usuario.nombre}</strong>
                <small>{rol}</small>
            </div>
            <button type="button" className="user-menu__accion">Cerrar sesión</button>
        </div>
    );
}
