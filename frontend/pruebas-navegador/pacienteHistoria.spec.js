import { test, expect, ingresar, crearHistoria, completarAnamnesis } from './ayudas.js';

test('registra paciente e historia por interfaz y recupera sus datos en otra sesión', async ({ page, browser }) => {
    await ingresar(page);
    const historia = await crearHistoria(page);
    const texto = `Motivo sintético ${historia.documento}`;
    await completarAnamnesis(page, historia, texto);
    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Motivo de consulta', exact: true })).toHaveValue(texto);
    const contexto = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try {
        const otra = await contexto.newPage();
        await ingresar(otra);
        await otra.goto(`/#/historia-clinica?historia=${historia.id}&seccion=anamnesis`);
        await expect(otra.getByRole('textbox', { name: 'Motivo de consulta', exact: true })).toHaveValue(texto);
        const expediente = await (await otra.request.get(`/api/historias/${historia.id}/expediente`)).json();
        expect(expediente.paciente.dni).toBe(historia.documento);
    } finally { await contexto.close(); }
});
