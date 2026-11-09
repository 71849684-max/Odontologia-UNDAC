import { test, expect, ingresar, crearHistoria, completarAnamnesis, cambiarEstado, escribirConCsrf } from './ayudas.js';

test('docente observa, alumno corrige y la validación impide modificaciones posteriores', async ({ page, browser }) => {
    // Incluye dos sesiones, cinco transiciones y la verificación posterior.
    test.setTimeout(120000);
    await ingresar(page);
    const historia = await crearHistoria(page);
    await completarAnamnesis(page, historia, 'Motivo inicial sintético');
    await cambiarEstado(page, historia, 'Enviar a revisión', 'PENDIENTE_REVISION');
    const contexto = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try {
        const docente = await contexto.newPage();
        await ingresar(docente, 'docente');
        await cambiarEstado(docente, historia, 'Observar', 'OBSERVADA', 'Precise el motivo de consulta sintético.');
        await completarAnamnesis(page, historia, 'Motivo corregido sintético');
        await cambiarEstado(page, historia, 'Enviar a revisión', 'PENDIENTE_REVISION');
        await cambiarEstado(docente, historia, 'Validar', 'VALIDADA');
        const respuesta = await escribirConCsrf(page, `/api/historias/${historia.id}/expediente`, { formData: { anamnesis: { motivoConsulta: 'Cambio prohibido' } } });
        expect(respuesta.status()).toBe(409);
        const expediente = await (await page.request.get(`/api/historias/${historia.id}/expediente`)).json();
        expect(expediente.formData.anamnesis.motivoConsulta).toBe('Motivo corregido sintético');
    } finally { await contexto.close(); }
});
