import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Aplicacion from './aplicacion/Aplicacion';
import { ProveedorSesion } from './aplicacion/autenticacion/ContextoSesion';
import './css/app.css';

const raiz = document.getElementById('odontologia-app');

let tema;
try { tema = localStorage.getItem('undac:tema'); } catch { /* Usar la preferencia del sistema. */ }
document.documentElement.dataset.tema = ['claro', 'oscuro'].includes(tema)
    ? tema : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';

createRoot(raiz).render(
    <StrictMode>
        <ProveedorSesion>
            <Aplicacion />
        </ProveedorSesion>
    </StrictMode>,
);
