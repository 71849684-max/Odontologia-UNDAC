import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Clock3, Plus, Search } from 'lucide-react';
import { listarHistorias } from '../../servicios/registroHistoriaClinica.js';
import {
    actualizarSeguimiento,
    crearSeguimiento,
    listarHistoriasRemotas,
    listarSeguimientos,
    mensajeError,
} from '../../servicios/servicioClinico.js';
import { InputFecha, ProgressBar, StatusBadge } from '../compartidos/ControlesClinicos.jsx';
import EstadoVacio from '../../componentes/interfaz/EstadoVacio.jsx';
import { formatearFecha } from '../../utilidades/fechas.mjs';

const fechaLegible = (iso) => (iso ? formatearFecha(iso) || '—' : '—');

export default function SeguimientoApp({ tipo = 'seguimiento', rol = 'alumno', onNavigate }) {
    const esPendientes = tipo === 'pendientes';
    const [historias, setHistorias] = useState(listarHistorias);
    const [controles, setControles] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');
    const [editando, setEditando] = useState(null);
    const [nuevo, setNuevo] = useState(false);
    const [form, setForm] = useState({ historiaId: '', fecha: '', hora: '', detalle: '', estado: 'PROGRAMADO' });
    const go = (target) => (typeof onNavigate === 'function' ? onNavigate(target) : window.onNavigate?.(target));

    const refrescarAgenda = () => {
        listarSeguimientos(busqueda).then(setControles).catch(() => setControles([]));
    };

    useEffect(() => {
        let vigente = true;
        listarHistoriasRemotas()
            .then((lista) => { if (vigente) setHistorias(lista); })
            .catch(() => {});
        return () => { vigente = false; };
    }, []);

    useEffect(() => {
        if (esPendientes) return undefined;
        let vigente = true;
        const temporizador = setTimeout(() => {
            listarSeguimientos(busqueda).then((lista) => { if (vigente) setControles(lista); }).catch(() => { if (vigente) setControles([]); });
        }, busqueda ? 250 : 0);
        return () => { vigente = false; clearTimeout(temporizador); };
    }, [esPendientes, busqueda]);

    const pendientesEstado = useMemo(
        () => historias.filter((h) => h.estado === 'Pendiente de revisión' || h.estado === 'Observada'),
        [historias],
    );
    const pendientesRevision = useMemo(
        () => historias.filter((h) => Array.isArray(h.seccionesRevision) && h.seccionesRevision.length > 0
            && h.estado !== 'Pendiente de revisión' && h.estado !== 'Observada'),
        [historias],
    );
    const pendientes = useMemo(() => [...pendientesEstado, ...pendientesRevision], [pendientesEstado, pendientesRevision]);
    const validadas = historias.filter((item) => item.estado === 'Validada').length;
    const proximos = controles.filter((item) => ['Programada', 'Programado', 'Vencida', 'Vencido'].includes(item.estado)).length;

    const abrirEdicion = (control) => {
        setError('');
        setEditando(control);
        setNuevo(false);
        setForm({
            historiaId: String(control.historiaId),
            fecha: control.fecha || '',
            hora: control.hora || '',
            detalle: control.detalle || '',
            estado: control.codigoEstado || (String(control.id).startsWith('cirugia-') ? 'PROGRAMADA' : 'PROGRAMADO'),
        });
    };

    const abrirNuevo = () => {
        setError('');
        setNuevo(true);
        setEditando(null);
        setForm({
            historiaId: historias[0] ? String(historias[0].id) : '',
            fecha: new Date().toISOString().slice(0, 10),
            hora: '',
            detalle: 'Control clínico',
            estado: 'PROGRAMADO',
        });
    };

    const guardarForm = async (event) => {
        event.preventDefault();
        setError('');
        setAviso('');
        try {
            if (nuevo) {
                await crearSeguimiento(Number(form.historiaId), {
                    fecha: form.fecha,
                    hora: form.hora || null,
                    detalle: form.detalle,
                    estado: form.estado,
                });
                setAviso('Control creado.');
            } else if (editando) {
                const esCirugia = String(editando.id).startsWith('cirugia-');
                await actualizarSeguimiento(editando.id, {
                    fecha: form.fecha,
                    hora: form.hora || null,
                    detalle: form.detalle,
                    estado: esCirugia
                        ? (form.estado === 'REALIZADO' ? 'REALIZADA' : form.estado === 'CANCELADO' ? 'CANCELADA' : form.estado)
                        : form.estado,
                });
                setAviso('Seguimiento actualizado.');
            }
            setEditando(null);
            setNuevo(false);
            refrescarAgenda();
        } catch (err) {
            setError(mensajeError(err, 'No se pudo guardar el seguimiento.'));
        }
    };

    const marcar = async (control, estado) => {
        setError('');
        try {
            const esCirugia = String(control.id).startsWith('cirugia-');
            await actualizarSeguimiento(control.id, {
                estado: esCirugia
                    ? (estado === 'REALIZADO' ? 'REALIZADA' : estado === 'CANCELADO' ? 'CANCELADA' : estado)
                    : estado,
            });
            refrescarAgenda();
        } catch (err) {
            setError(mensajeError(err, 'No se pudo actualizar el estado.'));
        }
    };

    return <div className="hc-page space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <p className="hc-kicker">{esPendientes ? 'Supervisión docente' : 'Continuidad clínica'}</p>
                <h1 className="hc-page-title">{esPendientes ? 'Pendientes de revisión' : rol === 'alumno' ? 'Mis seguimientos' : 'Seguimiento'}</h1>
                <p className="hc-page-subtitle">{esPendientes
                    ? 'Historias enviadas a revisión y secciones marcadas por el alumno para evaluación docente.'
                    : 'Agenda de controles y cirugías programadas. Cree, reprogramme o marque realizados/cancelados.'}</p>
            </div>
            {!esPendientes ? <button type="button" className="hc-button hc-button--primary" onClick={abrirNuevo}><Plus size={17} /> Nuevo control</button> : null}
        </header>

        {error ? <p className="hc-form-error" role="alert">{error}</p> : null}
        {aviso ? <p className="hc-inline-callout" role="status">{aviso}</p> : null}

        {esPendientes ? <>
            <section className="hc-compact-stats" aria-label="Resumen de pendientes">
                <article><span><Clock3 size={17} /></span><strong>{pendientes.length}</strong><small>Pendientes</small></article>
                <article><span><CheckCircle2 size={17} /></span><strong>{validadas}</strong><small>Validadas</small></article>
                <article><span><CalendarClock size={17} /></span><strong>{historias.filter((item) => item.estado === 'Observada').length}</strong><small>Observadas</small></article>
            </section>
            {pendientes.length ? <div className="hc-table-card"><table className="hc-table"><thead><tr><th>Historia</th><th>Paciente</th><th>Operador</th><th>Estado</th><th>Secciones</th><th>Progreso</th><th>Acción</th></tr></thead><tbody>
                {pendientes.map((historia) => {
                    const secciones = historia.seccionesRevision ?? [];
                    const seccionDestino = secciones[0] || 'diagnostico';
                    return <tr key={historia.id}>
                        <td data-label="Historia"><strong>{historia.codigo}</strong></td>
                        <td data-label="Paciente">{historia.paciente}</td>
                        <td data-label="Operador">{historia.operador}</td>
                        <td data-label="Estado"><StatusBadge status={historia.estado} /></td>
                        <td data-label="Secciones">{secciones.length ? secciones.join(', ') : '—'}</td>
                        <td data-label="Progreso"><ProgressBar value={historia.progreso} /></td>
                        <td data-label="Acción"><button type="button" className="hc-mini-button" onClick={() => go({ view: 'historia', historiaId: historia.id, section: seccionDestino })}>Revisar</button></td>
                    </tr>;
                })}
            </tbody></table></div> : <EstadoVacio titulo="No hay historias pendientes" descripcion="Las historias o secciones enviadas a revisión aparecerán aquí." />}
        </> : <>
            <div className="hc-filterbar">
                <label className="hc-search"><Search size={17} /><span className="sr-only">Buscar seguimiento</span>
                    <input value={busqueda} maxLength={120} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por paciente o historia..." />
                </label>
                <span>{proximos} controles próximos</span>
            </div>
            {controles.length ? <div className="hc-table-card"><table className="hc-table"><thead><tr><th>Fecha</th><th>Paciente</th><th>Tipo de control</th><th>Responsable</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
                {controles.map((control) => <tr key={control.id}>
                    <td data-label="Fecha"><strong>{fechaLegible(control.fecha)}</strong>{control.hora ? <small> {control.hora}</small> : null}</td>
                    <td data-label="Paciente">{control.paciente}<small> · {control.codigo}</small></td>
                    <td data-label="Tipo de control">{control.tipo}{control.detalle ? <small> · {control.detalle}</small> : null}</td>
                    <td data-label="Responsable">{control.responsable || '—'}</td>
                    <td data-label="Estado"><StatusBadge status={control.estado} /></td>
                    <td data-label="Acciones"><div className="hc-row-actions">
                        <button type="button" className="hc-mini-button" onClick={() => go({ view: 'historia', historiaId: control.historiaId, section: control.seccion })}>Ver detalle</button>
                        <button type="button" className="hc-mini-button" onClick={() => abrirEdicion(control)}>Editar</button>
                        {!['Realizado', 'Realizada', 'Cancelado', 'Cancelada'].includes(control.estado) ? <>
                            <button type="button" className="hc-mini-button" onClick={() => marcar(control, 'REALIZADO')}>Realizado</button>
                            <button type="button" className="hc-mini-button" onClick={() => marcar(control, 'CANCELADO')}>Cancelar</button>
                        </> : null}
                    </div></td>
                </tr>)}
            </tbody></table></div> : <EstadoVacio titulo="No hay seguimientos programados" descripcion="Cree un control o registre la programación desde el consentimiento de la historia." />}
        </>}

        {(nuevo || editando) ? <div className="admin-dialogo-fondo" role="presentation" onClick={() => { setNuevo(false); setEditando(null); }}>
            <form className="admin-dialogo" role="dialog" aria-modal="true" aria-labelledby="titulo-seguimiento" onClick={(e) => e.stopPropagation()} onSubmit={guardarForm}>
                <h2 id="titulo-seguimiento">{nuevo ? 'Nuevo control' : 'Editar seguimiento'}</h2>
                {nuevo ? <label className="undac-field"><span>Historia clínica</span>
                    <select required value={form.historiaId} onChange={(e) => setForm((f) => ({ ...f, historiaId: e.target.value }))}>
                        <option value="">Seleccione</option>
                        {historias.map((h) => <option key={h.id} value={h.id}>{h.codigo} · {h.paciente}</option>)}
                    </select>
                </label> : null}
                <label className="undac-field"><span>Fecha</span><InputFecha required value={form.fecha} onChange={(fecha) => setForm((f) => ({ ...f, fecha }))} /></label>
                <label className="undac-field"><span>Hora</span><input type="time" value={form.hora} onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))} /></label>
                <label className="undac-field"><span>Detalle</span><input value={form.detalle} maxLength={255} onChange={(e) => setForm((f) => ({ ...f, detalle: e.target.value }))} /></label>
                <label className="undac-field"><span>Estado</span>
                    <select value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}>
                        {String(editando?.id || '').startsWith('cirugia-')
                            ? <><option value="PROGRAMADA">Programada</option><option value="REALIZADA">Realizada</option><option value="CANCELADA">Cancelada</option></>
                            : <><option value="PROGRAMADO">Programado</option><option value="REALIZADO">Realizado</option><option value="CANCELADO">Cancelado</option></>}
                    </select>
                </label>
                <div className="hc-form-actions">
                    <button type="button" className="hc-button hc-button--ghost" onClick={() => { setNuevo(false); setEditando(null); }}>Cancelar</button>
                    <button type="submit" className="hc-button hc-button--primary">Guardar</button>
                </div>
            </form>
        </div> : null}
    </div>;
}
