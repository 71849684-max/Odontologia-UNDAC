import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function DisenoPanel({ barraLateral, children, modoClinico = false }) {
    const [menuAbierto, establecerMenuAbierto] = useState(false);
    const lateralRef = useRef(null);
    const triggerRef = useRef(null);
    const lateralId = useId();
    const tieneBarraLateral = Boolean(barraLateral);
    const barraConCierre = isValidElement(barraLateral)
        ? cloneElement(barraLateral, { onItemSelected: () => establecerMenuAbierto(false) })
        : barraLateral;

    useEffect(() => {
        function cerrarConEscape(evento) {
            if (evento.key === 'Escape') establecerMenuAbierto(false);
        }
        window.addEventListener('keydown', cerrarConEscape);
        const media = window.matchMedia?.('(min-width: 1200px)');
        const cerrarEnEscritorio = () => { if (media.matches) establecerMenuAbierto(false); };
        media?.addEventListener('change', cerrarEnEscritorio);
        return () => {
            window.removeEventListener('keydown', cerrarConEscape);
            media?.removeEventListener('change', cerrarEnEscritorio);
        };
    }, []);

    useEffect(() => {
        if (!menuAbierto) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        lateralRef.current?.querySelector('button')?.focus();
        return () => {
            document.body.style.overflow = previousOverflow;
            triggerRef.current?.focus();
        };
    }, [menuAbierto]);

    function mantenerFoco(event) {
        if (!menuAbierto || event.key !== 'Tab') return;
        const targets = [triggerRef.current, ...lateralRef.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]')].filter(Boolean);
        const current = targets.indexOf(document.activeElement);
        if (event.shiftKey && current <= 0) { event.preventDefault(); targets.at(-1)?.focus(); }
        else if (!event.shiftKey && current === targets.length - 1) { event.preventDefault(); targets[0]?.focus(); }
    }

    return (
        <div className={`diseno-panel${modoClinico ? ' diseno-panel--clinical-mode' : ''}`} onKeyDown={mantenerFoco}>
            {tieneBarraLateral ? <button ref={triggerRef} type="button" className="boton-menu-movil"
                aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuAbierto}
                aria-controls={lateralId} onClick={() => establecerMenuAbierto((estado) => !estado)}>
                {menuAbierto ? <X size={21} /> : <Menu size={21} />}
            </button> : null}
            {tieneBarraLateral && menuAbierto ? <button type="button" className="fondo-menu" tabIndex={-1} aria-label="Cerrar menú lateral" onClick={() => establecerMenuAbierto(false)} /> : null}
            {tieneBarraLateral ? <div id={lateralId} ref={lateralRef} className={`diseno-panel__lateral${menuAbierto ? ' esta-abierto' : ''}`}>{barraConCierre}</div> : null}
            <div className="diseno-panel__principal" inert={menuAbierto ? true : undefined}>{children}</div>
        </div>
    );
}
