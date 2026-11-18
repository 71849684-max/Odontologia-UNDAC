import { test, expect, ingresar, crearHistoria } from './ayudas.js';

test('mide la apertura clínica con datos reales y un contexto sin módulos clínicos cargados', async ({ page, browser }, informacion) => {
    await ingresar(page);
    const historia = await crearHistoria(page);
    const contexto = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try {
        const otra = await contexto.newPage();
        const comienzoAcceso = Date.now();
        await otra.goto('/');
        await expect(otra.getByRole('textbox', { name: 'Usuario', exact: true })).toBeVisible();
        const accesoMs = Date.now() - comienzoAcceso;
        const comienzoIngreso = Date.now();
        await ingresar(otra);
        const ingresoMs = Date.now() - comienzoIngreso;
        const comienzoHistoria = Date.now();
        await otra.goto(`/#/historia-clinica?historia=${historia.id}&seccion=anamnesis`);
        await expect(otra.getByRole('textbox', { name: 'Motivo de consulta', exact: true })).toBeEnabled();
        const historiaMs = Date.now() - comienzoHistoria;
        await informacion.attach('tiempos-apertura', { body: JSON.stringify({ accesoMs, ingresoMs, historiaMs, contexto: 'Local, sin limitación de red; no acredita el equipo clínico de referencia.' }), contentType: 'application/json' });
        expect(historiaMs).toBeLessThan(Number(process.env.PRUEBAS_APERTURA_MS || 4000));
    } finally { await contexto.close(); }
});
