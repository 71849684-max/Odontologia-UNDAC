import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Aplicacion from './aplicacion/Aplicacion';
import { ProveedorSesion } from './aplicacion/autenticacion/ContextoSesion';
import './css/app.css';

const raiz = document.getElementById('odontologia-app');

createRoot(raiz).render(
    <StrictMode>
        <ProveedorSesion>
            <Aplicacion />
        </ProveedorSesion>
    </StrictMode>,
);
