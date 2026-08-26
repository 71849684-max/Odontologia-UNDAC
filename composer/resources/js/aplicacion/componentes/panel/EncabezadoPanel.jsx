import { Bell, LogOut, Plus } from 'lucide-react';

export default function EncabezadoPanel({ configuracion, alCerrarSesion }) {
    return (
        <header className="encabezado-panel">
            <div className="encabezado-panel__barra">
                <div><strong>Historia Clínica Digital</strong><small>Clínica Odontológica UNDAC</small></div>
                <div className="herramientas-usuario">
                    <button type="button" aria-label="Notificaciones"><Bell size={19} /></button>
                    <span className="avatar-usuario" aria-hidden="true">{configuracion.persona.charAt(0)}</span>
                    <span className="identidad-usuario"><strong>{configuracion.persona}</strong><small>{configuracion.etiqueta}</small></span>
                    <button type="button" className="boton-salida" onClick={alCerrarSesion}><LogOut size={17} /><span>Cerrar sesión</span></button>
                </div>
            </div>
            <div className="encabezado-panel__introduccion">
                <div><p className="rotulo-panel">Panel de {configuracion.etiqueta}</p><h1>{configuracion.encabezado}</h1><p>Martes, 25 de agosto de 2026 · Consulta el estado general de tu actividad.</p></div>
                <button type="button" className="accion-principal"><Plus size={18} />{configuracion.accionPrincipal}</button>
            </div>
        </header>
    );
}
