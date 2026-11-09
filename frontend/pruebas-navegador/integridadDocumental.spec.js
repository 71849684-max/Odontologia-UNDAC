import { test, expect, ingresar, crearHistoria, escribirConCsrf, manifiesto } from './ayudas.js';

test('reabrir conserva la versión aprobada y registra el motivo desde la interfaz', async ({ page, browser }) => {
    await ingresar(page);
    const historia = await crearHistoria(page);
    expect((await escribirConCsrf(page, `/api/historias/${historia.id}/asignacion`, { personal: `DOCENTE-${manifiesto.actores.docente.actor}` })).status()).toBe(200);
    expect((await escribirConCsrf(page, `/api/historias/${historia.id}/expediente`, { formData: { anamnesis: { motivoConsulta: 'Texto original aprobado', historiaEnfermedad: 'Información sintética' } }, sectionStatus: { anamnesis: 'review' } })).status()).toBe(200);
    const sesion = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try {
        const profesional = await sesion.newPage();
        await ingresar(profesional, 'docente');
        await profesional.goto(`/#/historia-clinica?historia=${historia.id}&seccion=anamnesis`);
        await expect(profesional.getByRole('textbox', { name: 'Motivo de consulta', exact: true })).toHaveValue('Texto original aprobado');
        await profesional.getByRole('button', { name: 'Aprobar sección', exact: true }).click();
        await expect.poll(async () => (await (await profesional.request.get(`/api/historias/${historia.id}/expediente`)).json()).sectionStatus.anamnesis).toBe('approved');
        await expect(profesional.getByRole('textbox', { name: 'Motivo de consulta', exact: true })).toBeDisabled();
        await profesional.getByRole('button', { name: 'Reabrir sección', exact: true }).click();
        const dialogo = profesional.getByRole('dialog', { name: 'Reabrir sección para corregir' });
        await expect(dialogo.getByRole('button', { name: 'Reabrir y conservar el original' })).toBeDisabled();
        await dialogo.getByLabel('Motivo de la rectificación').fill('Corregir un dato identificado en la entrevista');
        await dialogo.getByRole('button', { name: 'Reabrir y conservar el original' }).click();
        await expect.poll(async () => (await (await profesional.request.get(`/api/historias/${historia.id}/expediente`)).json()).sectionStatus.anamnesis).toBe('in-progress');
        await profesional.getByRole('textbox', { name: 'Motivo de consulta', exact: true }).fill('Texto rectificado');
        await expect.poll(async () => (await (await profesional.request.get(`/api/historias/${historia.id}/expediente`)).json()).formData.anamnesis.motivoConsulta).toBe('Texto rectificado');
        await profesional.getByRole('button', { name: 'Historial de documentos' }).click();
        await expect(profesional.getByRole('dialog', { name: 'Historial de documentos' })).toBeVisible();
        const versiones = (await (await profesional.request.get(`/api/historias/${historia.id}/versiones`)).json()).data;
        expect(versiones.some(version => version.motivo === 'Corregir un dato identificado en la entrevista')).toBe(true);
        const contenidos = await Promise.all(versiones.map(async version => (await profesional.request.get(`/api/historias/${historia.id}/versiones/${version.id_version}`)).json()));
        expect(contenidos.every(version => version.integridadVerificada)).toBe(true);
        expect(contenidos.some(version => version.contenido.formData?.anamnesis?.motivoConsulta === 'Texto original aprobado' && version.contenido.sectionStatus?.anamnesis === 'approved')).toBe(true);
    } finally { await sesion.close(); }
});

test('odontograma usa el servidor, conserva copias antiguas sin importarlas y respeta el área impresa', async ({ page }) => {
    await ingresar(page);
    const historia = await crearHistoria(page);
    const clave = `undac:odontograma:nts188:v1:${historia.codigo}`;
    await page.evaluate(clave => localStorage.setItem(clave, '{copia heredada que no debe sincronizarse}'), clave);
    await page.goto(`/#/historia-clinica?historia=${historia.id}&seccion=odontograma`);
    await expect(page.getByRole('heading', { name: 'Odontograma digital', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Extracción programada', exact: true })).toHaveCount(0);
    await page.getByLabel('Observaciones', { exact: true }).fill('Evaluación sintética conservada en servidor');
    await expect.poll(async () => (await (await page.request.get(`/api/historias/${historia.id}/odontograma`)).json()).registro?.examinations?.[0]?.observations).toBe('Evaluación sintética conservada en servidor');
    expect(await page.evaluate(clave => localStorage.getItem(clave), clave)).toBe('{copia heredada que no debe sincronizarse}');
    await page.getByRole('button', { name: 'Imprimir', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Imprimir documento' })).toBeEnabled();
    await expect(page.locator('.doc-odontograma-pieza')).toHaveCount(52);
    await page.emulateMedia({ media: 'print' });
    const areas = await page.locator('.doc-odontograma-pieza svg').evaluateAll(elementos => elementos.map(svg => {
        const matriz = svg.querySelector('g').getScreenCTM();
        return 84 * 35 * Math.abs(matriz.a * matriz.d - matriz.b * matriz.c) * (25.4 / 96) ** 2;
    }));
    expect(Math.min(...areas)).toBeGreaterThanOrEqual(50);
});
