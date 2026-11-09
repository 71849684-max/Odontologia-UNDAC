import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function BotonTema() {
    const [oscuro, establecerOscuro] = useState(() => document.documentElement.dataset.tema === 'oscuro');
    function cambiar() {
        const siguiente = !oscuro;
        establecerOscuro(siguiente);
        document.documentElement.dataset.tema = siguiente ? 'oscuro' : 'claro';
        try { localStorage.setItem('undac:tema', siguiente ? 'oscuro' : 'claro'); } catch { /* La selección continúa en esta sesión. */ }
    }
    return <button type="button" className="hc-mini-button" aria-label={oscuro ? 'Activar tema claro' : 'Activar tema oscuro'} onClick={cambiar}>
        {oscuro ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>;
}
