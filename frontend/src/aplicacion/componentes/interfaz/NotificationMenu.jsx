import React, { useCallback, useEffect, useState } from 'react';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
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
                <Bell size={18} aria-hidden="true" />
                {noLeidas > 0 ? <span className="contador">{noLeidas > 99 ? '99+' : noLeidas}</span> : null}
            </button>
            {abierto && (
                <div className="notification-list" role="region" aria-label="Lista de notificaciones">
                    <header className="notification-list__head">
                        <div className="notification-list__title">
                            <span className="notification-list__badge" aria-hidden="true"><Bell size={16} /></span>
                            <div>
                                <h4>Notificaciones</h4>
                                <p>{noLeidas ? `${noLeidas} sin leer` : 'Todo al día'}</p>
                            </div>
                        </div>
                        {noLeidas ? (
                            <button type="button" className="notification-list__mark" onClick={leerTodas}>
                                <CheckCheck size={15} aria-hidden="true" />
                                Marcar todas
                            </button>
                        ) : null}
                    </header>
                    {cargando && !items.length ? (
                        <div className="notification-list__empty" role="status">
                            <span className="notification-list__empty-icon" aria-hidden="true"><Bell size={22} /></span>
                            <strong>Cargando…</strong>
                            <p>Consultando avisos recientes.</p>
                        </div>
                    ) : null}
                    {items.length ? (
                        <ul>
                            {items.map((n) => (
                                <li key={n.id} className={n.leida || n.leido ? 'leido' : 'no-leido'}>
                                    <button type="button" className="notification-list__item" onClick={() => abrirItem(n)}>
                                        <span className="notification-list__dot" aria-hidden="true" />
                                        <strong>{n.titulo || 'Aviso'}</strong>
                                        <p>{n.texto || n.mensaje}</p>
                                        <small>{n.tiempo ? new Date(n.tiempo).toLocaleString('es-PE') : ''}</small>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : !cargando ? (
                        <div className="notification-list__empty">
                            <span className="notification-list__empty-icon" aria-hidden="true"><BellOff size={22} /></span>
                            <strong>Sin notificaciones</strong>
                            <p>No hay notificaciones pendientes.</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
