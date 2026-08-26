import { LoaderCircle } from 'lucide-react';

export default function EstadoCarga({ mensaje = 'Cargando información' }) {
    return (
        <div className="estado-visual" role="status" aria-live="polite">
            <LoaderCircle className="estado-visual__giro" size={30} aria-hidden="true" />
            <strong>{mensaje}</strong>
            <p>Estamos preparando la información clínica para ti.</p>
        </div>
    );
}
