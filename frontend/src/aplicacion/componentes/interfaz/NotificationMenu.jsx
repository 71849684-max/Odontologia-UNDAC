import React, { useCallback, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { listarNotificaciones, marcarNotificacionLeida, marcarTodasNotificacionesLeidas, sinRedEnPrueba } from '../../servicios/servicioClinico.js';

export default function NotificationMenu({ onNavigate }) {
    const [abierto, setAbierto] = useState(false);
    const [items, setItems] = useState([]);
    const [cargando, setCargando] = useState(false);

    const cargar = useCallback(() => {
        try { sinRedEnPrueba(); } catch { return; }
        setCargando(true);
        listarNotificaciones(40)
            .then(setItems)
            .catch(() => setItems([]))
            .finally(() => setCargando(false));
    }, []);

    useEffect(() => {
        cargar();
        if (import.meta.env.MODE === 'test') return undefined;
        const id = window.setInterval(cargar, 60000);
        return () => window.clearInterval(id);
    }, [cargar]);

    useEffect(() => {
        const cerrar = (evento) => { if (evento.key === 'Escape') setAbierto(false); };
        window.addEventListener('keydown', cerrar);
        return () => window.removeEventListener('keydown', cerrar);
    }, []);

    const noLeidas = items.filter((n) => !n.leida && !n.leido).length;

    const abrirItem = async (n) => {
        if (!n.leida && !n.leido) {
            try {
                await marcarNotificacionLeida(n.id);
                setItems((actual) => actual.map((item) => (item.id === n.id ? { ...item, leida: true, leido: true } : item)));
            } catch { /* ignore */ }
        }
        setAbierto(false);
        if (n.historiaId) {
            onNavigate?.({ view: 'historia', historiaId: n.historiaId, section: n.seccion || 'datos-paciente' });
        }
    };

    const leerTodas = async () => {
        try {
            await marcarTodasNotificacionesLeidas();
            setItems((actual) => actual.map((item) => ({ ...item, leida: true, leido: true })));
        } catch { /* ignore */ }
    };

    return (
        <div className="notification-menu">
            <button type="button" aria-label="Notificaciones" aria-expanded={abierto} onClick={() => { setAbierto((v) => !v); if (!abierto) cargar(); }}>
                <Bell size={18} aria-hidden="true" /> <span className="contador">{noLeidas}</span>
            </button>
            {abierto && (
                <div className="notification-list" role="region" aria-label="Lista de notificaciones">
                    <header className="notification-list__head">
                        <h4>Notificaciones</h4>
                        {noLeidas ? <button type="button" className="hc-link-button" onClick={leerTodas}>Marcar todas</button> : null}
                    </header>
                    {cargando && !items.length ? <p>Cargando…</p> : null}
                    {items.length ? <ul>
                        {items.map((n) => (
                            <li key={n.id} className={n.leida || n.leido ? 'leido' : 'no-leido'}>
                                <button type="button" className="notification-list__item" onClick={() => abrirItem(n)}>
                                    <strong>{n.titulo || 'Aviso'}</strong>
                                    <p>{n.texto || n.mensaje}</p>
                                    <small>{n.tiempo ? new Date(n.tiempo).toLocaleString('es-PE') : ''}</small>
                                </button>
                            </li>
                        ))}
                    </ul> : <p>No hay notificaciones pendientes.</p>}
                </div>
            )}
        </div>
    );
}
