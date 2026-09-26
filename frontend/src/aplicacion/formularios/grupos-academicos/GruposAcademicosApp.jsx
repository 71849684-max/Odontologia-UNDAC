import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search, UsersRound, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import useModalDialog from '../../componentes/interfaz/useModalDialog.js';
import Paginacion from '../../componentes/interfaz/Paginacion.jsx';
import {
  crearGrupo,
  actualizarGrupo,
  crearPeriodo,
  crearRotacion,
  finalizarMembresia,
  guardarAsignacionesExcepcionales,
  guardarDocentesRotacion,
  guardarMembresias,
  obtenerEstadoAcademico,
} from '../../servicios/repositorioAcademicoLocal.js';

const GRUPO_VACIO = { codigo: '', nombre: '', semestre: '', estado: 'activo' };
const PERIODO_VACIO = { codigo: '', nombre: '', fechaInicio: '', fechaFin: '', estado: 'activo' };

function PeriodDialog({ open, triggerRef, onClose, onCreated }) {
  const [formulario, setFormulario] = useState(PERIODO_VACIO);
  const [error, setError] = useState('');
  const dialogRef = useModalDialog(open, onClose, triggerRef);
  if (!open) return null;
  function submit(event) {
    event.preventDefault();
    try {
      onCreated(crearPeriodo(formulario));
      setFormulario(PERIODO_VACIO);
      setError('');
    } catch (err) { setError(err?.mensaje || 'No se pudo guardar el periodo.'); }
  }
  return createPortal(<div className="admin-dialogo-fondo" role="presentation" onClick={onClose}>
    <form ref={dialogRef} className="admin-dialogo" role="dialog" aria-modal="true" aria-labelledby="nuevo-periodo-titulo" onClick={(event) => event.stopPropagation()} onSubmit={submit}>
      <header className="admin-dialogo__cabecera"><h2 id="nuevo-periodo-titulo">Nuevo periodo</h2><button type="button" className="hc-mini-button" onClick={onClose} aria-label="Cerrar"><X size={16} /></button></header>
      {error && <p className="hc-form-error" role="alert">{error}</p>}
      <div className="admin-dialogo__grid">
        <label><span>Código</span><input value={formulario.codigo} onChange={(event) => setFormulario({ ...formulario, codigo: event.target.value })} required /></label>
        <label><span>Nombre</span><input value={formulario.nombre} onChange={(event) => setFormulario({ ...formulario, nombre: event.target.value })} required /></label>
        <label><span>Inicio</span><input type="date" value={formulario.fechaInicio} onChange={(event) => setFormulario({ ...formulario, fechaInicio: event.target.value })} required /></label>
        <label><span>Fin</span><input type="date" value={formulario.fechaFin} onChange={(event) => setFormulario({ ...formulario, fechaFin: event.target.value })} required /></label>
      </div>
      <footer className="admin-dialogo__acciones"><button type="button" className="hc-button hc-button--ghost" onClick={onClose}>Cancelar</button><button type="submit" className="hc-button hc-button--primary">Guardar periodo</button></footer>
    </form>
  </div>, document.body);
}

function GroupDialog({ open, triggerRef, onClose, onSaved, grupo }) {
  const [formulario, setFormulario] = useState(GRUPO_VACIO);
  const [error, setError] = useState('');
  const dialogRef = useModalDialog(open, onClose, triggerRef);

  useEffect(() => {
    if (open) setFormulario(grupo ? { codigo: grupo.codigo, nombre: grupo.nombre, semestre: grupo.semestre, estado: grupo.estado } : GRUPO_VACIO);
  }, [open, grupo]);

  function submit(event) {
    event.preventDefault();
    try {
      const guardado = grupo ? actualizarGrupo(grupo.id, formulario) : crearGrupo(formulario);
      setFormulario(GRUPO_VACIO);
      setError('');
      onSaved(guardado);
    } catch (err) {
      setError(err?.mensaje || 'No se pudo guardar el grupo.');
    }
  }

  if (!open) return null;
  return createPortal(
    <div className="admin-dialogo-fondo" role="presentation" onClick={onClose}>
      <form ref={dialogRef} className="admin-dialogo" role="dialog" aria-modal="true" aria-labelledby="nuevo-grupo-titulo" onClick={(event) => event.stopPropagation()} onSubmit={submit}>
        <header className="admin-dialogo__cabecera"><h2 id="nuevo-grupo-titulo">{grupo ? 'Editar grupo académico' : 'Nuevo grupo académico'}</h2><button type="button" className="hc-mini-button" onClick={onClose} aria-label="Cerrar"><X size={16} /></button></header>
        {error && <p className="hc-form-error" role="alert">{error}</p>}
        <div className="admin-dialogo__grid">
          <label><span>Código del grupo</span><input value={formulario.codigo} onChange={(event) => setFormulario({ ...formulario, codigo: event.target.value })} required /></label>
          <label><span>Nombre del grupo</span><input value={formulario.nombre} onChange={(event) => setFormulario({ ...formulario, nombre: event.target.value })} required /></label>
          <label><span>Semestre</span><input value={formulario.semestre} onChange={(event) => setFormulario({ ...formulario, semestre: event.target.value })} required /></label>
          <label><span>Estado</span><select value={formulario.estado} onChange={(event) => setFormulario({ ...formulario, estado: event.target.value })}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label>
        </div>
        <footer className="admin-dialogo__acciones"><button type="button" className="hc-button hc-button--ghost" onClick={onClose}>Cancelar</button><button type="submit" className="hc-button hc-button--primary">Guardar grupo</button></footer>
      </form>
    </div>,
    document.body,
  );
}

