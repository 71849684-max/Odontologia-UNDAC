import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Download, Eye, Search, X } from 'lucide-react';
import { StatusBadge } from '../compartidos/ControlesClinicos.jsx';
import { etiquetaCodigoRol } from '../../configuracion/etiquetasRoles.js';
import EstadoVacio from '../../componentes/interfaz/EstadoVacio.jsx';
import useModalDialog from '../../componentes/interfaz/useModalDialog.js';
import { useSesion } from '../../autenticacion/ContextoSesion.jsx';
import { listarAuditoria } from '../../servicios/servicioAdministracion.js';
import { ErrorHttp } from '../../servicios/clienteHttp.js';
import { formatearFechaHora } from '../../utilidades/fechas.mjs';

const POR_PAGINA = 10;
const ACCIONES_ACCESO = ['INICIAR SESIÓN', 'ACCESO FALLIDO'];
const NOMBRES_MODULO = {
    historia_clinica: 'Historia clínica',
    historia_seccion_estado: 'Sección de historia',
    archivo_clinico: 'Archivo clínico',
    Seguridad: 'Seguridad',
};

function formatearFecha(valor) {
    if (!valor) return '—';
    return formatearFechaHora(valor) || valor;
}

function nombreModulo(valor) {
    if (!valor) return '—';
    return NOMBRES_MODULO[valor] ?? String(valor).replaceAll('_', ' ');
}

function textoDetalle(valor) {
    if (valor == null || valor === '') return '—';
    if (typeof valor === 'object') return JSON.stringify(valor, null, 2);
    return String(valor);
}

