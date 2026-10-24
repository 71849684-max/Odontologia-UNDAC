import { useEffect, useMemo, useState } from 'react';
import ListaUsuariosPermisos from './ListaUsuariosPermisos.jsx';
import ListaRolesPermisos from './ListaRolesPermisos.jsx';
import EditorPermisosUsuario from './EditorPermisosUsuario.jsx';
import FichaUsuario from './FichaUsuario.jsx';
import {
    guardarPermisosRol,
    guardarPermisosUsuario,
    listarUsuarios,
    obtenerPermisosRol,
    obtenerPermisosUsuario,
    restaurarPermisosUsuario,
} from '../../servicios/servicioAdministracion.js';
import { ErrorHttp } from '../../servicios/clienteHttp.js';
import { useSesion } from '../../autenticacion/ContextoSesion.jsx';
import { etiquetaCodigoRol } from '../../configuracion/etiquetasRoles.js';

const ROLES_BASE = [
    { codigo: 'ALUMNO', nombre: 'Asistente', detalle: 'Plantilla de todos los asistentes' },
    { codigo: 'DOCENTE', nombre: 'Profesional encargado', detalle: 'Plantilla de todos los profesionales encargados' },
];

export default function PermisosUsuariosApp({ onNavigate }) {
    const sesion = useSesion();
    const [modo, setModo] = useState('usuarios');
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
    const [fichaAbierta, setFichaAbierta] = useState(false);
    const [rolCodigo, setRolCodigo] = useState('ALUMNO');
    const [rolActual, setRolActual] = useState(null);

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

    async function cargarPermisosRol(codigo) {
        const respuesta = await obtenerPermisosRol(codigo);
        setRolActual(respuesta.rol ? { ...respuesta.rol, nombre: etiquetaCodigoRol(respuesta.rol.codigo, respuesta.rol.nombre) } : ROLES_BASE.find((item) => item.codigo === codigo));
        setCatalogo(respuesta.catalogo ?? []);
        setDelRol(new Set(respuesta.efectivos ?? []));
        setEfectivos(new Set(respuesta.efectivos ?? []));
        setGrupoAbierto(null);
        setMensaje('');
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

    async function seleccionarRol(codigo) {
        setRolCodigo(codigo);
        setError('');
        setCargando(true);
        try {
            await cargarPermisosRol(codigo);
        } catch (err) {
            setError(err instanceof ErrorHttp ? err.message : 'No se pudieron cargar los permisos del rol.');
        } finally {
            setCargando(false);
        }
    }

    async function cambiarModo(siguiente) {
        setModo(siguiente);
        setError('');
        setMensaje('');
        setGrupoAbierto(null);
        if (siguiente === 'roles' && !rolActual) {
            await seleccionarRol(rolCodigo);
        }
    }

    async function guardar() {
        if (modo === 'roles') {
            if (!rolCodigo) return;
            setGuardando(true);
            setError('');
            try {
                const respuesta = await guardarPermisosRol(rolCodigo, [...efectivos]);
                setRolActual(respuesta.rol ?? rolActual);
                setDelRol(new Set(respuesta.efectivos ?? []));
                setEfectivos(new Set(respuesta.efectivos ?? []));
                setMensaje('Plantilla guardada. Quienes no tengan un ajuste personal ya usan estos módulos.');
                await sesion.refrescar?.();
            } catch (err) {
                setError(err instanceof ErrorHttp ? err.message : 'No se pudieron guardar los permisos del rol.');
            } finally {
                setGuardando(false);
            }
            return;
        }

        if (!usuarioId) return;
        setGuardando(true);
        setError('');
        try {
            const respuesta = await guardarPermisosUsuario(usuarioId, [...efectivos]);
            setDelRol(new Set(respuesta.del_rol ?? []));
            setEfectivos(new Set(respuesta.efectivos ?? []));
            setMensaje('Permisos guardados para este usuario. El rol base no cambia.');
            await sesion.refrescar?.();
        } catch (err) {
            setError(err instanceof ErrorHttp ? err.message : 'No se pudieron guardar los permisos.');
        } finally {
            setGuardando(false);
        }
    }

    return (
        <section className="permisos-page">
            <div className="permisos-hero">
                <div>
                    <h1>Permisos por usuario</h1>
                    <p>Primero define qué módulos ven el asistente y el profesional encargado. Después puedes personalizar a cada persona.</p>
                </div>
                <div className="permisos-modo" role="tablist" aria-label="Alcance de los permisos">
                    <button type="button" role="tab" aria-selected={modo === 'roles'} onClick={() => cambiarModo('roles')}>Por rol</button>
                    <button type="button" role="tab" aria-selected={modo === 'usuarios'} onClick={() => cambiarModo('usuarios')}>Por usuario</button>
                </div>
            </div>

            {error && <p className="hc-inline-callout" role="alert">{error}</p>}

            <div className="permisos-layout">
                {modo === 'roles'
                    ? <ListaRolesPermisos roles={ROLES_BASE} seleccionado={rolCodigo} onSelect={seleccionarRol} />
                    : <ListaUsuariosPermisos usuarios={filtrados} roles={roles} seleccionadoId={usuarioId} busqueda={busqueda} rol={filtroRol} onBusquedaChange={setBusqueda} onRolChange={setFiltroRol} onSelect={seleccionarUsuario} />}
                <div className="permisos-columna">
                    {cargando && <section className="permisos-card" aria-label="Editor de permisos"><p role="status" style={{ padding: 24 }}>Cargando permisos…</p></section>}
                    {!cargando && modo === 'roles' && rolActual && <EditorPermisosUsuario alcance="rol" usuario={{ nombre: rolActual.nombre, nombre_usuario: rolActual.descripcion || 'Módulos compartidos por el rol', estado: true }} catalogo={catalogo} delRol={delRol} efectivos={efectivos} grupoAbierto={grupoAbierto} guardando={guardando} mensaje={mensaje} onToggleGroup={setGrupoAbierto} onTogglePermission={cambiarPermiso} onSave={guardar} />}
                    {!cargando && modo === 'usuarios' && usuarioActual && <EditorPermisosUsuario usuario={usuarioActual} catalogo={catalogo} delRol={delRol} efectivos={efectivos} grupoAbierto={grupoAbierto} guardando={guardando} mensaje={mensaje} onToggleGroup={setGrupoAbierto} onTogglePermission={cambiarPermiso} onRestore={restaurarRol} onSave={guardar} onViewProfile={() => setFichaAbierta(true)} />}
                    {fichaAbierta && usuarioId && <FichaUsuario id={usuarioId} onClose={() => setFichaAbierta(false)} onManage={onNavigate ? () => onNavigate('usuarios') : undefined} />}
                </div>
            </div>

        </section>
    );
}
