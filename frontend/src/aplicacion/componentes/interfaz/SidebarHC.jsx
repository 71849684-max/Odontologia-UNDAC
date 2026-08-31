import React from 'react';

export default function SidebarHC({ menu = [], activo, onSelect }) {
    return (
        <aside className="barra-lateral--hc" aria-label="Navegación principal">
            <div className="marca-hc">Historia Clínica · UNDAC</div>
            <nav>
                <ul className="menu-principal">
                    {menu.map((item) => (
                        <li key={item.id} className="menu-item">
                            <button type="button" className={activo === item.id ? 'esta-activo' : ''} onClick={() => onSelect(item.id)}>
                                <span className="menu-etiqueta">{item.etiqueta}</span>
                            </button>
                            {item.children && (
                                <ul className="submenu">
                                    {item.children.map((sub) => (
                                        <li key={sub.id}>
                                            <button type="button" className={activo === sub.id ? 'esta-activo' : ''} onClick={() => onSelect(sub.id)}>
                                                {sub.etiqueta}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="barra-footer">Facultad de Ciencias de la Salud · UNDAC</div>
        </aside>
    );
}
