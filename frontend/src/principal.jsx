import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Aplicacion from './aplicacion/Aplicacion';
import './css/app.css';

const raiz = document.getElementById('odontologia-app');

createRoot(raiz).render(
    <StrictMode>
        <Aplicacion />
    </StrictMode>,
);
