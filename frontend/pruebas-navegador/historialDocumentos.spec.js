import { test, expect, ingresar, crearHistoria, escribirConCsrf } from './ayudas.js';

for (const tema of ['claro', 'oscuro']) {
    for (const ancho of [1119, 390]) {
        test(`historial de documentos legible en tema ${tema} a ${ancho}px`, async ({ page }, informacion) => {
            await page.addInitScript(valor => localStorage.setItem('undac:tema', valor), tema);
            await page.setViewportSize({ width: ancho, height: ancho === 390 ? 844 : 668 });
            await ingresar(page);
            const historia = await crearHistoria(page);
            const abrir = page.getByRole('button', { name: 'Historial de documentos', exact: true });
            await abrir.click();
            const modal = page.getByRole('dialog', { name: 'Historial de documentos', exact: true });
            await expect(modal.getByText('Cargando versiones…')).toHaveCount(0);
            const listado = await page.request.get(`/api/historias/${historia.id}/versiones`);
            expect(listado.status()).toBe(200);
            if (!(await listado.json()).data.length) {
                await expect(modal.getByRole('heading', { name: 'Aún no hay versiones conservadas' })).toBeVisible();
                await expect(modal.getByRole('table')).toHaveCount(0);
                await informacion.attach('historial-vacio', { body: await modal.screenshot(), contentType: 'image/png' });
            }
            await page.keyboard.press('Escape');
            await expect(modal).toHaveCount(0);
            await expect(abrir).toBeFocused();

            const guardado = await escribirConCsrf(page, `/api/historias/${historia.id}/expediente`, {
                formData: { anamnesis: { motivoConsulta: 'Control sintético para revisión visual', historiaEnfermedad: 'Datos exclusivos del entorno aislado' } },
            });
            expect(guardado.status()).toBe(200);
            await abrir.click();
            await expect(modal.getByRole('button', { name: /Consultar versión/ }).first()).toBeVisible();
            await informacion.attach('historial-versiones', { body: await modal.screenshot(), contentType: 'image/png' });
            await modal.getByRole('button', { name: /Consultar versión/ }).first().click();
            await expect(modal.getByText('Integridad de esta versión comprobada.')).toBeVisible();
            await expect(modal.getByRole('heading', { name: 'Detalle de la versión' })).toBeVisible();
            await expect(modal.getByRole('link', { name: 'Descargar expediente con versiones y adjuntos' })).toHaveAttribute('href', `/api/historias/${historia.id}/exportacion-completa`);
            const dimensiones = await modal.evaluate(elemento => ({
                ancho: elemento.getBoundingClientRect().width,
                alto: elemento.getBoundingClientRect().height,
                disponibleAncho: window.innerWidth,
                disponibleAlto: window.innerHeight,
                desborda: elemento.scrollWidth > elemento.clientWidth,
            }));
            expect(dimensiones.ancho).toBeLessThanOrEqual(dimensiones.disponibleAncho);
            expect(dimensiones.alto).toBeLessThanOrEqual(dimensiones.disponibleAlto);
            expect(dimensiones.desborda).toBe(false);
            await informacion.attach('historial-detalle', { body: await modal.screenshot(), contentType: 'image/png' });
            await modal.getByRole('button', { name: 'Volver a las versiones' }).click();
            await expect(modal.getByRole('button', { name: /Consultar versión/ }).first()).toBeVisible();
            await modal.getByRole('button', { name: 'Cerrar', exact: true }).click();
            await expect(modal).toHaveCount(0);
        });
    }
}
