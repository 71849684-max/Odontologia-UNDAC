import {
    BookOpenCheck,
    CalendarClock,
    ClipboardCheck,
    FileClock,
    LayoutDashboard,
    Settings,
    Stethoscope,
    Users,
} from 'lucide-react';
import MarcaInstitucional from '../interfaz/MarcaInstitucional';

const ICONOS = {
    alumnos: Users,
    auditoria: FileClock,
    configuracion: Settings,
    historias: ClipboardCheck,
    pacientes: Stethoscope,
    recursos: BookOpenCheck,
    resumen: LayoutDashboard,
    seguimientos: CalendarClock,
    usuarios: Users,
    validaciones: ClipboardCheck,
};

export default function BarraLateral({ elementos = [], moduloActivo, alSeleccionar, etiquetaPerfil, onItemSelected }) {
    return (
        <aside className="barra-lateral">
            <MarcaInstitucional compacta inversa />
            <div className="barra-lateral__contexto"><span>Portal clínico</span><strong>{etiquetaPerfil}</strong></div>
            <nav aria-label="Navegación principal">
                <p>Gestión</p>
                <ul>
                    {elementos.map((elemento) => {
                        const Icono = ICONOS[elemento.icono] ?? LayoutDashboard;
                        const estaActivo = moduloActivo === elemento.id;
                        return (
                        <li key={elemento.id}>
                            <button
                                type="button"
                                className={estaActivo ? 'esta-activo' : ''}
                                aria-current={estaActivo ? 'page' : undefined}
                                onClick={() => { alSeleccionar(elemento.id); onItemSelected?.(); }}
                            >
                                <Icono size={18} aria-hidden="true" /><span>{elemento.etiqueta}</span>
                            </button>
                        </li>
                    );})}
                </ul>
            </nav>
            <div className="barra-lateral__ayuda"><span aria-hidden="true">?</span><div><strong>Centro de ayuda</strong><small>Soporte institucional</small></div></div>
        </aside>
    );
}
