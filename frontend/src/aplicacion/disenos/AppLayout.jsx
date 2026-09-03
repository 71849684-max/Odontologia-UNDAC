import React, { useEffect, useState } from 'react';
import DisenoPanel from './DisenoPanel';
import SidebarHC from '../componentes/interfaz/SidebarHC';
import HeaderBar from '../componentes/interfaz/HeaderBar';

function buscarRuta(menu, id) {
    for (const item of menu ?? []) {
        if (item.id === id) return [item.etiqueta];
        const child = item.children?.find((sub) => sub.id === id);
        if (child) return [item.etiqueta, child.etiqueta];
    }
    if (id === 'historia-clinica') return ['Gestión clínica', 'Historia clínica'];
    return ['Vista no disponible'];
}

function menuTieneRuta(menu, id) {
    return (menu ?? []).some((item) => item.id === id || item.children?.some((child) => child.id === id));
}

export default function AppLayout({ menu, usuario, rol, activo: activoControlado, onNavigate, onLogout, children }) {
    const [activoInterno, setActivoInterno] = useState(menu?.[0]?.id ?? 'inicio');
    const activo = activoControlado ?? activoInterno;

    useEffect(() => {
        if (!menuTieneRuta(menu, activo) && activo !== 'historia-clinica') {
            setActivoInterno(menu?.[0]?.id ?? 'inicio');
        }
    }, [menu, activo]);

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
                <HeaderBar breadcrumb={buscarRuta(menu, activo)} usuario={usuario} rol={rol} onLogout={onLogout} />
                <main className="hc-contenido min-w-0">
                    {children}
                </main>
            </div>
        </DisenoPanel>
    );
}
