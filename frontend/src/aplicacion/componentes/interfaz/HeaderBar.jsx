import React, { useId, useState } from 'react';
import { Search, X } from 'lucide-react';
import UserMenu from './UserMenu';
import NotificationMenu from './NotificationMenu';
import Breadcrumbs from './Breadcrumbs';
import { mockHistorias } from '../../configuracion/datosMock.mjs';

const normalize = (text) => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function HeaderBar({ breadcrumb = [], usuario, rol, onNavigate, onLogout }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const resultsId = useId();
    const term = normalize(query.trim());
    const results = term ? mockHistorias.filter((item) => normalize(`${item.paciente} ${item.dni} ${item.codigo}`).includes(term)) : [];
    return (
        <header className="hc-header" aria-label="Cabecera de la aplicación">
            <div className="hc-header__izquierda hc-header__breadcrumbs"><Breadcrumbs items={breadcrumb} onNavigate={onNavigate} /></div>
            <div className="hc-global-search hc-header__search" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}>
                <label className="hc-global-search__field">
                    <Search size={17} aria-hidden="true" />
                    <input type="search" aria-label="Buscar paciente o historia" placeholder="Buscar paciente o historia…" value={query}
                        aria-controls={open && term ? resultsId : undefined}
                        onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} />
                </label>
                {open && term ? <section id={resultsId} className="hc-global-search__results" aria-label="Resultados de búsqueda">
                    <div className="hc-global-search__heading"><strong>Historias clínicas</strong><button type="button" aria-label="Cerrar resultados" onClick={() => setOpen(false)}><X size={16} /></button></div>
                    {results.length ? results.map((item) => <button className="hc-global-search__result" key={item.id} type="button" onClick={() => { setOpen(false); setQuery(''); onNavigate?.({ view: 'historia', historiaId: item.id }); }}><strong>{item.paciente}</strong><small>{item.codigo} · DNI {item.dni}</small></button>) : <p>Sin resultados. Pruebe con nombre, DNI o código.</p>}
                </section> : null}
            </div>
            <div className="hc-header__derecha hc-header__actions"><NotificationMenu /><UserMenu usuario={usuario} rol={rol} onLogout={onLogout} /></div>
        </header>
    );
}
