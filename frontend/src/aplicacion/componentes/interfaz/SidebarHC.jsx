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

function obtenerGrupoActivo(menu, activo) {
    const padre = menu.find((item) => item.children?.some((child) => child.id === activo));
    if (padre) return padre.id;
    if (activo === 'historia-clinica') return menu.find((item) => item.id === 'gestion')?.id ?? null;
    return null;
}

export default function SidebarHC({ menu = [], activo, onSelect, onItemSelected }) {
    const [grupoAbierto, setGrupoAbierto] = useState(() => obtenerGrupoActivo(menu, activo));

    useEffect(() => {
        setGrupoAbierto(obtenerGrupoActivo(menu, activo));
    }, [activo, menu]);

    function seleccionar(id) {
        onSelect(id);
        onItemSelected?.();
    }

    function alternarGrupo(id) {
        setGrupoAbierto((actual) => actual === id ? null : id);
    }

    return (
        <aside className="barra-lateral--hc" aria-label="Navegación principal">
            <div className="marca-hc"><span className="marca-hc__icon"><Stethoscope size={20} aria-hidden="true" /></span><span className="marca-hc__text">Historia Clínica<small>Odontología UNDAC</small></span></div>
            <nav>
                <ul className="menu-principal">
                    {menu.map((item) => {
                        const Icono = ICONOS[item.id] ?? ClipboardList;
                        const tieneHijos = Boolean(item.children?.length);
                        const abierto = grupoAbierto === item.id;
                        const grupoActivo = item.children?.some((sub) => sub.id === activo)
                            || (activo === 'historia-clinica' && item.id === 'gestion');
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
