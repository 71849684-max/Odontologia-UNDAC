import React from 'react';

export default function Breadcrumbs({ items = [] }) {
    return (
        <nav aria-label="Breadcrumb">
            <ol className="breadcrumbs">
                {items.map((it, idx) => (
                    <li key={it} aria-current={idx === items.length - 1 ? 'page' : undefined}>{it}</li>
                ))}
            </ol>
        </nav>
    );
}
