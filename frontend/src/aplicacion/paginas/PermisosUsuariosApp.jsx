import { useMemo, useState } from 'react';
import { Check, ChevronDown, RotateCcw, Save, Search, ShieldCheck, UserRound } from 'lucide-react';
import { MOCK_USUARIOS } from '../configuracion/mockUsuarios';
import { PERMISOS_USUARIO, PERMISOS_INICIALES, permisosDelRol } from '../configuracion/permisos';

const GRUPOS = [...new Set(PERMISOS_USUARIO.map((p) => p.modulo))];

function nombreRol(rol) {
  if (rol.toLowerCase().includes('admin')) return 'Administrador';
  if (rol.toLowerCase().includes('docente')) return 'Docente';
  return 'Alumno';
}

export default function PermisosUsuariosApp() {
  const [usuarioId, setUsuarioId] = useState(MOCK_USUARIOS[0].id);
  const [busqueda, setBusqueda] = useState('');
  const [abiertos, setAbiertos] = useState(() => new Set(GRUPOS));
  const [permisos, setPermisos] = useState(() => new Map([...Object.entries(PERMISOS_INICIALES)].map(([id, set]) => [id, new Set(set)])));
  const [guardado, setGuardado] = useState(false);

  const usuario = MOCK_USUARIOS.find((item) => item.id === usuarioId) ?? MOCK_USUARIOS[0];
  const actuales = permisos.get(usuario.id) ?? new Set();
  const filtrados = MOCK_USUARIOS.filter((item) => `${item.nombre} ${item.rol}`.toLowerCase().includes(busqueda.toLowerCase()));

  const resumen = useMemo(() => {
    const total = PERMISOS_USUARIO.length;
    const activos = actuales.size;
    return { total, activos, adicionales: Math.max(0, activos - permisosDelRol(usuario.rol).size) };
  }, [actuales, usuario]);

  function cambiarPermiso(id) {
    setGuardado(false);
    setPermisos((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(usuario.id) ?? []);
      set.has(id) ? set.delete(id) : set.add(id);
      next.set(usuario.id, set);
      return next;
    });
  }

  function restaurarRol() {
    setGuardado(false);
    setPermisos((prev) => new Map(prev).set(usuario.id, permisosDelRol(usuario.rol)));
  }

  function guardar() {
    setGuardado(true);
  }

  return (
    <section className="permisos-page">
      <div className="permisos-hero">
        <div>
          <div className="permisos-kicker"><ShieldCheck size={17} /> Administración de acceso</div>
          <h1>Permisos por usuario</h1>
          <p>Administra de forma individual qué módulos y acciones puede utilizar cada estudiante, docente o miembro del personal administrativo.</p>
        </div>
        <div className="permisos-hero-badge"><ShieldCheck size={19} /> Control individual</div>
      </div>

      <div className="permisos-layout">
        <aside className="usuarios-card">
          <div className="usuarios-card-head">
            <div><h2>Usuarios</h2><span>{MOCK_USUARIOS.length} usuarios disponibles</span></div>
          </div>
          <label className="permisos-search"><Search size={17} /><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar usuario..." /></label>
          <div className="usuarios-lista">
            {filtrados.map((item) => (
              <button key={item.id} type="button" className={`usuario-row ${item.id === usuario.id ? 'seleccionado' : ''}`} onClick={() => { setUsuarioId(item.id); setGuardado(false); }}>
                <span className="usuario-avatar"><UserRound size={18} /></span>
                <span className="usuario-info"><strong>{item.nombre}</strong><small>{nombreRol(item.rol)}</small></span>
                {item.id === usuario.id && <span className="usuario-check"><Check size={16} /></span>}
              </button>
            ))}
          </div>
        </aside>

        <main className="permisos-card">
          <header className="permisos-user-head">
            <div className="permisos-user-main"><span className="usuario-avatar grande"><UserRound size={22} /></span><div><h2>{usuario.nombre}</h2><p>{nombreRol(usuario.rol)} <span>·</span> Estado: <b>Activo</b></p></div></div>
            <button type="button" className="btn-secundario" onClick={restaurarRol}><RotateCcw size={16} /> Restaurar rol base</button>
          </header>

          <div className="permisos-resumen">
            <div><strong>{resumen.total}</strong><span>Permisos disponibles</span></div>
            <div><strong>{resumen.activos}</strong><span>Permisos efectivos</span></div>
            <div><strong>{resumen.adicionales}</strong><span>Adicionales al rol</span></div>
          </div>

          <div className="permisos-title-row"><div><h3>Permisos efectivos</h3><p>Los cambios son individuales y no modifican el rol base del usuario.</p></div></div>

          <div className="permisos-grupos">
            {GRUPOS.map((grupo) => {
              const items = PERMISOS_USUARIO.filter((p) => p.modulo === grupo);
              const activosGrupo = items.filter((p) => actuales.has(p.id)).length;
              const abierto = abiertos.has(grupo);
              return (
                <div className="permiso-grupo" key={grupo}>
                  <button type="button" className="permiso-grupo-head" onClick={() => setAbiertos((prev) => { const next = new Set(prev); next.has(grupo) ? next.delete(grupo) : next.add(grupo); return next; })}>
                    <span><ChevronDown size={17} className={abierto ? '' : 'rotada'} /><strong>{grupo}</strong></span><em>{activosGrupo}/{items.length}</em>
                  </button>
                  {abierto && <div className="permiso-items">{items.map((permiso) => (
                    <label key={permiso.id} className={`permiso-item ${actuales.has(permiso.id) ? 'activo' : ''}`}>
                      <input type="checkbox" checked={actuales.has(permiso.id)} onChange={() => cambiarPermiso(permiso.id)} />
                      <span className="permiso-box"><Check size={14} /></span>
                      <span><strong>{permiso.seccion}</strong><small>{permiso.accion}</small></span>
                    </label>
                  ))}</div>}
                </div>
              );
            })}
          </div>

          <footer className="permisos-footer">
            <span>{guardado ? 'Cambios guardados en la interfaz de demostración.' : 'Los permisos están en modo interfaz (mock) por ahora.'}</span>
            <button type="button" className="btn-principal" onClick={guardar}><Save size={17} /> Guardar permisos</button>
          </footer>
        </main>
      </div>
    </section>
  );
}
