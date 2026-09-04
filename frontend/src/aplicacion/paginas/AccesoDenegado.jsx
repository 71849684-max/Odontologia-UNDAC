import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function AccesoDenegado({ onNavigate }) {
    return (
        <div className="hc-page space-y-5">
            <section className="estado-visual" aria-label="Acceso denegado">
                <ShieldAlert size={30} aria-hidden="true" />
                <strong>Acceso denegado</strong>
                <p>Tu rol institucional no tiene permitido el módulo de administración.</p>
            </section>
            <button type="button" className="hc-button hc-button--primary" onClick={() => onNavigate?.('inicio')}>
                <ArrowLeft size={17} /> Volver al inicio
            </button>
        </div>
    );
}
