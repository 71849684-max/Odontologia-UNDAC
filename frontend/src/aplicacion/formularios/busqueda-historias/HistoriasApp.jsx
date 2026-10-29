import { useEffect, useMemo, useState } from 'react';
import { Filter, Plus, Search, X } from 'lucide-react';
import { listarHistorias } from '../../servicios/registroHistoriaClinica.js';
import { listarConfiguracion } from '../../servicios/servicioAdministracion.js';
import { cambiarEstadoHistoria, idHistoria, listarHistoriasRemotas, mensajeError } from '../../servicios/servicioClinico.js';
import BotonEliminacionClinica from './BotonEliminacionClinica.jsx';
import { ProgressBar, StatusBadge } from '../compartidos/ControlesClinicos.jsx';
import EstadoVacio from '../../componentes/interfaz/EstadoVacio.jsx';
import Paginacion from '../../componentes/interfaz/Paginacion.jsx';
import NuevaHistoriaModal from '../nueva-historia/NuevaHistoriaModal.jsx';
import { formatearFecha, formatearFechaHora } from '../../utilidades/fechas.mjs';

const CODIGO_ESTADO = {
    Borrador: 'BORRADOR',
    'En proceso': 'EN_PROCESO',
    'Pendiente de revisión': 'PENDIENTE_REVISION',
    Observada: 'OBSERVADA',
    Validada: 'VALIDADA',
};

const PERFIL_CLINICO = {
    alumno: 'asistente',
    docente: 'profesional encargado',
    administrador: 'administrador',
};

/** Acciones disponibles según el estado actual; el backend vuelve a validar cada transición. */
export function accionesDeEstado(historia, rol) {
    const codigo = historia.codigoEstado;
    if (!codigo) return [];
    const esAlumno = rol === 'alumno';
    const esDocente = rol === 'docente';
    const esAdmin = rol === 'administrador';
    const acciones = [];
    if ((esAlumno || esAdmin) && ['BORRADOR', 'EN_PROCESO', 'OBSERVADA'].includes(codigo)) {
        acciones.push({ codigo: 'PENDIENTE_REVISION', etiqueta: 'Enviar a revisión' });
    }
    if ((esDocente || esAdmin) && codigo === 'PENDIENTE_REVISION') {
        acciones.push({ codigo: 'VALIDADA', etiqueta: 'Validar' });
        acciones.push({ codigo: 'OBSERVADA', etiqueta: 'Observar', requiereObservacion: true });
    }
    if ((esAlumno || esAdmin) && codigo === 'PENDIENTE_REVISION') {
        acciones.push({ codigo: 'EN_PROCESO', etiqueta: 'Retomar edición' });
    }
    return acciones;
}

export function puedeVerObservacion(historia, rol) {
    const rolesPermitidos = ['alumno', 'docente', 'administrador'];
    if (!rolesPermitidos.includes(rol)) return false;
    if (historia?.codigoEstado === 'VALIDADA' || historia?.estado === 'Validada') return false;
    if (Array.isArray(historia?.observaciones) && historia.observaciones.length > 0) return true;
    return Boolean(String(historia?.observacion ?? '').trim());
}

export function formatearFechaObservacion(fecha) {
    if (!fecha) return '—';
    return formatearFechaHora(fecha) || '—';
}

export function observacionesDeHistoria(historia) {
    if (Array.isArray(historia?.observaciones) && historia.observaciones.length > 0) {
        return historia.observaciones;
    }
    const texto = String(historia?.observacion ?? '').trim();
    return texto ? [{ id: 'unica', texto, fecha: null }] : [];
}

