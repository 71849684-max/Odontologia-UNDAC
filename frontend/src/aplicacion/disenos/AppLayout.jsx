import React, { useState } from 'react';
import DisenoPanel from './DisenoPanel';
import SidebarHC from '../componentes/interfaz/SidebarHC';
import HeaderBar from '../componentes/interfaz/HeaderBar';

export default function AppLayout({ menu, usuario, rol, children }) {
    const [activo, setActivo] = useState(menu?.[0]?.id ?? 'inicio');

    function handleSelect(id) {
        setActivo(id);
        if (typeof window !== 'undefined' && typeof window.onNavigate === 'function') {
            // old global hook (not recommended) - keep for backward compat
            window.onNavigate(id);
        }
        if (typeof onNavigate === 'function') {
            onNavigate(id);
            return;
        }
        // fallback to event dispatch for existing code that may rely on it
        const evt = new CustomEvent('hc:navigate', { detail: { id } });
        window.dispatchEvent(evt);
    }

    return (
        <DisenoPanel barraLateral={<SidebarHC menu={menu} activo={activo} onSelect={handleSelect} />}>
            <div className="hc-main">
                <HeaderBar breadcrumb={[activo]} usuario={usuario} rol={rol} />
                <main className="hc-contenido">
                    {children}
                </main>
            </div>
        </DisenoPanel>
    );
}
