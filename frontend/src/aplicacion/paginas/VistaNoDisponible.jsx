import { ArrowLeft } from 'lucide-react';
import EstadoVacio from '../componentes/interfaz/EstadoVacio';

export default function VistaNoDisponible({ onNavigate }) {
    return <div className="hc-page space-y-5"><EstadoVacio titulo="Vista no disponible" descripcion="Esta opción todavía no está asociada a una vista del frontend." /><button type="button" className="hc-button hc-button--primary" onClick={() => onNavigate?.('inicio')}><ArrowLeft size={17} /> Volver al inicio</button></div>;
}
