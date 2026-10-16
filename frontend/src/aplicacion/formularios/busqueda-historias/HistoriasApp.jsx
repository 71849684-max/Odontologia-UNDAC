import { useEffect, useMemo, useState } from 'react';
import { ClipboardPlus, Filter, Search, X } from 'lucide-react';
import { listarHistorias } from '../../servicios/registroHistoriaClinica.js';
import { cambiarEstadoHistoria, listarHistoriasRemotas, mensajeError } from '../../servicios/servicioClinico.js';
import { ProgressBar, StatusBadge } from '../compartidos/ControlesClinicos.jsx';
import EstadoVacio from '../../componentes/interfaz/EstadoVacio.jsx';

const CODIGO_ESTADO = {
    Borrador: 'BORRADOR',
    'En proceso': 'EN_PROCESO',
    'Pendiente de revisión': 'PENDIENTE_REVISION',
    Observada: 'OBSERVADA',
    Validada: 'VALIDADA',
};

/** Acciones disponibles según el estado actual; el backend vuelve a validar cada transición. */
export function accionesDeEstado(historia, rol) {
    const codigo = historia.codigoEstado;
    if (!codigo) return [];
    const supervisa = rol === 'docente' || rol === 'administrador';
    const acciones = [];
    if (['BORRADOR', 'EN_PROCESO', 'OBSERVADA'].includes(codigo)) {
        acciones.push({ codigo: 'PENDIENTE_REVISION', etiqueta: 'Enviar a revisión' });
    }
    if (codigo === 'PENDIENTE_REVISION' && supervisa) {
        acciones.push({ codigo: 'VALIDADA', etiqueta: 'Validar' });
        acciones.push({ codigo: 'OBSERVADA', etiqueta: 'Observar', requiereObservacion: true });
    }
    if (codigo === 'PENDIENTE_REVISION' && !supervisa) {
        acciones.push({ codigo: 'EN_PROCESO', etiqueta: 'Retomar edición' });
    }
    return acciones;
}

export default function HistoriasApp({ rol, onNavigate }) {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('');
    const [historias, setHistorias] = useState(listarHistorias);
    const [usaApi, setUsaApi] = useState(false);
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');
    const [observando, setObservando] = useState(null);
    const [enviando, setEnviando] = useState(false);
    useEffect(() => {
        let vigente = true;
        listarHistoriasRemotas().then((lista) => { if (vigente) { setHistorias(lista); setUsaApi(true); } }).catch(() => {});
        return () => { vigente = false; };
    }, []);
    useEffect(() => {
        if (!usaApi) return undefined;
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
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="hc-kicker">Gestión clínica</p><h1 className="hc-page-title">Historias clínicas</h1><p className="hc-page-subtitle">Seguimiento de historias para el perfil {rol === 'alumno' ? 'alumno operador' : rol}: borradores, revisión docente, observaciones y validación.</p></div>{rol !== 'docente' && <button type="button" className="hc-button hc-button--primary" onClick={() => go('nueva-historia')}><ClipboardPlus size={17} /> Nueva historia clínica</button>}</header>
        <section className="hc-compact-stats" aria-label="Resumen de historias">{indicadores.map(([etiqueta, valor]) => <article key={etiqueta}><strong>{valor}</strong><small>{etiqueta}</small></article>)}</section>
        <div className="hc-filterbar"><label className="hc-search"><Search size={17} /><span className="sr-only">Buscar historia clínica</span><input value={query} maxLength={120} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar paciente, historia, alumno o docente..." /></label><label className="hc-select-filter"><Filter size={16} /><span className="sr-only">Filtrar por estado</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos los estados</option>{Object.keys(CODIGO_ESTADO).map((item) => <option key={item}>{item}</option>)}</select></label></div>
        {error && <p className="hc-form-error" role="alert">{error}</p>}
        {aviso && <p className="hc-inline-callout" role="status">{aviso}</p>}
        {filtered.length ? <div className="hc-table-card"><table className="hc-table"><thead><tr><th>N.º historia</th><th>Paciente</th><th>Operador</th><th>Docente</th><th>Progreso</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>{filtered.map((history) => <tr key={history.id}><td data-label="N.º historia"><strong>{history.codigo}</strong></td><td data-label="Paciente"><div className="hc-person"><span className="hc-avatar">{history.paciente.split(' ').slice(0, 2).map((p) => p[0]).join('')}</span><span><strong>{history.paciente}</strong><small>DNI {history.dni}</small></span></div></td><td data-label="Operador">{history.operador}</td><td data-label="Docente">{history.docente}</td><td data-label="Progreso"><ProgressBar value={history.progreso} /></td><td data-label="Estado"><StatusBadge status={history.estado} /></td><td data-label="Fecha">{history.fecha}</td><td data-label="Acciones"><div className="hc-row-actions"><button className="hc-mini-button" type="button" onClick={() => go({ view: 'historia', historiaId: history.id, section: 'datos-paciente' })}>Abrir</button>{accionesDeEstado(history, rol).map((accion) => <button key={accion.codigo} className="hc-mini-button" type="button" disabled={enviando} aria-label={`${accion.etiqueta} ${history.codigo}`} onClick={() => elegir(history, accion)}>{accion.etiqueta}</button>)}</div></td></tr>)}</tbody></table></div> : <EstadoVacio titulo="No hay historias para mostrar" descripcion="Ajusta la búsqueda o selecciona otro estado." />}
        {observando && <div className="admin-dialogo-fondo" role="presentation" onClick={() => !enviando && setObservando(null)}>
            <form className="admin-dialogo" role="dialog" aria-modal="true" aria-labelledby="titulo-observar" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); if (observando.texto.trim()) ejecutar(observando.historia, observando.accion, observando.texto.trim()); }}>
                <header className="admin-dialogo__cabecera"><h2 id="titulo-observar">Observar {observando.historia.codigo}</h2><button type="button" className="hc-mini-button" aria-label="Cerrar" disabled={enviando} onClick={() => setObservando(null)}><X size={16} /></button></header>
                <label className="undac-field"><span>Observación para el alumno</span><textarea required maxLength={500} rows={4} value={observando.texto} onChange={(e) => setObservando((actual) => ({ ...actual, texto: e.target.value }))} /></label>
                <footer className="admin-dialogo__acciones"><button type="button" className="hc-button hc-button--ghost" disabled={enviando} onClick={() => setObservando(null)}>Cancelar</button><button type="submit" className="hc-button hc-button--primary" disabled={enviando || !observando.texto.trim()}>Registrar observación</button></footer>
            </form>
        </div>}
    </div>;
}
