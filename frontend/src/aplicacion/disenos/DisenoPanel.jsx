import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

const CONSULTA_ESCRITORIO = '(min-width: 1200px)';

function esVistaEscritorio() {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia(CONSULTA_ESCRITORIO).matches;
}

export default function DisenoPanel({
    barraLateral,
    children,
    modoClinico = false,
    navegacionAbierta: navegacionControlada,
    onToggleNavegacion,
}) {
    const [menuAbiertoInterno, establecerMenuAbiertoInterno] = useState(esVistaEscritorio);
    const [esEscritorio, setEsEscritorio] = useState(esVistaEscritorio);
    const lateralRef = useRef(null);
    const triggerRef = useRef(null);
    const lateralId = useId();
    const tieneBarraLateral = Boolean(barraLateral);
    const controlado = typeof onToggleNavegacion === 'function';
    const menuAbierto = controlado ? Boolean(navegacionControlada) : menuAbiertoInterno;
    const alternarMenu = () => {
        if (controlado) onToggleNavegacion();
        else establecerMenuAbiertoInterno((estado) => !estado);
    };
    const cerrarMenu = () => {
        if (controlado) {
            if (menuAbierto) onToggleNavegacion();
            return;
        }
        establecerMenuAbiertoInterno(false);
    };
    const barraConCierre = isValidElement(barraLateral)
        ? cloneElement(barraLateral, {
            onItemSelected: () => { if (!esEscritorio) cerrarMenu(); },
            onToggle: esEscritorio ? cerrarMenu : undefined,
            mostrarToggle: esEscritorio && menuAbierto,
        })
        : barraLateral;

    useEffect(() => {
        const media = window.matchMedia?.(CONSULTA_ESCRITORIO);
        const sincronizar = () => {
            const desktop = Boolean(media?.matches);
            setEsEscritorio(desktop);
            if (!controlado) establecerMenuAbiertoInterno(desktop);
        };
        sincronizar();
        media?.addEventListener('change', sincronizar);
        return () => media?.removeEventListener('change', sincronizar);
    }, [controlado]);

    useEffect(() => {
        function cerrarConEscape(evento) {
            if (evento.key === 'Escape' && !esEscritorio && menuAbierto) cerrarMenu();
        }
        window.addEventListener('keydown', cerrarConEscape);
        return () => window.removeEventListener('keydown', cerrarConEscape);
    }, [esEscritorio, menuAbierto, controlado]);

    useEffect(() => {
        if (!menuAbierto || esEscritorio) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        lateralRef.current?.querySelector('button')?.focus();
        return () => {
            document.body.style.overflow = previousOverflow;
            triggerRef.current?.focus();
        };
    }, [menuAbierto, esEscritorio]);

    function mantenerFoco(event) {
        if (!menuAbierto || esEscritorio || event.key !== 'Tab') return;
        const targets = [triggerRef.current, ...lateralRef.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]')].filter(Boolean);
        const current = targets.indexOf(document.activeElement);
        if (event.shiftKey && current <= 0) { event.preventDefault(); targets.at(-1)?.focus(); }
        else if (!event.shiftKey && current === targets.length - 1) { event.preventDefault(); targets[0]?.focus(); }
    }

    return (
        <div
            className={`diseno-panel${modoClinico ? ' diseno-panel--clinical-mode' : ''}${tieneBarraLateral && esEscritorio && !menuAbierto ? ' diseno-panel--nav-cerrada' : ''}`}
            onKeyDown={mantenerFoco}
        >
            {tieneBarraLateral && !esEscritorio ? <button ref={triggerRef} type="button" className="boton-menu-movil"
                aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuAbierto}
                aria-controls={lateralId} onClick={alternarMenu}>
                {menuAbierto ? <X size={21} /> : <Menu size={21} />}
            </button> : null}
            {tieneBarraLateral && menuAbierto && !esEscritorio ? <button type="button" className="fondo-menu" tabIndex={-1} aria-label="Cerrar menú lateral" onClick={cerrarMenu} /> : null}
            {tieneBarraLateral && (esEscritorio ? menuAbierto : true) ? (
                <div id={lateralId} ref={lateralRef} className={`diseno-panel__lateral${menuAbierto ? ' esta-abierto' : ''}`}>
                    {barraConCierre}
                </div>
            ) : null}
            <div className="diseno-panel__principal" inert={menuAbierto && !esEscritorio ? true : undefined}>{children}</div>
        </div>
    );
}
