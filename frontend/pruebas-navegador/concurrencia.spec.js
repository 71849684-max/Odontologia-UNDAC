import { test, expect, ingresar, crearHistoria, escribirConCsrf } from './ayudas.js';

test('una revisión obsoleta es rechazada sin perder el cambio confirmado', async ({ page, browser }) => {
    await ingresar(page);
    const historia = await crearHistoria(page);
    const contexto = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try {
        const otra = await contexto.newPage();
        await ingresar(otra);
        const url = `/api/historias/${historia.id}/expediente`;
        const lectura = await (await page.request.get(url)).json();
        const lecturaOtra = await (await otra.request.get(url)).json();
        expect(lectura.revision).toBe(lecturaOtra.revision);
        const primera = await escribirConCsrf(page, url, { revision: lectura.revision, formData: { anamnesis: { motivoConsulta: 'Cambio confirmado' } } });
        expect(primera.status()).toBe(200);
        const obsoleta = await escribirConCsrf(otra, url, { revision: lecturaOtra.revision, formData: { anamnesis: { motivoConsulta: 'Cambio obsoleto' } } });
        expect(obsoleta.status()).toBe(422);
        expect((await obsoleta.json()).errors.revision).toBeTruthy();
        const final = await (await page.request.get(url)).json();
        expect(final.formData.anamnesis.motivoConsulta).toBe('Cambio confirmado');
    } finally { await contexto.close(); }
});
