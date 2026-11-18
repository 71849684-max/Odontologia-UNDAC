import { test, expect, ingresar } from './ayudas.js';

for (const tema of ['claro', 'oscuro']) {
    test(`muestra la carga en tema ${tema}, sin duplicar la consulta y respetando movimiento reducido`, async ({ page }, informacion) => {
        await ingresar(page, 'administrador');
        // Completar las consultas del panel antes de medir las del listado.
        await page.waitForLoadState('networkidle');
        await page.evaluate((valor) => {
            localStorage.setItem('undac:tema', valor);
            document.documentElement.dataset.tema = valor;
        }, tema);
        if (tema === 'oscuro') await page.setViewportSize({ width: 390, height: 844 });
        let liberar;
        const espera = new Promise((resolver) => { liberar = resolver; });
        let consultas = 0;
        await page.route('**/api/historias*', async (ruta) => {
            if (new URL(ruta.request().url()).pathname !== '/api/historias' || ruta.request().method() !== 'GET') return ruta.continue();
            consultas++;
            await espera;
            await ruta.continue(); // La respuesta procede de Laravel y de la base aislada.
        });
        try {
            await page.goto('/#/historias');
            const carga = page.getByRole('status').filter({ hasText: 'Cargando historias clínicas…' });
            await expect(carga).toBeVisible();
            const indicador = carga.locator('.estado-carga__indicador > span');
            await expect(indicador).toHaveCSS('animation-name', 'giro-carga');
            await informacion.attach(`carga-${tema}`, { body: await page.screenshot(), contentType: 'image/png' });
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await expect(indicador).toHaveCSS('animation-name', 'none');
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        } finally { liberar(); }
        await expect(page.getByText('Cargando historias clínicas…')).toHaveCount(0);
        // Tras completar y pasar el plazo de búsqueda no debe aparecer otra consulta inicial.
        await page.waitForTimeout(400);
        expect(consultas).toBe(1);
        await expect(page.getByRole('button', { name: 'Reintentar carga' })).toHaveCount(0);
    });
}
