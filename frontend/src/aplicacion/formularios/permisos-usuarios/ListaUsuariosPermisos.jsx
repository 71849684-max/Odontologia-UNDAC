import { Check, Search, UserRound } from 'lucide-react';
import Paginacion from '../../componentes/interfaz/Paginacion.jsx';

export default function ListaUsuariosPermisos({ usuarios, roles, seleccionadoId, busqueda, rol, onBusquedaChange, onRolChange, onSelect }) {
  return <aside className="usuarios-card permisos-users" aria-label="Usuarios con permisos">
    <div className="permisos-users__filters">
      <label className="permisos-search"><Search size={16} /><span className="sr-only">Buscar usuario</span><input value={busqueda} onChange={(event) => onBusquedaChange(event.target.value)} placeholder="Buscar usuario..." /></label>
      <label className="permisos-role-filter"><span className="sr-only">Filtrar por rol</span><select aria-label="Filtrar por rol" value={rol} onChange={(event) => onRolChange(event.target.value)}><option value="">Todos los roles</option>{roles.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    </div>
    <Paginacion elementos={usuarios} tamanos={[8, 16, 24]} inicial={8} etiqueta="usuarios">
      {(visibles) => <div className="usuarios-lista">{visibles.map((item) => <button key={item.id} type="button" className={`usuario-row ${item.id === seleccionadoId ? 'seleccionado' : ''}`} onClick={() => onSelect(item.id)}>
        <span className="usuario-avatar"><UserRound size={18} /></span>
        <span className="usuario-info"><strong>{item.nombre}</strong><small>{item.rol || 'Sin rol'}</small></span>
        {item.id === seleccionadoId ? <span className="usuario-check"><Check size={16} /></span> : <span className="usuario-row__arrow">›</span>}
      </button>)}</div>}
    </Paginacion>
  </aside>;
}
