import { useEffect, useState } from 'react';
import { Search, UserPlus, UsersRound, X } from 'lucide-react';
import { StatusBadge } from '../compartidos/ControlesClinicos.jsx';
import EstadoVacio from '../../componentes/interfaz/EstadoVacio.jsx';
import {
    actualizarUsuario,
    cambiarEstadoUsuario,
    crearUsuario,
    listarRoles,
    listarUsuarios,
} from '../../servicios/servicioAdministracion.js';
import { ErrorHttp } from '../../servicios/clienteHttp.js';

const FORMULARIO_VACIO = {
    nombre_usuario: '',
    contrasena: '',
    codigo_rol: 'ALUMNO_OPERADOR',
    tipo_documento: 'DNI',
    numero_documento: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    estado: true,
};

function formatearFecha(iso) {
    if (!iso) return 'Sin registros';
    try {
        return new Intl.DateTimeFormat('es-PE', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

export default function UsuariosApp() {
    const [usuarios, setUsuarios] = useState([]);
    const [indicadores, setIndicadores] = useState(null);
    const [roles, setRoles] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [rol, setRol] = useState('');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [dialogo, setDialogo] = useState(null);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [erroresFormulario, setErroresFormulario] = useState({});
    const [guardando, setGuardando] = useState(false);

    async function cargar(filtros = {}) {
        setCargando(true);
        setError('');
        try {
            const respuesta = await listarUsuarios(filtros);
            setUsuarios(respuesta.data ?? []);
            setIndicadores(respuesta.indicadores ?? null);
        } catch (err) {
            setError(err instanceof ErrorHttp ? err.message : 'No se pudieron cargar los usuarios.');
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        listarRoles().then((respuesta) => setRoles(respuesta.data ?? [])).catch(() => setRoles([]));
    }, []);

    useEffect(() => {
        const temporizador = setTimeout(() => {
            cargar({ q: busqueda, rol });
        }, busqueda || rol ? 250 : 0);
        return () => clearTimeout(temporizador);
    }, [busqueda, rol]);

    function abrirCrear() {
        setFormulario({ ...FORMULARIO_VACIO, codigo_rol: roles[0]?.codigo ?? 'ALUMNO_OPERADOR' });
        setErroresFormulario({});
        setDialogo({ modo: 'crear' });
    }

    function abrirEditar(usuario) {
        setFormulario({
            nombre_usuario: usuario.nombre_usuario ?? '',
            contrasena: '',
            codigo_rol: usuario.codigo_rol ?? 'ALUMNO_OPERADOR',
            tipo_documento: usuario.tipo_documento ?? 'DNI',
            numero_documento: usuario.numero_documento ?? '',
            nombres: usuario.nombres ?? '',
            apellidos: usuario.apellidos ?? '',
            correo: usuario.correo ?? '',
            telefono: usuario.telefono ?? '',
            estado: Boolean(usuario.estado),
        });
        setErroresFormulario({});
        setDialogo({ modo: 'editar', id: usuario.id });
    }

    function actualizarCampo(campo, valor) {
        setFormulario((actual) => ({ ...actual, [campo]: valor }));
    }

    async function guardar(evento) {
        evento.preventDefault();
        setGuardando(true);
        setErroresFormulario({});
        setError('');

        const payload = { ...formulario };
        if (dialogo?.modo === 'editar' && !payload.contrasena) delete payload.contrasena;

        try {
            if (dialogo?.modo === 'crear') await crearUsuario(payload);
            else await actualizarUsuario(dialogo.id, payload);
            setDialogo(null);
            await cargar({ q: busqueda, rol });
        } catch (err) {
            if (err instanceof ErrorHttp && Object.keys(err.errores).length) {
                setErroresFormulario(err.errores);
            } else {
                setError(err instanceof ErrorHttp ? err.message : 'No se pudo guardar el usuario.');
            }
        } finally {
            setGuardando(false);
        }
    }

    async function alternarEstado(usuario) {
        setError('');
        try {
            await cambiarEstadoUsuario(usuario.id, !usuario.estado);
            await cargar({ q: busqueda, rol });
        } catch (err) {
            setError(err instanceof ErrorHttp ? err.message : 'No se pudo cambiar el estado.');
        }
    }

    const tarjetas = [
        ['Usuarios activos', indicadores?.activos ?? '—'],
        ['Alumnos', indicadores?.alumnos ?? '—'],
        ['Docentes', indicadores?.docentes ?? '—'],
        ['Administradores', indicadores?.administradores ?? '—'],
    ];

    return (
        <div className="hc-page space-y-5">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="hc-kicker">Administración</p>
                    <h1 className="hc-page-title">Usuarios</h1>
                    <p className="hc-page-subtitle">Gestión de estudiantes, docentes y personal administrativo de la clínica.</p>
                </div>
                <button type="button" className="hc-button hc-button--primary" onClick={abrirCrear}>
                    <UserPlus size={17} /> Registrar usuario
                </button>
            </header>

            <section className="hc-compact-stats" aria-label="Resumen de usuarios">
                {tarjetas.map(([etiqueta, valor]) => (
                    <article key={etiqueta}>
                        <span><UsersRound size={17} /></span>
                        <strong>{valor}</strong>
                        <small>{etiqueta}</small>
                    </article>
                ))}
            </section>

            <div className="hc-filterbar">
                <label className="hc-search">
                    <Search size={17} />
                    <span className="sr-only">Buscar usuario</span>
                    <input
                        value={busqueda}
                        onChange={(evento) => setBusqueda(evento.target.value)}
                        placeholder="Buscar por nombre, documento o usuario..."
                    />
                </label>
                <label className="hc-select-filter">
                    <span>Rol</span>
                    <select value={rol} onChange={(evento) => setRol(evento.target.value)}>
                        <option value="">Todos</option>
                        {roles.map((item) => (
                            <option key={item.codigo} value={item.codigo}>{item.nombre}</option>
                        ))}
                    </select>
                </label>
            </div>

            {error && <p className="hc-inline-callout" role="alert">{error}</p>}
            {cargando && <p role="status">Cargando usuarios…</p>}

            {!cargando && usuarios.length === 0 && (
                <EstadoVacio titulo="No se encontraron usuarios" descripcion="Prueba con otros términos o elimina el filtro de rol." />
            )}

            {!cargando && usuarios.length > 0 && (
                <div className="hc-table-card">
                    <table className="hc-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Documento</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Último acceso</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((item) => (
                                <tr key={item.id}>
                                    <td data-label="Usuario">
                                        <div className="hc-person">
                                            <span className="hc-avatar">
                                                {(item.nombre || item.nombre_usuario).split(' ').slice(0, 2).map((parte) => parte[0]).join('')}
                                            </span>
                                            <span>
                                                <strong>{item.nombre}</strong>
                                                <small>{item.nombre_usuario}</small>
                                            </span>
                                        </div>
                                    </td>
                                    <td data-label="Documento">{item.numero_documento || '—'}</td>
                                    <td data-label="Rol">{item.rol || 'Sin rol'}</td>
                                    <td data-label="Estado">
                                        <StatusBadge status={item.bloqueado ? 'Bloqueado' : item.estado ? 'Activo' : 'Inactivo'} />
                                    </td>
                                    <td data-label="Último acceso">{formatearFecha(item.ultimo_inicio_sesion)}</td>
                                    <td data-label="Acciones">
                                        <div className="flex gap-2 flex-wrap">
                                            <button type="button" className="hc-mini-button" onClick={() => abrirEditar(item)}>Editar</button>
                                            <button type="button" className="hc-mini-button" onClick={() => alternarEstado(item)}>
                                                {item.estado ? 'Desactivar' : 'Activar'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {dialogo && (
                <div className="admin-dialogo-fondo" role="presentation" onClick={() => !guardando && setDialogo(null)}>
                    <form
                        className="admin-dialogo"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-usuario-dialogo"
                        onClick={(evento) => evento.stopPropagation()}
                        onSubmit={guardar}
                    >
                        <header className="admin-dialogo__cabecera">
                            <h2 id="titulo-usuario-dialogo">{dialogo.modo === 'crear' ? 'Registrar usuario' : 'Editar usuario'}</h2>
                            <button type="button" className="hc-mini-button" onClick={() => setDialogo(null)} aria-label="Cerrar" disabled={guardando}>
                                <X size={16} />
                            </button>
                        </header>

                        <div className="admin-dialogo__grid">
                            {[
                                ['nombres', 'Nombres', 'text'],
                                ['apellidos', 'Apellidos', 'text'],
                                ['tipo_documento', 'Tipo de documento', 'text'],
                                ['numero_documento', 'Número de documento', 'text'],
                                ['nombre_usuario', 'Correo institucional', 'text'],
                                ['contrasena', dialogo.modo === 'crear' ? 'Contraseña' : 'Nueva contraseña (opcional)', 'password'],
                                ['correo', 'Correo', 'email'],
                                ['telefono', 'Teléfono', 'text'],
                            ].map(([campo, etiqueta, tipo]) => (
                                <label key={campo}>
                                    <span>{etiqueta}</span>
                                    <input
                                        type={tipo}
                                        value={formulario[campo]}
                                        onChange={(evento) => actualizarCampo(campo, evento.target.value)}
                                        required={campo !== 'correo' && campo !== 'telefono' && !(campo === 'contrasena' && dialogo.modo === 'editar')}
                                    />
                                    {erroresFormulario[campo] && <small className="admin-error">{erroresFormulario[campo][0]}</small>}
                                </label>
                            ))}

                            <label>
                                <span>Rol</span>
                                <select value={formulario.codigo_rol} onChange={(evento) => actualizarCampo('codigo_rol', evento.target.value)} required>
                                    {roles.map((item) => (
                                        <option key={item.codigo} value={item.codigo}>{item.nombre}</option>
                                    ))}
                                </select>
                                {erroresFormulario.codigo_rol && <small className="admin-error">{erroresFormulario.codigo_rol[0]}</small>}
                            </label>

                            <label className="admin-check">
                                <input
                                    type="checkbox"
                                    checked={formulario.estado}
                                    onChange={(evento) => actualizarCampo('estado', evento.target.checked)}
                                />
                                <span>Cuenta activa</span>
                            </label>
                        </div>

                        <footer className="admin-dialogo__acciones">
                            <button type="button" className="hc-button hc-button--ghost" onClick={() => setDialogo(null)} disabled={guardando}>Cancelar</button>
                            <button type="submit" className="hc-button hc-button--primary" disabled={guardando}>
                                {guardando ? 'Guardando…' : 'Guardar'}
                            </button>
                        </footer>
                    </form>
                </div>
            )}
        </div>
    );
}
