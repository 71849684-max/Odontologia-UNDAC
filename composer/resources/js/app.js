import { createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Aplicacion from './aplicacion/Aplicacion';

const root = document.getElementById('odontologia-app');

if (root) {
    createRoot(root).render(createElement(StrictMode, null, createElement(Aplicacion)));
}
