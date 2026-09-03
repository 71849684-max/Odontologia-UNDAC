import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { MOCK_NOTIFICACIONES } from '../../configuracion/mockNotificaciones';

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
                <Bell size={18} aria-hidden="true" /> <span className="contador">{MOCK_NOTIFICACIONES.filter(n => !n.leido).length}</span>
            </button>
            {abierto && (
                <div className="notification-list">
                    <h4>Notificaciones</h4>
                    <ul>
                        {MOCK_NOTIFICACIONES.map((n) => (
                            <li key={n.id} className={n.leido ? 'leido' : 'no-leido'}>
                                <p>{n.texto}</p>
                                <small>{n.tiempo}</small>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
