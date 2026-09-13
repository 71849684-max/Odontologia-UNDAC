import { useEffect, useState } from 'react';
import { Building2, Check, LockKeyhole, Save, Settings2, Stethoscope } from 'lucide-react';
import { guardarConfiguracion, listarConfiguracion } from '../../servicios/servicioAdministracion.js';
import { ErrorHttp } from '../../servicios/clienteHttp.js';

const ICONOS = {
    NOMBRE_INSTITUCION: Building2,
    FACULTAD: Building2,
    ELIMINACION_CLINICA_PERMITIDA: LockKeyhole,
    TIPO_DENTICION_POR_DEFECTO: Stethoscope,
};

export default function ConfiguracionApp() {
    const [parametros, setParametros] = useState([]);
    const [valores, setValores] = useState({});
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [guardado, setGuardado] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            setCargando(true);
            setError('');
            try {
                const respuesta = await listarConfiguracion();
                const data = respuesta.data ?? [];
                setParametros(data);
                setValores(Object.fromEntries(data.map((item) => [item.codigo, item.valor])));
            } catch (err) {
                setError(err instanceof ErrorHttp ? err.message : 'No se pudo cargar la configuración.');
            } finally {
                setCargando(false);
            }
        })();
    }, []);

    function actualizar(codigo, valor) {
        setGuardado(false);
        setValores((actuales) => ({ ...actuales, [codigo]: valor }));
    }

    async function guardar() {
        setGuardando(true);
        setError('');
        try {
            const normalizados = Object.fromEntries(
                parametros.map((item) => {
                    const valor = valores[item.codigo];
                    if (item.tipo === 'BOOLEANO') return [item.codigo, valor ? '1' : '0'];
                    return [item.codigo, valor == null ? '' : String(valor)];
                }),
            );
            const respuesta = await guardarConfiguracion(normalizados);
            const data = respuesta.data ?? [];
            setParametros(data);
            setValores(Object.fromEntries(data.map((item) => [item.codigo, item.valor])));
            setGuardado(true);
        } catch (err) {
            setError(err instanceof ErrorHttp ? err.message : 'No se pudo guardar la configuración.');
        } finally {
            setGuardando(false);
        }
    }

    return (
        <div className="hc-page space-y-5">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="hc-kicker">Sistema</p>
                    <h1 className="hc-page-title">Configuración</h1>
                    <p className="hc-page-subtitle">Parámetros institucionales de la clínica odontológica UNDAC.</p>
                </div>
                <button type="button" className="hc-button hc-button--primary" onClick={guardar} disabled={guardando || cargando}>
                    {guardado ? <Check size={17} /> : <Save size={17} />}
                    {guardando ? 'Guardando…' : guardado ? 'Cambios guardados' : 'Guardar configuración'}
                </button>
            </header>

            <div className="hc-inline-callout">
                <span><Settings2 size={20} /></span>
                <div>
                    <strong>Parámetros del sistema</strong>
                    <small>Los valores se persisten en la base de datos y quedan auditados.</small>
                </div>
            </div>

            {error && <p className="hc-inline-callout" role="alert">{error}</p>}
            {cargando && <p role="status">Cargando configuración…</p>}

            {!cargando && (
                <section className="hc-settings-grid">
                    {parametros.map((item) => {
                        const Icono = ICONOS[item.codigo] ?? Settings2;
                        return (
                            <article className="hc-panel-card hc-settings-card" key={item.codigo}>
                                <div className="hc-settings-card__title">
                                    <span><Icono size={19} /></span>
                                    <div>
                                        <h2>{item.nombre}</h2>
                                        <p>{item.descripcion || item.codigo}</p>
                                    </div>
                                </div>
                                {item.tipo === 'BOOLEANO' ? (
                                    <div className="hc-toggle-list">
                                        <label>
                                            <span>
                                                <strong>{item.nombre}</strong>
                                                <small>{item.descripcion}</small>
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={Boolean(valores[item.codigo])}
                                                onChange={(evento) => actualizar(item.codigo, evento.target.checked)}
                                            />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="hc-settings-fields">
                                        <label>
                                            Valor
                                            <input
                                                value={valores[item.codigo] ?? ''}
                                                onChange={(evento) => actualizar(item.codigo, evento.target.value)}
                                            />
                                        </label>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </section>
            )}
        </div>
    );
}
