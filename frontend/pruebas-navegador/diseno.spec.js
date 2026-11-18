import AxeBuilder from '@axe-core/playwright';
import { test, expect, ingresar, crearHistoria } from './ayudas.js';

for (const tema of ['claro', 'oscuro']) {
    for (const [ancho, alto] of [[1280, 800], [768, 1024], [390, 844]]) {
        test(`modal, teclado y contraste en tema ${tema} a ${ancho}×${alto}`, async ({ page }, informacion) => {
            await page.setViewportSize({ width: ancho, height: alto });
            await page.addInitScript(valor => localStorage.setItem('undac:tema', valor), tema);
            await ingresar(page, 'administrador');
            await page.goto('/#/cursos');
            await page.getByRole('button', { name: 'Nuevo curso', exact: true }).click();
            const dialogo = page.getByRole('dialog', { name: 'Nuevo curso' });
            await dialogo.getByLabel('Código', { exact: true }).fill('VISUAL');
            await expect(dialogo).toBeVisible();
            const auditoria = await new AxeBuilder({ page }).withRules(['color-contrast', 'label', 'button-name', 'aria-valid-attr-value']).analyze();
            await informacion.attach('accesibilidad', { body: JSON.stringify(auditoria.violations, null, 2), contentType: 'application/json' });
            expect(auditoria.violations.map(fallo => ({ regla: fallo.id, nodos: fallo.nodes.map(nodo => ({ objetivo: nodo.target, detalle: nodo.failureSummary })) }))).toEqual([]);
            await page.evaluate(() => document.fonts.ready);
            await expect(dialogo).toHaveScreenshot(`modal-${tema}-${ancho}.png`, { animations: 'disabled', maxDiffPixelRatio: 0.01 });
            await informacion.attach(`modal-${tema}-${ancho}`, { body: await dialogo.screenshot({ animations: 'disabled' }), contentType: 'image/png' });
            await page.keyboard.press('Escape');
            await expect(dialogo).toHaveCount(0);
            await expect(page.getByRole('button', { name: 'Nuevo curso', exact: true })).toBeFocused();
        });
    }
}

test('panel móvil clínico respeta foco, fondo y cierre con Escape', async ({ page }, informacion) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ingresar(page);
    await crearHistoria(page);
    const boton = page.getByRole('button', { name: /^(Mostrar|Ocultar) momentos clínicos$/ });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.clinical-workspace__main')).toHaveAttribute('inert', '');
    await informacion.attach('panel-clinico-movil', { body: await page.screenshot(), contentType: 'image/png' });
    await page.keyboard.press('Escape');
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
    await expect(boton).toBeFocused();
    await page.getByRole('button', { name: 'Imprimir', exact: true }).click();
    await expect(page.getByRole('dialog', { name: /Vista previa de impresión/ })).toBeVisible();
    await page.emulateMedia({ media: 'print' });
    await page.setViewportSize({ width: 794, height: 1123 });
    await informacion.attach('impresion', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
