import { defineConfig, mergeConfig } from 'vite';
import configuracion from './vite.config.js';

const proxy = { '/api': process.env.PRUEBAS_API_URL ?? 'http://127.0.0.1:8011' };
export default mergeConfig(configuracion, defineConfig({
    server: { host: '127.0.0.1', port: 5183, strictPort: true, proxy },
    preview: { host: '127.0.0.1', port: 5183, strictPort: true, proxy },
}));
