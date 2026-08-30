import { ArrowUpRight, ClipboardCheck, Clock3, UserRoundCheck } from 'lucide-react';

const ICONOS_POR_TONO = { clinico: UserRoundCheck, academico: Clock3, neutro: ClipboardCheck };

export default function TarjetaIndicador({ indicador }) {
    const Icono = ICONOS_POR_TONO[indicador.tono] ?? ClipboardCheck;
    return (
        <article className={`tarjeta-indicador tarjeta-indicador--${indicador.tono}`}>
            <div className="tarjeta-indicador__superior"><span className="tarjeta-indicador__icono" aria-hidden="true"><Icono size={20} /></span><ArrowUpRight size={17} aria-hidden="true" /></div>
            <strong>{indicador.valor}</strong><p>{indicador.etiqueta}</p>
        </article>
    );
}
