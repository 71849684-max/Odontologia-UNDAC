import React from 'react';

export default function Breadcrumbs({ items = [], onNavigate }) {
    return (
        <nav aria-label="Breadcrumb">
            <ol className="breadcrumbs">
                {items.map((item, indice) => {
                    const etiqueta = typeof item === 'string' ? item : item.etiqueta;
                    const destino = typeof item === 'string' ? null : item.id;
                    const esActual = indice === items.length - 1;
                    return (
                        <li key={`${etiqueta}-${indice}`} aria-current={esActual ? 'page' : undefined}>
                            {destino && !esActual
                                ? <button type="button" onClick={() => onNavigate?.(destino)}>{etiqueta}</button>
                                : etiqueta}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