function MembersBlock({ estado, grupo, onRefresh }) {
  const [seleccionados, setSeleccionados] = useState([]);
  const [error, setError] = useState('');
  const estudiantes = estado.personas.filter((persona) => persona.tipo === 'estudiante');
  const membresiasActivas = estado.membresias.filter((item) => item.grupoId === grupo.id && item.estado !== 'finalizada' && !item.fechaFin);
  const idsActivos = new Set(membresiasActivas.map((item) => item.personaId));
  const disponibles = estudiantes.filter((persona) => !idsActivos.has(persona.id));

  function toggle(id) {
    setSeleccionados((actual) => actual.includes(id) ? actual.filter((item) => item !== id) : [...actual, id]);
  }

  function save() {
    if (!seleccionados.length) return;
    try {
      guardarMembresias(grupo.id, seleccionados.map((personaId) => ({ personaId, funcion: 'estudiante', fechaInicio: new Date().toISOString().slice(0, 10), estado: 'activa' })));
      setSeleccionados([]);
      setError('');
      onRefresh();
    } catch (err) {
      setError(err?.mensaje || 'No se pudieron agregar los integrantes.');
    }
  }

  function finish(membresia) {
    try {
      finalizarMembresia(membresia.id, new Date().toISOString().slice(0, 10));
      setError('');
      onRefresh();
    } catch (err) { setError(err?.mensaje || 'No se pudo finalizar la membresía.'); }
  }

  return <section className="hc-academic-block" aria-labelledby="integrantes-titulo">
    <header><div><h3 id="integrantes-titulo">Integrantes</h3><p>{membresiasActivas.length} integrantes activos</p></div></header>
    {membresiasActivas.length > 0 && <div className="hc-chip-list">{membresiasActivas.map((item) => <span key={item.id}>{estado.personas.find((persona) => persona.id === item.personaId)?.nombre}<button type="button" className="hc-mini-button" onClick={() => finish(item)}>Finalizar</button></span>)}</div>}
    {disponibles.length > 0 && <div className="hc-academic-selector">{disponibles.map((persona) => <label key={persona.id}><input type="checkbox" checked={seleccionados.includes(persona.id)} onChange={() => toggle(persona.id)} /> <span>{persona.nombre}</span></label>)}</div>}
    {error && <p className="hc-form-error" role="alert">{error}</p>}
    <button type="button" className="hc-button hc-button--ghost" disabled={!seleccionados.length} onClick={save}>Agregar estudiantes</button>
  </section>;
}

