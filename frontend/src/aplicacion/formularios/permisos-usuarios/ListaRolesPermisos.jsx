import { Check, ShieldCheck } from 'lucide-react';

export default function ListaRolesPermisos({ roles, seleccionado, onSelect }) {
    return (
        <aside className="usuarios-card permisos-users" aria-label="Roles con permisos">
            <div className="permisos-users__filters">
                <p className="permisos-roles-nota">Elige la plantilla. Después puedes personalizar a cada alumno o docente.</p>
            </div>
            <div className="usuarios-lista">
                {roles.map((rol) => (
                    <button key={rol.codigo} type="button" className={`usuario-row ${rol.codigo === seleccionado ? 'seleccionado' : ''}`} onClick={() => onSelect(rol.codigo)}>
                        <span className="usuario-avatar"><ShieldCheck size={18} /></span>
                        <span className="usuario-info"><strong>{rol.nombre}</strong><small>{rol.detalle}</small></span>
                        {rol.codigo === seleccionado ? <span className="usuario-check"><Check size={16} /></span> : <span className="usuario-row__arrow">›</span>}
                    </button>
                ))}
            </div>
        </aside>
    );
}
