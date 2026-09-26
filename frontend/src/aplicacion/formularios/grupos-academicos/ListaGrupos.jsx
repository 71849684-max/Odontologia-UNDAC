import { Search } from 'lucide-react';
import Paginacion from '../../componentes/interfaz/Paginacion.jsx';

export default function ListaGrupos({ estado, grupos, grupoId, busqueda, periodoId, onBusquedaChange, onPeriodoChange, onSelect }) {
  return <aside className="hc-panel-card hc-group-list" aria-label="Lista de grupos">
    <div className="hc-group-list__header">
      <h2>Grupos académicos</h2>
      <label className="hc-search"><Search size={16} /><span className="sr-only">Buscar grupo</span><input value={busqueda} onChange={(event) => onBusquedaChange(event.target.value)} placeholder="Buscar grupo..." /></label>
      <label className="hc-group-period-filter"><span className="sr-only">Periodo académico</span><select aria-label="Periodo académico" value={periodoId} onChange={(event) => onPeriodoChange(event.target.value)}><option value="">Todos los periodos</option>{estado.periodos.map((item) => <option key={item.id} value={item.id}>{item.codigo}</option>)}</select></label>
    </div>
    <Paginacion elementos={grupos} tamanos={[6, 12, 24]} inicial={6} etiqueta="grupos">
      {(visibles) => <div className="hc-group-list__items">{visibles.map((item) => {
        const rotaciones = estado.rotaciones.filter((rotacion) => rotacion.grupoId === item.id);
        const integrantes = estado.membresias.filter((membresia) => membresia.grupoId === item.id && membresia.estado !== 'finalizada').length;
        return <button type="button" className={item.id === grupoId ? 'is-active' : ''} key={item.id} onClick={() => onSelect(item.id)}>
          <span className="hc-group-list__status">{item.estado === 'activo' ? 'Activo' : 'Inactivo'}</span>
          <strong>{item.codigo}</strong>
          <em>{item.nombre}</em>
          <small>{item.semestre} · {integrantes} estudiantes · {rotaciones.length} rotaciones</small>
        </button>;
      })}</div>}
    </Paginacion>
  </aside>;
}