function TeachersBlock({ estado, rotacionId, onRefresh }) {
  const [seleccionados, setSeleccionados] = useState({});
  const [error, setError] = useState('');
  const docentes = estado.personas.filter((persona) => persona.tipo === 'docente');
  const asignados = estado.docentesRotacion.filter((item) => item.rotacionId === rotacionId);
  const idsAsignados = new Set(asignados.map((item) => item.personaId));
  const disponibles = docentes.filter((persona) => !idsAsignados.has(persona.id));

  function toggle(id) {
    setSeleccionados((actual) => actual[id] ? Object.fromEntries(Object.entries(actual).filter(([key]) => key !== id)) : { ...actual, [id]: 'responsable' });
  }

  function save() {
    const docentesNuevos = Object.entries(seleccionados).map(([personaId, funcion]) => ({ personaId, funcion }));
    if (!docentesNuevos.length) return;
    try {
      guardarDocentesRotacion(rotacionId, docentesNuevos);
      setSeleccionados({});
      setError('');
      onRefresh();
    } catch (err) {
      setError(err?.mensaje || 'No se pudieron asignar los docentes.');
    }
  }

  return <section className="hc-academic-block" aria-labelledby="docentes-titulo">
    <header><div><h3 id="docentes-titulo">Docentes de la rotación</h3><p>{asignados.length} docentes asignados</p></div></header>
    {asignados.length > 0 && <div className="hc-chip-list">{asignados.map((item) => <span key={item.id}>{estado.personas.find((persona) => persona.id === item.personaId)?.nombre} · {item.funcion}</span>)}</div>}
    <div className="hc-academic-selector">{disponibles.map((persona) => <div className="hc-academic-selector__row" key={persona.id}>
      <label><input type="checkbox" checked={Boolean(seleccionados[persona.id])} onChange={() => toggle(persona.id)} /> <span>{persona.nombre}</span></label>
      <label><span className="sr-only">Función de {persona.nombre}</span><select aria-label={`Función de ${persona.nombre}`} value={seleccionados[persona.id] || 'responsable'} disabled={!seleccionados[persona.id]} onChange={(event) => setSeleccionados({ ...seleccionados, [persona.id]: event.target.value })}><option value="responsable">Responsable</option><option value="colaborador">Colaborador</option></select></label>
    </div>)}</div>
    {error && <p className="hc-form-error" role="alert">{error}</p>}
    <button type="button" className="hc-button hc-button--ghost" disabled={!Object.keys(seleccionados).length} onClick={save}>Asignar docentes</button>
  </section>;
}

function ExceptionalStudentsBlock({ estado, rotacionId, onRefresh }) {
  const [seleccionados, setSeleccionados] = useState([]);
  const [error, setError] = useState('');
  const asignados = (estado.asignacionesExcepcionales || []).filter((item) => item.rotacionId === rotacionId);
  const idsAsignados = new Set(asignados.map((item) => item.personaId));
  const disponibles = estado.personas.filter((item) => item.tipo === 'estudiante' && !idsAsignados.has(item.id));
  function save() {
    try {
      guardarAsignacionesExcepcionales(rotacionId, seleccionados.map((personaId) => ({ personaId })));
      setSeleccionados([]);
      setError('');
      onRefresh();
    } catch (err) { setError(err?.mensaje || 'No se pudo guardar la asignación excepcional.'); }
  }
  return <section className="hc-academic-block" aria-labelledby="excepcionales-titulo">
    <header><div><h3 id="excepcionales-titulo">Asignaciones excepcionales</h3><p>Estudiantes que participan sin incorporar a todo su grupo.</p></div></header>
    {asignados.length > 0 && <div className="hc-chip-list">{asignados.map((item) => <span key={item.id}>{estado.personas.find((persona) => persona.id === item.personaId)?.nombre}</span>)}</div>}
    <div className="hc-academic-selector">{disponibles.map((persona) => <label key={persona.id}><input type="checkbox" checked={seleccionados.includes(persona.id)} onChange={() => setSeleccionados((actual) => actual.includes(persona.id) ? actual.filter((id) => id !== persona.id) : [...actual, persona.id])} /> <span>{persona.nombre}</span></label>)}</div>
    {error && <p className="hc-form-error" role="alert">{error}</p>}
    <button type="button" className="hc-button hc-button--ghost" disabled={!seleccionados.length} onClick={save}>Asignar estudiantes</button>
  </section>;
}

