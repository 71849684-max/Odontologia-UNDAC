import { Settings2 } from 'lucide-react';
import Paginacion from '../../componentes/interfaz/Paginacion.jsx';

export default function TablaRotacionesGrupo({ estado, grupo, onManage }) {
  const rotaciones = estado.rotaciones.filter((item) => item.grupoId === grupo.id);
  const integrantes = estado.membresias.filter((item) => item.grupoId === grupo.id && item.estado !== 'finalizada').length;

  return <Paginacion elementos={rotaciones} tamanos={[5, 10, 20]} inicial={5} etiqueta="rotaciones">
    {(visibles) => <div className="hc-table-card"><table className="hc-table hc-rotations-table" aria-label="Rotaciones del grupo"><thead><tr><th>Periodo</th><th>Curso</th><th>Fechas</th><th>Docentes</th><th>Estudiantes</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
      {visibles.map((rotacion) => {
        const docentes = estado.docentesRotacion.filter((item) => item.rotacionId === rotacion.id);
        const nombresDocentes = docentes.map((item) => estado.personas.find((persona) => persona.id === item.personaId)?.nombre).filter(Boolean);
        const excepcionales = (estado.asignacionesExcepcionales || []).filter((item) => item.rotacionId === rotacion.id).length;
        return <tr key={rotacion.id}>
          <td data-label="Periodo">{estado.periodos.find((item) => item.id === rotacion.periodoId)?.codigo || '—'}</td>
          <td data-label="Curso"><strong>{estado.cursos.find((item) => item.id === rotacion.cursoId)?.nombre || '—'}</strong></td>
          <td data-label="Fechas">{rotacion.fechaInicio}<br />{rotacion.fechaFin}</td>
          <td data-label="Docentes">{nombresDocentes.length ? nombresDocentes.join(', ') : 'Sin asignar'}</td>
          <td data-label="Estudiantes">{integrantes + excepcionales}</td>
          <td data-label="Estado"><span className={`hc-status-pill is-${rotacion.estado}`}>{rotacion.estado}</span></td>
          <td data-label="Acciones"><button type="button" className="hc-mini-button" onClick={() => onManage(rotacion.id)}><Settings2 size={14} /> Gestionar</button></td>
        </tr>;
      })}
    </tbody></table></div>}
  </Paginacion>;
}
