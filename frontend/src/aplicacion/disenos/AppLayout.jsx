import React, { useEffect, useState } from 'react';
import DisenoPanel from './DisenoPanel';
import SidebarHC from '../componentes/interfaz/SidebarHC';
import HeaderBar from '../componentes/interfaz/HeaderBar';

export default function AppLayout({ menu, usuario, rol, onNavigate, children }) {
    const [activo, setActivo] = useState(menu?.[0]?.id ?? 'inicio');

    useEffect(() => {
        if (!menu?.some((item) => item.id === activo)) {
            setActivo(menu?.[0]?.id ?? 'inicio');
        }
    }, [menu, activo]);

    function handleSelect(id) {
        setActivo(id);
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
                <HeaderBar breadcrumb={[activo]} usuario={usuario} rol={rol} />
                <main className="hc-contenido min-w-0">
                    {children}
                </main>
            </div>
        </DisenoPanel>
    );
}