function RotationsBlock({ estado, grupo, onRefresh }) {
  const [formulario, setFormulario] = useState(() => ({ cursoId: estado.cursos[0]?.id || '', periodoId: estado.periodos[0]?.id || '', fechaInicio: '', fechaFin: '', estado: 'programada' }));
  const [seleccionada, setSeleccionada] = useState(null);
  const [error, setError] = useState('');
  const rotaciones = estado.rotaciones.filter((item) => item.grupoId === grupo.id);
  const rotacionSeleccionada = rotaciones.find((item) => item.id === seleccionada);

  function submit(event) {
    event.preventDefault();
    try {
      const rotacion = crearRotacion({ ...formulario, grupoId: grupo.id });
      setSeleccionada(rotacion.id);
      setError('');
      onRefresh();
    } catch (err) {
      setError(err?.mensaje || 'No se pudo agregar la rotación.');
    }
  }

  return <>
    <section className="hc-academic-block" aria-labelledby="rotaciones-titulo">
      <header><div><h3 id="rotaciones-titulo">Rotaciones</h3><p>Cada registro conserva su curso, periodo y vigencia.</p></div></header>
      <form className="hc-rotation-form" onSubmit={submit}>
        <label>Curso de la rotación<select value={formulario.cursoId} onChange={(event) => setFormulario({ ...formulario, cursoId: event.target.value })} required>{estado.cursos.filter((item) => item.estado === 'activo').map((curso) => <option key={curso.id} value={curso.id}>{curso.nombre}</option>)}</select></label>
        <label>Periodo de la rotación<select value={formulario.periodoId} onChange={(event) => setFormulario({ ...formulario, periodoId: event.target.value })} required>{estado.periodos.map((periodo) => <option key={periodo.id} value={periodo.id}>{periodo.codigo}</option>)}</select></label>
        <label>Inicio de la rotación<input type="date" value={formulario.fechaInicio} onChange={(event) => setFormulario({ ...formulario, fechaInicio: event.target.value })} required /></label>
        <label>Fin de la rotación<input type="date" value={formulario.fechaFin} onChange={(event) => setFormulario({ ...formulario, fechaFin: event.target.value })} required /></label>
        <button type="submit" className="hc-button hc-button--primary">Agregar rotación</button>
      </form>
      {error && <p className="hc-form-error" role="alert">{error}</p>}
      <Paginacion elementos={rotaciones} tamanos={[5, 10, 20]} inicial={5} etiqueta="rotaciones">
        {(visibles) => <div className="hc-table-card"><table className="hc-table" aria-label="Historial de rotaciones"><thead><tr><th>Curso</th><th>Periodo</th><th>Vigencia</th><th>Estado</th><th>Docentes</th></tr></thead><tbody>
          {visibles.map((rotacion) => <tr key={rotacion.id}><td data-label="Curso">{estado.cursos.find((item) => item.id === rotacion.cursoId)?.nombre}</td><td data-label="Periodo">{estado.periodos.find((item) => item.id === rotacion.periodoId)?.codigo}</td><td data-label="Vigencia">{rotacion.fechaInicio} — {rotacion.fechaFin}</td><td data-label="Estado">{rotacion.estado}</td><td data-label="Docentes"><button type="button" className="hc-mini-button" onClick={() => setSeleccionada(rotacion.id)}>{estado.docentesRotacion.filter((item) => item.rotacionId === rotacion.id).length} · Gestionar</button></td></tr>)}
        </tbody></table></div>}
      </Paginacion>
    </section>
    {rotacionSeleccionada && <><TeachersBlock key={`teachers-${rotacionSeleccionada.id}`} estado={estado} rotacionId={rotacionSeleccionada.id} onRefresh={onRefresh} /><ExceptionalStudentsBlock key={`students-${rotacionSeleccionada.id}`} estado={estado} rotacionId={rotacionSeleccionada.id} onRefresh={onRefresh} /></>}
  </>;
}

