import React, { useEffect, useState } from 'react';
import { ChevronDown, CircleUserRound, ClipboardList, FileClock, FilePlus2, Home, Settings, Stethoscope, UsersRound } from 'lucide-react';

const ICONOS = {
    inicio: Home,
    gestion: Stethoscope,
    administracion: UsersRound,
    supervision: ClipboardList,
    seguimiento: ClipboardList,
    sistema: Settings,
    pacientes: CircleUserRound,
    'mis-pacientes': CircleUserRound,
    historias: ClipboardList,
    'mis-historias': ClipboardList,
    'nueva-historia': FilePlus2,
    usuarios: UsersRound,
    'permisos-usuarios': UsersRound,
    auditoria: FileClock,
    configuracion: Settings,
};

export default function SidebarHC({ menu = [], activo, onSelect, onItemSelected }) {
    const [gruposAbiertos, setGruposAbiertos] = useState(() => new Set(
        menu.filter((item) => item.children?.some((child) => child.id === activo)).map((item) => item.id),
    ));

    useEffect(() => {
        const padreActivo = menu.find((item) => item.children?.some((child) => child.id === activo));
        if (padreActivo) setGruposAbiertos((actuales) => new Set(actuales).add(padreActivo.id));
    }, [activo, menu]);

    function seleccionar(id) {
        onSelect(id);
        onItemSelected?.();
    }

    function alternarGrupo(id) {
        setGruposAbiertos((actuales) => {
            const siguientes = new Set(actuales);
            siguientes.has(id) ? siguientes.delete(id) : siguientes.add(id);
            return siguientes;
        });
    }

    return (
        <aside className="barra-lateral--hc" aria-label="Navegación principal">
            <div className="marca-hc">Historia Clínica · UNDAC</div>
            <nav>
                <ul className="menu-principal">
                    {menu.map((item) => {
                        const Icono = ICONOS[item.id] ?? ClipboardList;
                        const tieneHijos = Boolean(item.children?.length);
                        const abierto = gruposAbiertos.has(item.id);
                        const grupoActivo = item.children?.some((sub) => sub.id === activo);
                        return (
                        <li key={item.id} className={`menu-item${grupoActivo ? ' tiene-activo' : ''}`}>
                            <button
                                type="button"
                                className={activo === item.id ? 'esta-activo' : ''}
                                aria-expanded={tieneHijos ? abierto : undefined}
                                aria-controls={tieneHijos ? `submenu-${item.id}` : undefined}
                                onClick={() => tieneHijos ? alternarGrupo(item.id) : seleccionar(item.id)}
                            >
                                <Icono size={18} aria-hidden="true" />
                                <span className="menu-etiqueta">{item.etiqueta}</span>
                                {tieneHijos && <ChevronDown className={`menu-chevron${abierto ? ' esta-abierto' : ''}`} size={16} aria-hidden="true" />}
                            </button>
                            {tieneHijos && abierto && (
                                <ul className="submenu" id={`submenu-${item.id}`}>
                                    {item.children.map((sub) => (
                                        <li key={sub.id}>
                                            <button type="button" className={activo === sub.id ? 'esta-activo' : ''} aria-current={activo === sub.id ? 'page' : undefined} onClick={() => seleccionar(sub.id)}>
                                                {sub.etiqueta}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    );})}
                </ul>
            </nav>
            <div className="barra-footer">Facultad de Ciencias de la Salud · UNDAC</div>
        </aside>
    );
}
