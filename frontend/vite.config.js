import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/aplicacion/pruebas/setup.js'],
        css: true,
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        proxy: {
            '/api': 'http://127.0.0.1:8000',
        },
    },
});
