import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        react(),
        tailwindcss(),
    ],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./resources/js/aplicacion/pruebas/setup.js'],
        css: true,
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
