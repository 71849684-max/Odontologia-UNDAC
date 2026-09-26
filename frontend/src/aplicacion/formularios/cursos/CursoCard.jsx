import { CalendarDays, Pencil, RefreshCw } from 'lucide-react';

export default function CursoCard({ curso, rotaciones, onEdit }) {
  return <li className="hc-course-grid__item"><article className="hc-course-card">
    <header><span>{curso.codigo}</span><em className={`hc-status-pill ${curso.estado === 'activo' ? 'is-active' : ''}`}>{curso.estado === 'activo' ? 'Activo' : 'Inactivo'}</em></header>
    <h2>{curso.nombre}</h2>
    <p>{curso.descripcion || 'Sin descripción registrada.'}</p>
    <footer><div><span><RefreshCw size={14} /> Rotaciones: <strong>{rotaciones}</strong></span>{curso.actualizadoEn && <span><CalendarDays size={14} /> Actualizado: {curso.actualizadoEn}</span>}</div><button type="button" className="hc-mini-button" onClick={onEdit}><Pencil size={14} /> Editar</button></footer>
  </article></li>;
}
