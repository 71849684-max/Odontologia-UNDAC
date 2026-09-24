import React from 'react';
import UserMenu from './UserMenu';
import Breadcrumbs from './Breadcrumbs';

export default function HeaderBar({ breadcrumb = [], usuario, rol, onNavigate }) {
    return (
        <header className="hc-header" aria-label="Cabecera de la aplicación">
            <div className="hc-header__izquierda hc-header__breadcrumbs"><Breadcrumbs items={breadcrumb} onNavigate={onNavigate} /></div>
            <div className="hc-header__derecha hc-header__actions"><UserMenu usuario={usuario} rol={rol} /></div>
        </header>
    );
}
