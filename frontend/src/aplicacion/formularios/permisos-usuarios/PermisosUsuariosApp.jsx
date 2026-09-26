import { useEffect, useMemo, useState } from 'react';
import ListaUsuariosPermisos from './ListaUsuariosPermisos.jsx';
import EditorPermisosUsuario from './EditorPermisosUsuario.jsx';
import {
    guardarPermisosUsuario,
    listarUsuarios,
    obtenerPermisosUsuario,
    restaurarPermisosUsuario,
} from '../../servicios/servicioAdministracion.js';
import { ErrorHttp } from '../../servicios/clienteHttp.js';

export default function PermisosUsuariosApp({ onNavigate }) {
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

    return (
        <section className="permisos-page">
            <div className="permisos-hero">
                <div>
                    <h1>Permisos por usuario</h1>
                    <p>Gestiona los permisos individuales de cada usuario del sistema.</p>
                </div>
            </div>

            {error && <p className="hc-inline-callout" role="alert">{error}</p>}

            <div className="permisos-layout">
                <ListaUsuariosPermisos usuarios={filtrados} roles={roles} seleccionadoId={usuarioId} busqueda={busqueda} rol={filtroRol} onBusquedaChange={setBusqueda} onRolChange={setFiltroRol} onSelect={seleccionarUsuario} />
                {cargando && <main className="permisos-card"><p role="status" style={{ padding: 24 }}>Cargando permisos…</p></main>}
                {!cargando && usuarioActual && <EditorPermisosUsuario usuario={usuarioActual} catalogo={catalogo} delRol={delRol} efectivos={efectivos} grupoAbierto={grupoAbierto} guardando={guardando} mensaje={mensaje} onToggleGroup={setGrupoAbierto} onTogglePermission={cambiarPermiso} onRestore={restaurarRol} onSave={guardar} onViewProfile={() => onNavigate?.('perfil')} />}
            </div>

        </section>
    );
}