export default function AuditoriaApp() {
    const { esAdministrador } = useSesion();
    const [vista, setVista] = useState('sesiones');
    const [eventos, setEventos] = useState([]);
    const [accionesCatalogo, setAccionesCatalogo] = useState([]);
    const [accionesAcceso, setAccionesAcceso] = useState(ACCIONES_ACCESO);
    const [indicadores, setIndicadores] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [consulta, setConsulta] = useState('');
    const [accion, setAccion] = useState('');
    const [pagina, setPagina] = useState(1);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [detalle, setDetalle] = useState(null);
    const detalleTriggerRef = useRef(null);

    const esSesiones = vista === 'sesiones';

    useEffect(() => {
        const temporizador = setTimeout(() => setConsulta(busqueda), 250);
        return () => clearTimeout(temporizador);
    }, [busqueda]);

    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setError('');
        listarAuditoria({ q: consulta, accion, origen: vista })
            .then((respuesta) => {
                if (!vigente) return;
                setEventos((vista === 'sesiones' ? respuesta.accesos_recientes : respuesta.data) ?? []);
                setAccionesCatalogo(respuesta.acciones ?? []);
                setAccionesAcceso(respuesta.acciones_acceso?.length ? respuesta.acciones_acceso : ACCIONES_ACCESO);
                setIndicadores(respuesta.indicadores ?? null);
                setPagina(1);
            })
            .catch((err) => {
                if (!vigente) return;
                setError(err instanceof ErrorHttp ? err.message : 'No se pudo cargar la auditoría.');
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });
        return () => { vigente = false; };
    }, [consulta, accion, vista]);

    const opcionesAccion = esSesiones ? accionesAcceso : accionesCatalogo;
    const totalPaginas = Math.max(1, Math.ceil(eventos.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const desde = (paginaActual - 1) * POR_PAGINA;
    const paginaEventos = eventos.slice(desde, desde + POR_PAGINA);
    const hasta = Math.min(desde + POR_PAGINA, eventos.length);

    const vacio = useMemo(() => (
        esSesiones
            ? { titulo: 'No hay inicios de sesión', descripcion: 'Ajusta los filtros o espera a que se registren accesos al sistema.' }
            : { titulo: 'No hay acciones en historias', descripcion: 'Ajusta los filtros o realiza cambios en historias clínicas para generar trazas.' }
    ), [esSesiones]);

    function cambiarVista(siguiente) {
        if (siguiente === vista) return;
        setVista(siguiente);
        setAccion('');
        setPagina(1);
        setDetalle(null);
        setEventos([]);
        setCargando(true);
    }

    function abrirDetalle(evento, disparador) {
        if (!esAdministrador) return;
        detalleTriggerRef.current = disparador;
        setDetalle(evento);
    }

    function exportar() {
        const filas = [
            esSesiones
                ? ['Fecha', 'Usuario', 'Acción', 'IP', 'Motivo', 'Agente']
                : ['Fecha', 'Usuario', 'Acción', 'Módulo', 'Registro', 'IP'],
            ...eventos.map((item) => (
                esSesiones
                    ? [formatearFecha(item.fecha), item.usuario ?? '', item.accion ?? '', item.ip ?? '', item.motivo ?? '', item.agente ?? '']
                    : [formatearFecha(item.fecha), item.usuario ?? '', item.accion ?? '', nombreModulo(item.modulo), item.registro ?? '', item.ip ?? '']
            )),
        ];
        const csv = filas.map((fila) => fila.map((celda) => `"${String(celda).replaceAll('"', '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `auditoria-${vista}-${new Date().toISOString().slice(0, 10)}.csv`;
        enlace.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="hc-page space-y-5">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="hc-kicker">Trazabilidad</p>
                    <h1 className="hc-page-title">Auditoría del sistema</h1>
                    <p className="hc-page-subtitle">Inicios de sesión y acciones sobre historias clínicas: creación, cambios, eliminación y demás operaciones.</p>
                </div>
                <button type="button" className="hc-button hc-button--ghost" onClick={exportar} disabled={!eventos.length}>
                    <Download size={17} /> Exportar reporte
                </button>
            </header>

            <div className="permisos-modo hc-audit-tabs" role="tablist" aria-label="Tipo de auditoría">
                <button type="button" role="tab" aria-selected={esSesiones} onClick={() => cambiarVista('sesiones')}>Inicios de sesión</button>
                <button type="button" role="tab" aria-selected={!esSesiones} onClick={() => cambiarVista('acciones')}>Acciones en historias</button>
            </div>

            <section className="hc-compact-stats" aria-label="Resumen de auditoría">
                {esSesiones ? (
                    <>
                        <article><strong>{indicadores?.accesos_exitosos ?? '—'}</strong><small>Accesos (7 días)</small></article>
                        <article><strong>{indicadores?.accesos_fallidos ?? '—'}</strong><small>Fallidos (7 días)</small></article>
                    </>
                ) : (
                    <>
                        <article><strong>{indicadores?.eventos ?? '—'}</strong><small>Acciones en historias</small></article>
                        <article><strong>{indicadores?.modificaciones ?? '—'}</strong><small>Modificaciones</small></article>
                    </>
                )}
            </section>

            <div className="hc-filterbar">
                <label className="hc-search">
                    <Search size={17} />
                    <span className="sr-only">Buscar evento</span>
                    <input
                        value={busqueda}
                        onChange={(evento) => setBusqueda(evento.target.value)}
                        placeholder={esSesiones ? 'Buscar usuario o IP...' : 'Buscar usuario, historia o registro...'}
                    />
                </label>
                <label className="hc-select-filter">
                    <span>Acción</span>
                    <select value={accion} onChange={(evento) => setAccion(evento.target.value)}>
                        <option value="">Todas</option>
                        {opcionesAccion.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </label>
            </div>

            {error && <p className="hc-inline-callout" role="alert">{error}</p>}
            {cargando && <p role="status">Cargando auditoría…</p>}

            {!cargando && eventos.length === 0 && (
                <EstadoVacio titulo={vacio.titulo} descripcion={vacio.descripcion} />
            )}

            {!cargando && eventos.length > 0 && (
                <div className="hc-table-card">
                    <table className="hc-table">
                        <thead>
                            <tr>
                                <th>Fecha y hora</th>
                                <th>Usuario</th>
                                <th>Acción</th>
                                {esAdministrador ? <th><span className="sr-only">Detalle</span></th> : null}
                            </tr>
                        </thead>
                        <tbody>
                            {paginaEventos.map((evento) => (
                                <tr key={evento.id}>
                                    <td data-label="Fecha y hora">{formatearFecha(evento.fecha)}</td>
                                    <td data-label="Usuario"><strong>{evento.usuario || '—'}</strong></td>
                                    <td data-label="Acción"><StatusBadge status={evento.accion} /></td>
                                    {esAdministrador ? (
                                        <td data-label="Detalle">
                                            <button
                                                type="button"
                                                className="hc-mini-button"
                                                onClick={(click) => abrirDetalle(evento, click.currentTarget)}
                                            >
                                                <Eye size={14} /> Ver más
                                            </button>
                                        </td>
                                    ) : null}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <nav className="hc-paginacion" aria-label="Paginación de auditoría">
                        <p>
                            Mostrando {desde + 1}–{hasta} de {eventos.length}
                        </p>
                        <div className="hc-paginacion__controles">
                            <button
                                type="button"
                                className="hc-mini-button"
                                onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
                                disabled={paginaActual <= 1}
                                aria-label="Página anterior"
                            >
                                <ChevronLeft size={15} /> Anterior
                            </button>
                            <span aria-live="polite">
                                Página {paginaActual} de {totalPaginas}
                            </span>
                            <button
                                type="button"
                                className="hc-mini-button"
                                onClick={() => setPagina((actual) => Math.min(totalPaginas, actual + 1))}
                                disabled={paginaActual >= totalPaginas}
                                aria-label="Página siguiente"
                            >
                                Siguiente <ChevronRight size={15} />
                            </button>
                        </div>
                    </nav>
                </div>
            )}

            {esAdministrador && detalle && (
                <DetalleEvento
                    evento={detalle}
                    esSesion={esSesiones}
                    triggerRef={detalleTriggerRef}
                    onClose={() => setDetalle(null)}
                />
            )}
        </div>
    );
}

function DetalleEvento({ evento, esSesion, triggerRef, onClose }) {
    const dialogRef = useModalDialog(true, onClose, triggerRef);
    const filas = esSesion
        ? [
            ['Fecha y hora', formatearFecha(evento.fecha)],
            ['Usuario', evento.usuario || '—'],
            ['Acción', evento.accion || '—'],
            ['Tipo de cuenta', etiquetaCodigoRol(evento.tipo_usuario, evento.tipo_usuario || '—')],
            ['IP', evento.ip || '—'],
            ['Motivo', evento.motivo || '—'],
            ['Agente', evento.agente || '—'],
        ]
        : [
            ['Fecha y hora', formatearFecha(evento.fecha)],
            ['Usuario', evento.usuario || '—'],
            ['Acción', evento.accion || '—'],
            ['Módulo', nombreModulo(evento.modulo)],
            ['Registro', evento.registro || '—'],
            ['Tipo de usuario', etiquetaCodigoRol(evento.tipo_usuario, evento.tipo_usuario || '—')],
            ['IP', evento.ip || '—'],
            ['Agente', evento.agente || '—'],
            ['Valores anteriores', evento.valores_anteriores, true],
            ['Valores nuevos', evento.valores_nuevos, true],
        ];

    return createPortal(
        <div className="admin-dialogo-fondo" role="presentation" onClick={onClose}>
            <section
                ref={dialogRef}
                className="admin-dialogo hc-audit-detalle"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-detalle-auditoria"
                onClick={(click) => click.stopPropagation()}
            >
                <header className="admin-dialogo__cabecera">
                    <h2 id="titulo-detalle-auditoria">{esSesion ? 'Detalle del acceso' : 'Detalle de la acción'}</h2>
                    <button type="button" className="hc-mini-button" aria-label="Cerrar detalle" onClick={onClose}>
                        <X size={16} />
                    </button>
                </header>
                <dl className="permisos-ficha__datos hc-audit-detalle__datos">
                    {filas.map(([etiqueta, valor, amplio]) => {
                        const texto = textoDetalle(valor);
                        const esBloque = amplio && texto !== '—';
                        return (
                            <div key={etiqueta} className={esBloque ? 'hc-audit-detalle__ancho' : undefined}>
                                <dt>{etiqueta}</dt>
                                <dd>{esBloque ? <pre>{texto}</pre> : texto}</dd>
                            </div>
                        );
                    })}
                </dl>
                <footer className="admin-dialogo__acciones">
                    <button type="button" className="hc-button hc-button--primary" onClick={onClose}>Cerrar</button>
                </footer>
            </section>
        </div>,
        document.body,
    );
}