export default function HistoriasApp({ rol, onNavigate, pacienteInicial = null, abrirNueva = false }) {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('');
    const [historias, setHistorias] = useState(listarHistorias);
    // null = comprobando conexión; true = API disponible; false = modo local confirmado
    const [usaApi, setUsaApi] = useState(null);
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');
    const [observando, setObservando] = useState(null);
    const [viendoObservacion, setViendoObservacion] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [modalNueva, setModalNueva] = useState(Boolean(abrirNueva || pacienteInicial));
    const [eliminacionActiva, setEliminacionActiva] = useState(false);
    const [pacienteModal, setPacienteModal] = useState(pacienteInicial);
    useEffect(() => {
        if (abrirNueva || pacienteInicial) {
            setPacienteModal(pacienteInicial);
            setModalNueva(true);
        }
    }, [abrirNueva, pacienteInicial]);
    useEffect(() => {
        if (rol !== 'administrador') return undefined;
        let vigente = true;
        listarConfiguracion()
            .then((respuesta) => {
                const item = (respuesta.data ?? []).find((parametro) => parametro.codigo === 'ELIMINACION_CLINICA_PERMITIDA');
                if (vigente) setEliminacionActiva(Boolean(item?.valor));
            })
            .catch(() => { if (vigente) setEliminacionActiva(false); });
        return () => { vigente = false; };
    }, [rol]);
    useEffect(() => {
        let vigente = true;
        listarHistoriasRemotas()
            .then((lista) => { if (vigente) { setHistorias(lista); setUsaApi(true); } })
            .catch(() => { if (vigente) setUsaApi(false); });
        return () => { vigente = false; };
    }, []);
    useEffect(() => {
        if (usaApi !== true) return undefined;
        let vigente = true;
        const temporizador = setTimeout(() => {
            listarHistoriasRemotas({ q: query, estado: CODIGO_ESTADO[status] })
                .then((lista) => { if (vigente) setHistorias(lista); })
                .catch(() => {});
        }, 250);
        return () => { vigente = false; clearTimeout(temporizador); };
    }, [usaApi, query, status]);
    const filtered = useMemo(() => historias.filter((item) => (!status || item.estado === status) && `${item.paciente} ${item.codigo} ${item.dni} ${item.operador} ${item.docente}`.toLowerCase().includes(query.toLowerCase())), [historias, query, status]);
    const go = (target) => typeof onNavigate === 'function' ? onNavigate(target) : window.onNavigate?.(target);
    const indicadores = [
        ['Total', historias.length],
        ['En proceso', historias.filter((item) => ['Borrador', 'En proceso'].includes(item.estado)).length],
        ['Pendientes', historias.filter((item) => item.estado === 'Pendiente de revisión').length],
        ['Finalizadas', historias.filter((item) => item.estado === 'Validada').length],
    ];

    async function ejecutar(historia, accion, observacion) {
        setError('');
        setAviso('');
        setEnviando(true);
        try {
            const actualizada = await cambiarEstadoHistoria(historia.id, accion.codigo, observacion);
            setHistorias((lista) => lista.map((item) => (item.id === historia.id ? { ...item, ...actualizada } : item)));
            setAviso(`${historia.codigo}: ${actualizada?.estado ?? accion.etiqueta}`);
            setObservando(null);
        } catch (err) {
            setError(mensajeError(err, 'No se pudo cambiar el estado de la historia.'));
        } finally {
            setEnviando(false);
        }
    }

    function elegir(historia, accion) {
        if (accion.requiereObservacion) {
            setObservando({ historia, accion, texto: '' });
            return;
        }
        ejecutar(historia, accion);
    }

    return <div className="hc-page space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <p className="hc-kicker">Gestión clínica</p>
                <h1 className="hc-page-title">Historias clínicas</h1>
                <p className="hc-page-subtitle">Seguimiento de historias para el perfil {PERFIL_CLINICO[rol] ?? rol}: borradores, revisión clínica, observaciones y validación.</p>
            </div>
            <button type="button" className="hc-button hc-button--primary" onClick={() => { setPacienteModal(null); setModalNueva(true); }}>
                <Plus size={17} /> Nueva historia clínica
            </button>
        </header>
        <section className="hc-compact-stats" aria-label="Resumen de historias">{indicadores.map(([etiqueta, valor]) => <article key={etiqueta}><strong>{valor}</strong><small>{etiqueta}</small></article>)}</section>
        <div className="hc-filterbar"><label className="hc-search"><Search size={17} /><span className="sr-only">Buscar historia clínica</span><input value={query} maxLength={120} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar paciente, historia, asistente o profesional encargado..." /></label><label className="hc-select-filter"><Filter size={16} /><span className="sr-only">Filtrar por estado</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos los estados</option>{Object.keys(CODIGO_ESTADO).map((item) => <option key={item}>{item}</option>)}</select></label></div>
        {error && <p className="hc-form-error" role="alert">{error}</p>}
        {aviso && <p className="hc-inline-callout" role="status">{aviso}</p>}
        {filtered.length ? <div><Paginacion key={`${query}|${status}`} elementos={filtered} tamanos={[10]} inicial={10} etiqueta="historias">{(visibles) => <div className="hc-table-card"><table className="hc-table">
            <thead><tr><th>N.º historia</th><th>Paciente</th><th>Asistente responsable</th><th>Profesional encargado</th><th>Progreso</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
            <tbody>{visibles.map((history) => <tr key={history.id}>
                <td data-label="N.º historia"><strong>{history.codigo}</strong></td>
                <td data-label="Paciente"><div className="hc-person"><span className="hc-avatar">{history.paciente.split(' ').slice(0, 2).map((p) => p[0]).join('')}</span><span><strong>{history.paciente}</strong><small>DNI {history.dni}</small></span></div></td>
                <td data-label="Asistente responsable">{history.operador}</td>
                <td data-label="Profesional encargado">{history.docente}</td>
                <td data-label="Progreso"><ProgressBar value={history.progreso} /></td>
                <td data-label="Estado"><StatusBadge status={history.estado} /></td>
                <td data-label="Fecha">{formatearFecha(history.fecha) || '—'}</td>
                <td data-label="Acciones"><div className="hc-row-actions">
                    <button className="hc-mini-button" type="button" onClick={() => go({ view: 'historia', historiaId: history.id, section: 'datos-paciente' })}>Abrir</button>
                    {puedeVerObservacion(history, rol) ? <button className="hc-mini-button" type="button" aria-label={`Ver observación ${history.codigo}`} onClick={() => setViendoObservacion(history)}>Ver observación</button> : null}
                    {accionesDeEstado(history, rol).map((accion) => <button key={accion.codigo} className="hc-mini-button" type="button" disabled={enviando} aria-label={`${accion.etiqueta} ${history.codigo}`} onClick={() => elegir(history, accion)}>{accion.etiqueta}</button>)}
                    {rol === 'administrador' && eliminacionActiva && idHistoria(history.id) ? <BotonEliminacionClinica historiaId={idHistoria(history.id)} codigo={history.codigo} onInactivada={() => setHistorias((lista) => lista.filter((item) => item.id !== history.id))} /> : null}
                </div></td>
            </tr>)}</tbody>
        </table></div>}</Paginacion></div> : <EstadoVacio titulo="No hay historias para mostrar" descripcion="Ajusta la búsqueda o selecciona otro estado." />}
        {observando && <div className="admin-dialogo-fondo" role="presentation" onClick={() => !enviando && setObservando(null)}>
            <form className="admin-dialogo" role="dialog" aria-modal="true" aria-labelledby="titulo-observar" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); if (observando.texto.trim()) ejecutar(observando.historia, observando.accion, observando.texto.trim()); }}>
                <header className="admin-dialogo__cabecera"><h2 id="titulo-observar">Observar {observando.historia.codigo}</h2><button type="button" className="hc-mini-button" aria-label="Cerrar" disabled={enviando} onClick={() => setObservando(null)}><X size={16} /></button></header>
                <label className="undac-field"><span>Observación clínica para el asistente</span><textarea required maxLength={500} rows={4} value={observando.texto} onChange={(e) => setObservando((actual) => ({ ...actual, texto: e.target.value }))} /></label>
                <footer className="admin-dialogo__acciones"><button type="button" className="hc-button hc-button--ghost" disabled={enviando} onClick={() => setObservando(null)}>Cancelar</button><button type="submit" className="hc-button hc-button--primary" disabled={enviando || !observando.texto.trim()}>Registrar observación</button></footer>
            </form>
        </div>}
        {viendoObservacion && <div className="admin-dialogo-fondo" role="presentation" onClick={() => setViendoObservacion(null)}>
            <div className="admin-dialogo" role="dialog" aria-modal="true" aria-labelledby="titulo-ver-observacion" onClick={(e) => e.stopPropagation()}>
                <header className="admin-dialogo__cabecera"><h2 id="titulo-ver-observacion">Observaciones · {viendoObservacion.codigo}</h2><button type="button" className="hc-mini-button" aria-label="Cerrar" onClick={() => setViendoObservacion(null)}><X size={16} /></button></header>
                <ul className="hc-obs-dialogo__lista">
                    {observacionesDeHistoria(viendoObservacion).map((obs) => (
                        <li key={obs.id} className="hc-obs-dialogo__item">
                            <div className="hc-obs-dialogo__meta">
                                {obs.docente ? <span>{obs.docente}</span> : <span />}
                                <time dateTime={obs.fecha || undefined}>{formatearFechaObservacion(obs.fecha)}</time>
                            </div>
                            <p>{obs.texto}</p>
                        </li>
                    ))}
                </ul>
                <footer className="admin-dialogo__acciones"><button type="button" className="hc-button hc-button--primary" onClick={() => setViendoObservacion(null)}>Entendido</button></footer>
            </div>
        </div>}
        <NuevaHistoriaModal
            open={modalNueva}
            pacienteInicial={pacienteModal}
            onClose={() => { setModalNueva(false); setPacienteModal(null); }}
            onCreated={(historia) => {
                setHistorias((lista) => [historia, ...lista.filter((item) => item.id !== historia.id)]);
                setAviso(`${historia.codigo}: historia creada`);
                go({ view: 'historia', historiaId: historia.id, section: 'datos-paciente' });
            }}
        />
    </div>;
}
