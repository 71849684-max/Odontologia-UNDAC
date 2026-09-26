import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, RotateCcw, Save, Search, ShieldCheck, UserRound } from 'lucide-react';
import Paginacion from '../../componentes/interfaz/Paginacion.jsx';
import {
    guardarPermisosUsuario,
    listarUsuarios,
    obtenerPermisosUsuario,
    restaurarPermisosUsuario,
} from '../../servicios/servicioAdministracion.js';
import { ErrorHttp } from '../../servicios/clienteHttp.js';

export default function PermisosUsuariosApp() {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioId, setUsuarioId] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState('');
    const [catalogo, setCatalogo] = useState([]);
    const [delRol, setDelRol] = useState(new Set());
    const [efectivos, setEfectivos] = useState(new Set());
    const [grupoAbierto, setGrupoAbierto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [usuarioActual, setUsuarioActual] = useState(null);

    const grupos = useMemo(() => [...new Set(catalogo.map((p) => p.modulo))], [catalogo]);

    const roles = useMemo(() => [...new Set(usuarios.map((item) => item.rol).filter(Boolean))], [usuarios]);

    const filtrados = usuarios.filter((item) =>
        `${item.nombre} ${item.rol ?? ''} ${item.nombre_usuario}`.toLowerCase().includes(busqueda.toLowerCase())
        && (!filtroRol || item.rol === filtroRol),
    );

    async function cargarUsuarios() {
        const respuesta = await listarUsuarios();
        const lista = respuesta.data ?? [];
        setUsuarios(lista);
        return lista;
    }

    async function cargarPermisos(id) {
        const respuesta = await obtenerPermisosUsuario(id);
        setUsuarioActual(respuesta.usuario);
        setCatalogo(respuesta.catalogo ?? []);
        setDelRol(new Set(respuesta.del_rol ?? []));
        setEfectivos(new Set(respuesta.efectivos ?? []));
        setGrupoAbierto(null);
        setMensaje('');
    }

    useEffect(() => {
        let cancelado = false;
        (async () => {
            setCargando(true);
            setError('');
            try {
                const lista = await cargarUsuarios();
                if (cancelado || !lista.length) return;
                const primero = lista[0].id;
                setUsuarioId(primero);
                await cargarPermisos(primero);
            } catch (err) {
                if (!cancelado) setError(err instanceof ErrorHttp ? err.message : 'No se pudieron cargar los permisos.');
            } finally {
                if (!cancelado) setCargando(false);
            }
        })();
        return () => { cancelado = true; };
    }, []);

    async function seleccionarUsuario(id) {
        setUsuarioId(id);
        setError('');
        setCargando(true);
        try {
            await cargarPermisos(id);
        } catch (err) {
            setError(err instanceof ErrorHttp ? err.message : 'No se pudieron cargar los permisos del usuario.');
        } finally {
            setCargando(false);
        }
    }

    function cambiarPermiso(id) {
        setMensaje('');
        setEfectivos((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    async function restaurarRol() {
        if (!usuarioId) return;
        setGuardando(true);
        setError('');
        try {
            const respuesta = await restaurarPermisosUsuario(usuarioId);
            setDelRol(new Set(respuesta.del_rol ?? []));
            setEfectivos(new Set(respuesta.efectivos ?? []));
            setGrupoAbierto(null);
            setMensaje('Permisos restaurados al rol base.');
        } catch (err) {
            setError(err instanceof ErrorHttp ? err.message : 'No se pudieron restaurar los permisos.');
        } finally {
            setGuardando(false);
        }
    }

    async function guardar() {
        if (!usuarioId) return;
        setGuardando(true);
        setError('');
        try {
            const respuesta = await guardarPermisosUsuario(usuarioId, [...efectivos]);
            setDelRol(new Set(respuesta.del_rol ?? []));
            setEfectivos(new Set(respuesta.efectivos ?? []));
            setMensaje('Permisos guardados correctamente.');
        } catch (err) {
            setError(err instanceof ErrorHttp ? err.message : 'No se pudieron guardar los permisos.');
        } finally {
            setGuardando(false);
        }
    }

    const resumen = {
        total: catalogo.length,
        activos: efectivos.size,
        adicionales: [...efectivos].filter((id) => !delRol.has(id)).length,
    };

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

            {error && <p className="hc-inline-callout" role="alert">{error}</p>}

            <div className="permisos-layout">
                <aside className="usuarios-card">
                    <div className="usuarios-card-head">
                        <div>
                            <h2>Usuarios</h2>
                            <span>{usuarios.length} usuarios disponibles</span>
                        </div>
                    </div>
                    <label className="permisos-search">
                        <Search size={17} />
                        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar usuario..." />
                    </label>
                    <label className="permisos-role-filter"><span className="sr-only">Filtrar por rol</span><select aria-label="Filtrar por rol" value={filtroRol} onChange={(event) => setFiltroRol(event.target.value)}><option value="">Todos los roles</option>{roles.map((rolItem) => <option key={rolItem} value={rolItem}>{rolItem}</option>)}</select></label>
                    <Paginacion elementos={filtrados} tamanos={[8, 16, 24]} inicial={8} etiqueta="usuarios">
                      {(visibles) => <div className="usuarios-lista">
                        {visibles.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className={`usuario-row ${item.id === usuarioId ? 'seleccionado' : ''}`}
                                onClick={() => seleccionarUsuario(item.id)}
                            >
                                <span className="usuario-avatar"><UserRound size={18} /></span>
                                <span className="usuario-info">
                                    <strong>{item.nombre}</strong>
                                    <small>{item.rol || 'Sin rol'}</small>
                                </span>
                                {item.id === usuarioId && <span className="usuario-check"><Check size={16} /></span>}
                            </button>
                        ))}
                      </div>}
                    </Paginacion>
                </aside>

                <main className="permisos-card">
                    {cargando && <p role="status" style={{ padding: 24 }}>Cargando permisos…</p>}

                    {!cargando && usuarioActual && (
                        <>
                            <header className="permisos-user-head">
                                <div className="permisos-user-main">
                                    <span className="usuario-avatar grande"><UserRound size={22} /></span>
                                    <div>
                                        <h2>{usuarioActual.nombre}</h2>
                                        <p>
                                            {(usuarioActual.roles ?? []).join(', ') || 'Sin rol'}
                                            <span> · </span>
                                            Estado: <b>{usuarioActual.estado ? 'Activo' : 'Inactivo'}</b>
                                        </p>
                                    </div>
                                </div>
                                <button type="button" className="btn-secundario" onClick={restaurarRol} disabled={guardando}>
                                    <RotateCcw size={16} /> Restaurar rol base
                                </button>
                            </header>

                            <div className="permisos-resumen">
                                <div><strong>{resumen.total}</strong><span>Permisos disponibles</span></div>
                                <div><strong>{resumen.activos}</strong><span>Permisos efectivos</span></div>
                                <div><strong>{resumen.adicionales}</strong><span>Adicionales al rol</span></div>
                            </div>

                            <div className="permisos-title-row">
                                <div>
                                    <h3>Módulos</h3>
                                    <p>Selecciona un módulo para revisar y ajustar sus permisos en línea.</p>
                                </div>
                            </div>

                            <div className="permisos-grupos permisos-grupos--seleccion">
                                {grupos.map((grupo) => {
                                    const items = catalogo.filter((p) => p.modulo === grupo);
                                    const activosGrupo = items.filter((p) => efectivos.has(p.id)).length;
                                    const seleccionado = grupoAbierto === grupo;
                                    return (
                                        <div className="permiso-grupo" key={grupo}>
                                          <button type="button" className={`permiso-grupo-head ${seleccionado ? 'seleccionado' : ''}`} onClick={() => setGrupoAbierto(seleccionado ? null : grupo)} aria-expanded={seleccionado}>
                                              <span><strong>{grupo}</strong><small>{activosGrupo} de {items.length} activos</small></span>
                                              <em>{activosGrupo}/{items.length}<ChevronRight className={seleccionado ? 'rotada' : ''} size={17} aria-hidden="true" /></em>
                                          </button>
                                          {seleccionado && <div className="permiso-items">{items.map((permiso) => <label key={permiso.id} className={`permiso-item ${efectivos.has(permiso.id) ? 'activo' : ''}`}>
                                            <input type="checkbox" checked={efectivos.has(permiso.id)} onChange={() => cambiarPermiso(permiso.id)} />
                                            <span className="permiso-box"><Check size={14} /></span><span><strong>{permiso.seccion}</strong><small>{permiso.accion}{!delRol.has(permiso.id) && efectivos.has(permiso.id) ? ' · adicional' : ''}</small></span>
                                          </label>)}</div>}
                                        </div>
                                    );
                                })}
                            </div>

                            <footer className="permisos-footer">
                                <span>{mensaje || 'Los cambios se guardan en la base de datos institucional.'}</span>
                                <button type="button" className="btn-principal" onClick={guardar} disabled={guardando}>
                                    <Save size={17} /> {guardando ? 'Guardando…' : 'Guardar permisos'}
                                </button>
                            </footer>
                        </>
                    )}
                </main>
            </div>

        </section>
    );
}
