import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

const notificaciones = [];

export default function NotificationMenu() {
    const [abierto, setAbierto] = useState(false);
    useEffect(() => {
        const cerrar = (evento) => { if (evento.key === 'Escape') setAbierto(false); };
        window.addEventListener('keydown', cerrar);
        return () => window.removeEventListener('keydown', cerrar);
    }, []);
    return (
        <div className="notification-menu">
            <button type="button" aria-label="Notificaciones" aria-expanded={abierto} onClick={() => setAbierto((v) => !v)}>
                <Bell size={18} aria-hidden="true" /> <span className="contador">{notificaciones.filter(n => !n.leido).length}</span>
            </button>
            {abierto && (
                <div className="notification-list">
                    <h4>Notificaciones</h4>
                    {notificaciones.length ? <ul>
                        {notificaciones.map((n) => (
                            <li key={n.id} className={n.leido ? 'leido' : 'no-leido'}>
                                <p>{n.texto}</p>
                                <small>{n.tiempo}</small>
                            </li>
                        ))}
                    </ul> : <p>No hay notificaciones pendientes.</p>}
                </div>
            )}
        </div>
    );
}
