import TarjetaIndicador from '../panel/TarjetaIndicador';
import AgendaSeguimientos from './AgendaSeguimientos';
import BarraFiltros from './BarraFiltros';
import BibliotecaRecursos from './BibliotecaRecursos';
import CronologiaEventos from './CronologiaEventos';
import EncabezadoModulo from './EncabezadoModulo';
import PanelConfiguracion from '../../formularios/configuracion-panel/PanelConfiguracion.jsx';
import PanelDistribucion from './PanelDistribucion';
import TablaRegistros from './TablaRegistros';

function Indicadores({ indicadores = [] }) {
    if (!indicadores.length) return null;
    return <section className="cuadricula-indicadores" aria-label="Indicadores del módulo">{indicadores.map((indicador) => <TarjetaIndicador indicador={indicador} key={indicador.id} />)}</section>;
}

export default function VistaModulo({ modulo, perfil }) {
    return (
        <main className="contenido-modulo">
            <EncabezadoModulo perfil={perfil} modulo={modulo} />
            <Indicadores indicadores={modulo.indicadores} />
            {modulo.filtros && <BarraFiltros busqueda={modulo.busqueda} filtros={modulo.filtros} />}

            {modulo.tipo === 'listado' && (
                <div className="cuadricula-modulo">
                    <section className="tarjeta-modulo tarjeta-modulo--tabla" aria-label={modulo.titulo}>
                        <div className="tarjeta-modulo__titulo"><p className="rotulo-seccion">Registros</p><h2>{modulo.tituloListado ?? 'Información registrada'}</h2></div>
                        <TablaRegistros columnas={modulo.columnas} filas={modulo.filas} />
                    </section>
                    {modulo.distribucion && <PanelDistribucion titulo={modulo.distribucion.titulo} elementos={modulo.distribucion.elementos} />}
                    {modulo.citas && <AgendaSeguimientos citas={modulo.citas} />}
                </div>
            )}

            {modulo.tipo === 'auditoria' && <div className="cuadricula-modulo"><CronologiaEventos eventos={modulo.eventos} />{modulo.distribucion && <PanelDistribucion titulo={modulo.distribucion.titulo} elementos={modulo.distribucion.elementos} />}</div>}
            {modulo.tipo === 'agenda' && <div className="cuadricula-modulo"><AgendaSeguimientos citas={modulo.citas} />{modulo.distribucion && <PanelDistribucion titulo={modulo.distribucion.titulo} elementos={modulo.distribucion.elementos} />}</div>}
            {modulo.tipo === 'configuracion' && <><div className="aviso-demostrativo">Los cambios de esta vista son únicamente demostrativos y no se guardarán.</div><PanelConfiguracion grupos={modulo.grupos} /></>}
            {modulo.tipo === 'recursos' && <BibliotecaRecursos recursos={modulo.recursos} />}
        </main>
    );
}
