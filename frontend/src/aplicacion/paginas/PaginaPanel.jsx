import { useEffect, useState } from 'react';
import VistaModulo from '../componentes/modulos/VistaModulo';
import AccionesRapidas from '../componentes/panel/AccionesRapidas';
import BarraLateral from '../componentes/panel/BarraLateral';
import EncabezadoPanel from '../componentes/panel/EncabezadoPanel';
import TarjetaIndicador from '../componentes/panel/TarjetaIndicador';
import TablaActividad from '../componentes/panel/TablaActividad';
import { PANELES_POR_PERFIL } from '../configuracion/panelesPorPerfil';
import { MODULOS_POR_PERFIL } from '../configuracion/modulosPorPerfil';
import DisenoPanel from '../disenos/DisenoPanel';

export default function PaginaPanel({ perfil, alCerrarSesion }) {
    const [moduloActivo, establecerModuloActivo] = useState('resumen');
    const configuracion = PANELES_POR_PERFIL[perfil] ?? PANELES_POR_PERFIL.alumno;
    const modulos = MODULOS_POR_PERFIL[perfil] ?? MODULOS_POR_PERFIL.alumno;
    const modulo = modulos.find((elemento) => elemento.id === moduloActivo) ?? modulos[0];

    useEffect(() => {
        establecerModuloActivo('resumen');
    }, [perfil]);

    return (
        <DisenoPanel barraLateral={
            <BarraLateral
                elementos={modulos}
                moduloActivo={modulo.id}
                alSeleccionar={establecerModuloActivo}
                etiquetaPerfil={configuracion.etiqueta}
            />
        }>
            {modulo.tipo === 'resumen' ? (
                <>
                    <EncabezadoPanel configuracion={configuracion} alCerrarSesion={alCerrarSesion} />
                    <main className="contenido-panel">
                        <section className="cuadricula-indicadores" aria-label="Indicadores principales">
                            {configuracion.indicadores.map((indicador) => <TarjetaIndicador indicador={indicador} key={indicador.id} />)}
                        </section>
                        <div className="contenido-panel__cuadricula">
                            <TablaActividad actividades={configuracion.actividades} />
                            <AccionesRapidas acciones={configuracion.accionesRapidas} />
                        </div>
                    </main>
                </>
            ) : (
                <VistaModulo modulo={modulo} perfil={configuracion.etiqueta} />
            )}
        </DisenoPanel>
    );
}
