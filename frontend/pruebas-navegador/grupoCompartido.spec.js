import { test, expect, ingresar } from './ayudas.js';

test('un grupo creado en la interfaz aparece en una sesión independiente', async ({ page, browser }) => {
    await ingresar(page, 'administrador');
    await page.goto('/#/grupos-academicos');
    await page.getByRole('button', { name: 'Nuevo grupo', exact: true }).click();
    const codigo = `NAV-${Date.now()}`;
    await page.getByLabel('Código del grupo').fill(codigo);
    await page.getByLabel('Nombre del grupo').fill('Grupo sintético compartido');
    await page.getByLabel('Semestre', { exact: true }).fill('VIII');
    const respuesta = page.waitForResponse(r => r.url().endsWith('/api/academico/grupos') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Guardar grupo', exact: true }).click();
    const recibido = await respuesta;
    expect(recibido.status()).toBe(201);
    const grupo = await recibido.json();
    const contexto = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try {
        const otra = await contexto.newPage();
        await ingresar(otra, 'administradorB');
        await otra.goto('/#/grupos-academicos');
        await otra.getByPlaceholder('Buscar grupo...').fill(codigo);
        await expect(otra.getByText(codigo, { exact: true })).toBeVisible();
        const estado = await (await otra.request.get('/api/academico')).json();
        expect(estado.grupos.find(item => item.id === grupo.id)).toMatchObject({ codigo, nombre: 'Grupo sintético compartido' });
    } finally { await contexto.close(); }
});
