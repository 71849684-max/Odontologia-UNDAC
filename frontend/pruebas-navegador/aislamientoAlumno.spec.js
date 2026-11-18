import { test, expect, ingresar, crearHistoria } from './ayudas.js';

test('otro alumno no puede abrir ni consultar el expediente ajeno', async ({ page, browser }) => {
    await ingresar(page);
    const historia = await crearHistoria(page);
    const contexto = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try {
        const otra = await contexto.newPage();
        await ingresar(otra, 'alumnoB');
        for (const sufijo of ['', '/expediente']) {
            expect((await otra.request.get(`/api/historias/${historia.id}${sufijo}`)).status()).toBe(404);
        }
        await otra.goto(`/#/historia-clinica?historia=${historia.id}`);
        await expect(otra.getByText(historia.documento, { exact: true })).toHaveCount(0);
        const lista = await (await otra.request.get(`/api/historias?q=${historia.documento}`)).json();
        expect(lista.data).toEqual([]);
    } finally { await contexto.close(); }
});
