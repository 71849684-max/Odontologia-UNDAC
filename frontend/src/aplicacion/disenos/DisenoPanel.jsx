import { cloneElement, isValidElement, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function DisenoPanel({ barraLateral, children, modoClinico = false }) {
    const [menuAbierto, establecerMenuAbierto] = useState(false);
    const barraConCierre = isValidElement(barraLateral)
        ? cloneElement(barraLateral, { onItemSelected: () => establecerMenuAbierto(false) })
        : barraLateral;

    useEffect(() => {
        function cerrarConEscape(evento) {
            if (evento.key === 'Escape') establecerMenuAbierto(false);
        }
        window.addEventListener('keydown', cerrarConEscape);
        return () => window.removeEventListener('keydown', cerrarConEscape);
    }, []);

    return (
        <div className={`diseno-panel${modoClinico ? ' diseno-panel--clinical-mode' : ''}`}>
            {!modoClinico ? <button
                type="button"
                className="boton-menu-movil"
                aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuAbierto}
                onClick={() => establecerMenuAbierto((estadoActual) => !estadoActual)}
            >
                {menuAbierto ? <X size={21} /> : <Menu size={21} />}
            </button> : null}
            {!modoClinico && menuAbierto && <button type="button" className="fondo-menu" aria-label="Cerrar menú lateral" onClick={() => establecerMenuAbierto(false)} />}
            {!modoClinico ? <div className={`diseno-panel__lateral${menuAbierto ? ' esta-abierto' : ''}`}>{barraConCierre}</div> : null}
            <div className="diseno-panel__principal">{children}</div>
        </div>
    );
}
