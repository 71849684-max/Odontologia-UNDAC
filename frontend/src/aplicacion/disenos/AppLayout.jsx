import React, { useEffect, useRef, useState } from 'react';
import DisenoPanel from './DisenoPanel';
import SidebarHC from '../componentes/interfaz/SidebarHC';
import HeaderBar from '../componentes/interfaz/HeaderBar';

function buscarRuta(menu, id) {
    for (const item of menu ?? []) {
        if (item.id === id) return [{ etiqueta: item.etiqueta }];
        const child = item.children?.find((sub) => sub.id === id);
        if (child) return [
            { id: 'inicio', etiqueta: 'Inicio' },
            { etiqueta: item.etiqueta },
            { etiqueta: child.etiqueta },
        ];
    }
    if (id === 'historia-clinica') return [
        { id: 'inicio', etiqueta: 'Inicio' },
        { id: 'historias', etiqueta: 'Historias clínicas' },
        { etiqueta: 'Historia clínica' },
    ];
    return [{ id: 'inicio', etiqueta: 'Inicio' }, { etiqueta: 'Vista no disponible' }];
}

function menuTieneRuta(menu, id) {
    return (menu ?? []).some((item) => item.id === id || item.children?.some((child) => child.id === id));
}

export default function AppLayout({ menu, usuario, rol, activo: activoControlado, onNavigate, onLogout, children }) {
    const [activoInterno, setActivoInterno] = useState(menu?.[0]?.id ?? 'inicio');
    const contenidoRef = useRef(null);
    const activo = activoControlado ?? activoInterno;

    useEffect(() => {
        if (!menuTieneRuta(menu, activo) && activo !== 'historia-clinica') {
            setActivoInterno(menu?.[0]?.id ?? 'inicio');
        }
    }, [menu, activo]);

    useEffect(() => {
        contenidoRef.current?.focus({ preventScroll: true });
    }, [activo]);

    function handleSelect(id) {
        setActivoInterno(id);
        if (typeof onNavigate === 'function') {
            onNavigate(id);
            return;
        }
        if (typeof window !== 'undefined' && typeof window.onNavigate === 'function') {
            window.onNavigate(id);
        }
    }

    return (
        <DisenoPanel
            barraLateral={
                <SidebarHC
                    menu={menu}
                    activo={activo}
                    onSelect={handleSelect}
                />
            }
        >
            <div className="hc-main min-h-screen">
                <HeaderBar breadcrumb={buscarRuta(menu, activo)} usuario={usuario} rol={rol} onNavigate={handleSelect} onLogout={onLogout} />
                <main ref={contenidoRef} className="hc-contenido min-w-0" tabIndex={-1}>
                    {children}
                </main>
            </div>
        </DisenoPanel>
    );
}
