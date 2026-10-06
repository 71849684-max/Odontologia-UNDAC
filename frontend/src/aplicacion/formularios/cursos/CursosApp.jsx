import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import useModalDialog from '../../componentes/interfaz/useModalDialog.js';
import Paginacion from '../../componentes/interfaz/Paginacion.jsx';
import CursoCard from './CursoCard.jsx';
import { actualizarCurso, crearCurso, obtenerEstadoAcademico, sincronizarAcademico } from '../../servicios/servicioAcademico.js';
import { mensajeError } from '../../servicios/servicioClinico.js';

const VACIO = { codigo: '', nombre: '', descripcion: '', estado: 'activo' };

function CourseDialog({ open, triggerRef, onClose, onSaved, curso }) {
  const [formulario, setFormulario] = useState(VACIO);
  const [error, setError] = useState('');
  const dialogRef = useModalDialog(open, onClose, triggerRef);

  useEffect(() => {
    if (!open) return;
    setFormulario(curso ? { codigo: curso.codigo, nombre: curso.nombre, descripcion: curso.descripcion, estado: curso.estado } : VACIO);
    setError('');
  }, [open, curso]);

  function change(campo, valor) {
    setError('');
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function submit(event) {
    event.preventDefault();
    try {
      const guardado = await (curso ? actualizarCurso(curso.id, formulario) : crearCurso(formulario));
      setFormulario(VACIO);
      setError('');
      onSaved(guardado);
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar el curso.'));
    }
  }

  if (!open) return null;
  return createPortal(
    <div className="admin-dialogo-fondo" role="presentation" onClick={onClose}>
      <form ref={dialogRef} className="admin-dialogo" role="dialog" aria-modal="true" aria-labelledby="nuevo-curso-titulo" onClick={(event) => event.stopPropagation()} onSubmit={submit}>
        <header className="admin-dialogo__cabecera">
          <h2 id="nuevo-curso-titulo">{curso ? 'Editar curso' : 'Nuevo curso'}</h2>
          <button type="button" className="hc-mini-button" onClick={onClose} aria-label="Cerrar"><X size={16} /></button>
        </header>
        {error && <p className="hc-form-error" role="alert">{error}</p>}
        <div className="admin-dialogo__grid">
          <label><span>Código</span><input value={formulario.codigo} onChange={(event) => change('codigo', event.target.value)} required /></label>
          <label><span>Nombre</span><input value={formulario.nombre} onChange={(event) => change('nombre', event.target.value)} required /></label>
          <label className="admin-dialogo__campo-ancho"><span>Descripción</span><textarea value={formulario.descripcion} onChange={(event) => change('descripcion', event.target.value)} rows="3" /></label>
          <label><span>Estado</span><select value={formulario.estado} onChange={(event) => change('estado', event.target.value)}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label>
        </div>
        <footer className="admin-dialogo__acciones">
          <button type="button" className="hc-button hc-button--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="hc-button hc-button--primary">Guardar curso</button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}

export default function CursosApp() {
  const [estado, setEstado] = useState(() => obtenerEstadoAcademico());
  useEffect(() => {
    let vigente = true;
    sincronizarAcademico().then(() => { if (vigente) setEstado(obtenerEstadoAcademico()); }).catch(() => { if (vigente) setEstado(obtenerEstadoAcademico()); });
    return () => { vigente = false; };
  }, []);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [dialogo, setDialogo] = useState(false);
  const [cursoEditar, setCursoEditar] = useState(null);
  const triggerRef = useRef(null);
  const cerrar = useCallback(() => setDialogo(false), []);
  const cursos = useMemo(() => estado.cursos.filter((curso) => {
    const term = busqueda.trim().toLowerCase();
    const matchesText = !term || `${curso.codigo} ${curso.nombre} ${curso.descripcion}`.toLowerCase().includes(term);
    return matchesText && (!filtroEstado || curso.estado === filtroEstado);
  }), [estado.cursos, busqueda, filtroEstado]);

  return <div className="hc-page hc-courses-page space-y-5">
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="hc-kicker">Sistema</p><h1 className="hc-page-title">Cursos</h1><p className="hc-page-subtitle">Catálogo de cursos.</p></div>
      <button ref={triggerRef} type="button" className="hc-button hc-button--primary" onClick={() => { setCursoEditar(null); setDialogo(true); }}><Plus size={17} /> Nuevo curso</button>
    </header>

    <div className="hc-filterbar">
      <label className="hc-search"><Search size={17} /><span className="sr-only">Buscar curso</span><input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar curso..." /></label>
      <label className="hc-select-filter"><span>Estado</span><select value={filtroEstado} onChange={(event) => setFiltroEstado(event.target.value)}><option value="">Todos</option><option value="activo">Activos</option><option value="inactivo">Inactivos</option></select></label>
    </div>

    <Paginacion elementos={cursos} etiqueta="cursos">
      {(visibles) => <ul className="hc-course-grid" aria-label="Catálogo de cursos">{visibles.map((curso) => <CursoCard key={curso.id} curso={curso} rotaciones={estado.rotaciones.filter((item) => item.cursoId === curso.id).length} onEdit={() => { setCursoEditar(curso); setDialogo(true); }} />)}</ul>}
    </Paginacion>

    <CourseDialog open={dialogo} triggerRef={triggerRef} curso={cursoEditar} onClose={cerrar} onSaved={() => { setEstado(obtenerEstadoAcademico()); cerrar(); }} />
  </div>;
}