export default function GruposAcademicosApp() {
  const [estado, setEstado] = useState(() => obtenerEstadoAcademico());
  const [grupoId, setGrupoId] = useState(() => estado.grupos[0]?.id || null);
  const [dialogo, setDialogo] = useState(false);
  const [grupoEditar, setGrupoEditar] = useState(null);
  const [pestana, setPestana] = useState('resumen');
  const [dialogoPeriodo, setDialogoPeriodo] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const triggerRef = useRef(null);
  const triggerPeriodoRef = useRef(null);
  const cerrar = useCallback(() => setDialogo(false), []);
  const refrescar = useCallback(() => setEstado(obtenerEstadoAcademico()), []);
  const grupo = estado.grupos.find((item) => item.id === grupoId);
  const grupos = useMemo(() => estado.grupos.filter((item) => {
    const term = busqueda.trim().toLowerCase();
    const rotaciones = estado.rotaciones.filter((rotacion) => rotacion.grupoId === item.id);
    return (!term || `${item.codigo} ${item.nombre}`.toLowerCase().includes(term))
      && (!filtroEstado || item.estado === filtroEstado)
      && rotaciones.concat({ periodoId: '', cursoId: '' }).some((rotacion) => (
        (!filtroPeriodo || rotacion.periodoId === filtroPeriodo)
        && (!filtroCurso || rotacion.cursoId === filtroCurso)
      ));
  }), [estado, busqueda, filtroPeriodo, filtroCurso, filtroEstado]);

  return <div className="hc-page hc-academic-page space-y-5">
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="hc-kicker">Sistema</p><h1 className="hc-page-title">Grupos académicos</h1><p className="hc-page-subtitle">Organice integrantes, cursos, periodos y responsables sin perder asignaciones anteriores.</p></div><div className="flex gap-2"><button ref={triggerPeriodoRef} type="button" className="hc-button hc-button--ghost" onClick={() => setDialogoPeriodo(true)}><Plus size={17} /> Nuevo periodo</button><button ref={triggerRef} type="button" className="hc-button hc-button--primary" onClick={() => { setGrupoEditar(null); setDialogo(true); }}><Plus size={17} /> Nuevo grupo</button></div></header>
    <div className="hc-filterbar">
      <label className="hc-search"><Search size={17} /><span className="sr-only">Buscar grupo</span><input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar grupo..." /></label>
      <label className="hc-select-filter"><span>Periodo</span><select value={filtroPeriodo} onChange={(event) => setFiltroPeriodo(event.target.value)}><option value="">Todos</option>{estado.periodos.map((item) => <option key={item.id} value={item.id}>{item.codigo}</option>)}</select></label>
      <label className="hc-select-filter"><span>Curso</span><select value={filtroCurso} onChange={(event) => setFiltroCurso(event.target.value)}><option value="">Todos</option>{estado.cursos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
      <label className="hc-select-filter"><span>Estado</span><select value={filtroEstado} onChange={(event) => setFiltroEstado(event.target.value)}><option value="">Todos</option><option value="activo">Activos</option><option value="inactivo">Inactivos</option></select></label>
    </div>
    <div className="hc-academic-layout">
      <aside className="hc-panel-card hc-group-list" aria-label="Lista de grupos"><Paginacion elementos={grupos} tamanos={[6, 12, 24]} inicial={6} etiqueta="grupos">{(visibles) => <div>{visibles.map((item) => <button type="button" className={item.id === grupoId ? 'is-active' : ''} key={item.id} onClick={() => { setGrupoId(item.id); setPestana('resumen'); }}><span><UsersRound size={17} /></span><strong>{item.nombre}</strong><small>{item.codigo} · {item.semestre}</small></button>)}</div>}</Paginacion></aside>
      {grupo ? <article className="hc-panel-card hc-group-detail"><header><div><span>{grupo.codigo} · Semestre {grupo.semestre}</span><h2>{grupo.nombre}</h2></div><div className="flex items-center gap-2"><small>{grupo.estado}</small><button type="button" className="hc-mini-button" onClick={() => { setGrupoEditar(grupo); setDialogo(true); }}>Editar grupo</button></div></header>
        <nav className="hc-detail-tabs" aria-label="Secciones del grupo">{['resumen', 'integrantes', 'rotaciones', 'docentes', 'historial'].map((item) => <button type="button" key={item} className={pestana === item ? 'is-active' : ''} onClick={() => setPestana(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</nav>
        {pestana === 'resumen' && <section className="hc-group-summary"><div><strong>{estado.membresias.filter((item) => item.grupoId === grupo.id && item.estado !== 'finalizada').length}</strong><span>Integrantes activos</span></div><div><strong>{estado.rotaciones.filter((item) => item.grupoId === grupo.id).length}</strong><span>Rotaciones</span></div><div><strong>{new Set(estado.docentesRotacion.filter((asignacion) => estado.rotaciones.some((rotacion) => rotacion.id === asignacion.rotacionId && rotacion.grupoId === grupo.id)).map((item) => item.personaId)).size}</strong><span>Docentes</span></div></section>}
        {pestana === 'integrantes' && <MembersBlock key={`members-${grupo.id}`} estado={estado} grupo={grupo} onRefresh={refrescar} />}
        {pestana === 'rotaciones' && <RotationsBlock key={`rotations-${grupo.id}`} estado={estado} grupo={grupo} onRefresh={refrescar} />}
        {pestana === 'docentes' && <section className="hc-academic-block"><h3>Docentes</h3><p>Gestione los responsables desde cada rotación registrada.</p></section>}
        {pestana === 'historial' && <section className="hc-academic-block"><h3>Historial</h3><p>Las membresías y rotaciones finalizadas se conservan en este grupo.</p></section>}
      </article> : <section className="hc-panel-card hc-group-empty"><p>Seleccione un grupo para gestionar su estructura académica.</p></section>}
    </div>
    <GroupDialog open={dialogo} triggerRef={triggerRef} grupo={grupoEditar} onClose={cerrar} onSaved={(guardado) => { refrescar(); setGrupoId(guardado.id); cerrar(); }} />
    <PeriodDialog open={dialogoPeriodo} triggerRef={triggerPeriodoRef} onClose={() => setDialogoPeriodo(false)} onCreated={() => { refrescar(); setDialogoPeriodo(false); }} />
  </div>;
}
