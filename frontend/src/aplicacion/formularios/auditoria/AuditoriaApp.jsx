import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import { StatusBadge } from '../compartidos/ControlesClinicos.jsx';
import EstadoVacio from '../../componentes/interfaz/EstadoVacio.jsx';
import { listarAuditoria } from '../../servicios/servicioAdministracion.js';
import { ErrorHttp } from '../../servicios/clienteHttp.js';

const POR_PAGINA = 10;

function formatearFecha(valor) {
    if (!valor) return '—';
    try {
        return new Intl.DateTimeFormat('es-PE', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(valor));
    } catch {
        return valor;
    }
}

export default function AuditoriaApp() {
    const [eventos, setEventos] = useState([]);
    const [accesos, setAccesos] = useState([]);
    const [acciones, setAcciones] = useState([]);
    const [indicadores, setIndicadores] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [accion, setAccion] = useState('');
    const [pagina, setPagina] = useState(1);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const temporizador = setTimeout(async () => {
            setCargando(true);
            setError('');
            try {
                const respuesta = await listarAuditoria({ q: busqueda, accion });
                setEventos(respuesta.data ?? []);
                setAccesos(respuesta.accesos_recientes ?? []);
                setAcciones(respuesta.acciones ?? []);
                setIndicadores(respuesta.indicadores ?? null);
                setPagina(1);
            } catch (err) {
                setError(err instanceof ErrorHttp ? err.message : 'No se pudo cargar la auditoría.');
            } finally {
                setCargando(false);
            }
        }, 250);
        return () => clearTimeout(temporizador);
    }, [busqueda, accion]);

    const combinados = useMemo(() => {
        const base = accion && !['INICIAR SESIÓN', 'ACCESO FALLIDO'].includes(accion)
            ? eventos
            : [...eventos, ...accesos.filter((item) => !accion || item.accion === accion)];

        return [...base].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    }, [eventos, accesos, accion]);

    const totalPaginas = Math.max(1, Math.ceil(combinados.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const desde = (paginaActual - 1) * POR_PAGINA;
    const paginaEventos = combinados.slice(desde, desde + POR_PAGINA);
    const hasta = Math.min(desde + POR_PAGINA, combinados.length);
    function exportar() {
        const filas = [
            ['Fecha', 'Usuario', 'Acción', 'Módulo', 'Registro', 'IP'],
            ...combinados.map((item) => [
                formatearFecha(item.fecha),
                item.usuario ?? '',
                item.accion ?? '',
                item.modulo ?? '',
                item.registro ?? '',
                item.ip ?? '',
            ]),
        ];
        const csv = filas.map((fila) => fila.map((celda) => `"${String(celda).replaceAll('"', '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
        enlace.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="hc-page space-y-5">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="hc-kicker">Trazabilidad</p>
                    <h1 className="hc-page-title">Auditoría del sistema</h1>
                    <p className="hc-page-subtitle">Bitácora de accesos y operaciones sensibles realizadas en la plataforma.</p>
                </div>
                <button type="button" className="hc-button hc-button--ghost" onClick={exportar} disabled={!combinados.length}>
                    <Download size={17} /> Exportar reporte
                </button>
            </header>

            <section className="hc-compact-stats" aria-label="Resumen de auditoría">
                <article><strong>{indicadores?.eventos ?? '—'}</strong><small>Eventos registrados</small></article>
                <article><strong>{indicadores?.modificaciones ?? '—'}</strong><small>Modificaciones</small></article>
                <article><strong>{indicadores?.accesos_exitosos ?? '—'}</strong><small>Accesos (7 días)</small></article>
                <article><strong>{indicadores?.accesos_fallidos ?? '—'}</strong><small>Fallidos (7 días)</small></article>
            </section>

            <div className="hc-filterbar">
                <label className="hc-search">
                    <Search size={17} />
                    <span className="sr-only">Buscar evento</span>
                    <input
                        value={busqueda}
                        onChange={(evento) => setBusqueda(evento.target.value)}
                        placeholder="Buscar usuario, módulo o registro..."
                    />
                </label>
                <label className="hc-select-filter">
                    <span>Acción</span>
                    <select value={accion} onChange={(evento) => setAccion(evento.target.value)}>
                        <option value="">Todas</option>
                        {[...new Set([...acciones, 'INICIAR SESIÓN', 'ACCESO FALLIDO'])].map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </label>
            </div>

            {error && <p className="hc-inline-callout" role="alert">{error}</p>}
            {cargando && <p role="status">Cargando auditoría…</p>}

            {!cargando && combinados.length === 0 && (
                <EstadoVacio titulo="No hay eventos para mostrar" descripcion="Ajusta los filtros o realiza operaciones administrativas para generar trazas." />
            )}

            {!cargando && combinados.length > 0 && (
                <div className="hc-table-card">
                    <table className="hc-table">
                        <thead>
                            <tr>
                                <th>Fecha y hora</th>
                                <th>Usuario</th>
                                <th>Acción</th>
                                <th>Módulo</th>
                                <th>Registro</th>
                                <th>IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginaEventos.map((evento) => (
                                <tr key={evento.id}>
                                    <td data-label="Fecha y hora">{formatearFecha(evento.fecha)}</td>
                                    <td data-label="Usuario"><strong>{evento.usuario || '—'}</strong></td>
                                    <td data-label="Acción"><StatusBadge status={evento.accion} /></td>
                                    <td data-label="Módulo">{evento.modulo}</td>
                                    <td data-label="Registro">{evento.registro}</td>
                                    <td data-label="IP">{evento.ip || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <nav className="hc-paginacion" aria-label="Paginación de auditoría">
                        <p>
                            Mostrando {desde + 1}–{hasta} de {combinados.length}
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
        </div>
    );
}
