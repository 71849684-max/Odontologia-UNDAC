import React from 'react';
import { Menu } from 'lucide-react';
import UserMenu from './UserMenu';
import Breadcrumbs from './Breadcrumbs';
import NotificationMenu from './NotificationMenu';

export default function HeaderBar({ breadcrumb = [], usuario, rol, onNavigate, navegacionAbierta = true, onMostrarNavegacion }) {
    return (
        <header className="hc-header" aria-label="Cabecera de la aplicación">
            <div className="hc-header__izquierda hc-header__breadcrumbs">
                {!navegacionAbierta && typeof onMostrarNavegacion === 'function' ? (
                    <button
                        type="button"
                        className="hc-header__nav-toggle"
                        aria-label="Mostrar menú de navegación"
                        aria-expanded="false"
                        onClick={onMostrarNavegacion}
                    >
                        <Menu size={18} aria-hidden="true" />
                    </button>
                ) : null}
                <Breadcrumbs items={breadcrumb} onNavigate={onNavigate} />
            </div>
            <div className="hc-header__derecha hc-header__actions">
                <NotificationMenu onNavigate={onNavigate} />
                <UserMenu usuario={usuario} rol={rol} onNavigate={onNavigate} />
            </div>
        </header>
    );
}
