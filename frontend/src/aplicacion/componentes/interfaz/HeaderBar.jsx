import React from 'react';
import UserMenu from './UserMenu';
import NotificationMenu from './NotificationMenu';
import Breadcrumbs from './Breadcrumbs';

export default function HeaderBar({ breadcrumb = [], usuario, rol, onNavigate, onLogout }) {
    return (
        <header className="hc-header">
            <div className="hc-header__izquierda">
                <Breadcrumbs items={breadcrumb} onNavigate={onNavigate} />
            </div>
            <div className="hc-header__derecha">
                <NotificationMenu />
                <UserMenu usuario={usuario} rol={rol} onLogout={onLogout} />
            </div>
        </header>
    );
}
