import { test, expect, ingresar, crearHistoria } from './ayudas.js';

for (const tema of ['claro', 'oscuro']) {
    test(`odontograma conserva selección gris y 52 posiciones en tema ${tema}`, async ({ page }, informacion) => {
        await page.addInitScript(valor => localStorage.setItem('undac:tema', valor), tema);
        await ingresar(page);
        const historia = await crearHistoria(page);
        await page.goto(`/#/historia-clinica?historia=${historia.id}&seccion=odontograma`);
        await expect(page.getByRole('heading', { name: 'Odontograma digital', exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Mixta', exact: true }).click();
        await expect(page.locator('.nts-tooth')).toHaveCount(52);
        const pieza = page.getByRole('button', { name: 'Seleccionar pieza 16', exact: true });
        await pieza.click();
        await expect(pieza).toHaveAttribute('aria-pressed', 'true');
        const colores = await pieza.evaluate(elemento => ({
            seleccionado: getComputedStyle(elemento).backgroundColor,
            papel: getComputedStyle(elemento.closest('.nts-chart-scroll')).backgroundColor,
        }));
        expect(colores).toEqual({ seleccionado: 'rgb(71, 85, 105)', papel: 'rgb(255, 255, 255)' });
        await informacion.attach(`odontograma-${tema}`, { body: await page.locator('.nts-chart-scroll').screenshot(), contentType: 'image/png' });
    });
}
