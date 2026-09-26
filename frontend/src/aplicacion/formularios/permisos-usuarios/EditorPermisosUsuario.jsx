import { ChevronDown, RotateCcw, Save, ShieldCheck, UserRound } from 'lucide-react';

export default function EditorPermisosUsuario({ usuario, catalogo, delRol, efectivos, grupoAbierto, guardando, mensaje, onToggleGroup, onTogglePermission, onRestore, onSave, onViewProfile }) {
  const grupos = [...new Set(catalogo.map((item) => item.modulo))];

  return <main className="permisos-card permisos-editor" aria-label="Editor de permisos">
    <header className="permisos-user-head">
      <div className="permisos-user-main">
        <span className="usuario-avatar grande"><UserRound size={22} /></span>
        <div><h2>{usuario.nombre}</h2><p>{(usuario.roles ?? []).join(', ') || 'Sin rol'} <span className={`permisos-user-state ${usuario.estado ? 'is-active' : ''}`}>{usuario.estado ? 'Activo' : 'Inactivo'}</span></p><small>{usuario.correo || usuario.nombre_usuario}</small></div>
      </div>
      <button type="button" className="btn-secundario" onClick={onViewProfile}><UserRound size={16} /> Ver perfil</button>
    </header>

    <section className="permisos-editor__body" aria-labelledby="permisos-usuario-titulo">
      <div className="permisos-title-row"><div><h3 id="permisos-usuario-titulo">Permisos del usuario</h3><p>Activa o desactiva los permisos por módulo. Los cambios se aplican solo para este usuario.</p></div></div>
      <div className="permisos-editor__modules">
        {grupos.map((grupo) => {
          const items = catalogo.filter((item) => item.modulo === grupo);
          const activos = items.filter((item) => efectivos.has(item.id)).length;
          const abierto = grupoAbierto === grupo;
          const porcentaje = items.length ? Math.round((activos / items.length) * 100) : 0;
          return <article className={`permiso-grupo ${abierto ? 'is-open' : ''}`} key={grupo}>
            <button type="button" className="permiso-grupo-head" onClick={() => onToggleGroup(abierto ? null : grupo)} aria-expanded={abierto}>
              <span className="permiso-grupo-head__icon"><ShieldCheck size={17} /></span>
              <span className="permiso-grupo-head__copy"><strong>{grupo}</strong><small>{activos} de {items.length} activos</small></span>
              <span className="permiso-grupo-head__progress"><small>{activos}/{items.length}</small><span role="progressbar" aria-label={`Permisos activos de ${grupo}`} aria-valuemin="0" aria-valuemax={items.length} aria-valuenow={activos}><i style={{ width: `${porcentaje}%` }} /></span></span>
              <ChevronDown className={abierto ? 'rotada' : ''} size={17} aria-hidden="true" />
            </button>
            {abierto && <div className="permiso-items">{items.map((permiso) => {
              const activo = efectivos.has(permiso.id);
              return <label key={permiso.id} className={`permiso-switch ${activo ? 'activo' : ''}`}>
                <input type="checkbox" checked={activo} onChange={() => onTogglePermission(permiso.id)} aria-label={permiso.seccion || permiso.nombre} />
                <span className="permiso-switch__control" aria-hidden="true"><i /></span>
                <span><strong>{permiso.seccion || permiso.nombre}</strong><small>{permiso.nombre}{!delRol.has(permiso.id) && activo ? ' · adicional' : ''}</small></span>
              </label>;
            })}</div>}
          </article>;
        })}
      </div>
    </section>

    <footer className="permisos-footer"><span>{mensaje || 'Los cambios se guardan en la base de datos institucional.'}</span><div><button type="button" className="btn-secundario" onClick={onRestore} disabled={guardando}><RotateCcw size={16} /> Restaurar rol</button><button type="button" className="btn-principal" onClick={onSave} disabled={guardando}><Save size={17} /> {guardando ? 'Guardando…' : 'Guardar cambios'}</button></div></footer>
  </main>;
}
