import { test, expect, ingresar, crearHistoria, escribirConCsrf, manifiesto } from './ayudas.js';

test('auditoría identifica quién aprobó o reabrió y la sección afectada', async ({ page, browser }) => {
    await ingresar(page);
    const historia = await crearHistoria(page);
    expect((await escribirConCsrf(page, `/api/historias/${historia.id}/asignacion`, { personal: `DOCENTE-${manifiesto.actores.docente.actor}` })).status()).toBe(200);
    const formulario = { anamnesis: { motivoConsulta: 'Control sintético de auditoría', historiaEnfermedad: 'Registro de prueba' } };
    expect((await escribirConCsrf(page, `/api/historias/${historia.id}/expediente`, { formData: formulario, sectionStatus: { anamnesis: 'review' } })).status()).toBe(200);
    await page.goto('/#/historias');
    const profesional = await browser.newContext({ baseURL: new URL(page.url()).origin });
    const administracion = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try {
        const docente = await profesional.newPage();
        await ingresar(docente, 'docente');
        expect((await escribirConCsrf(docente, `/api/historias/${historia.id}/expediente`, { formData: formulario, sectionStatus: { anamnesis: 'approved' } })).status()).toBe(200);
        const administrador = await administracion.newPage();
        await ingresar(administrador, 'administrador');
        await administrador.goto('/#/auditoria');
        await administrador.getByRole('tab', { name: 'Acciones en historias' }).click();
        await administrador.getByRole('textbox', { name: 'Buscar evento' }).fill(historia.codigo);
        const aprobacion = administrador.getByRole('row').filter({ hasText: 'Aprobar sección' }).filter({ hasText: historia.codigo });
        await expect(aprobacion).toHaveCount(1);
        await expect(aprobacion).toContainText(manifiesto.actores.docente.usuario);
        await expect(aprobacion).toContainText('Anamnesis y enfermedad actual');
        expect((await escribirConCsrf(administrador, `/api/historias/${historia.id}/expediente`, { formData: formulario, sectionStatus: { anamnesis: 'in-progress' }, motivo: 'Corregir la información de la entrevista'  })).status()).toBe(200);
        await administrador.reload();
        await administrador.getByRole('tab', { name: 'Acciones en historias' }).click();
        await administrador.getByRole('textbox', { name: 'Buscar evento' }).fill(historia.codigo);
        const reapertura = administrador.getByRole('row').filter({ hasText: 'Reabrir sección para corregirla' }).filter({ hasText: historia.codigo });
        await expect(reapertura).toHaveCount(1);
        await expect(reapertura).toContainText(manifiesto.actores.administrador.usuario);
        await expect(reapertura).toContainText('Anamnesis y enfermedad actual');
        await reapertura.getByRole('button', { name: 'Ver más' }).click();
        const detalle = administrador.getByRole('dialog', { name: 'Detalle de la acción' });
        await expect(detalle).toContainText('Sección / submódulo');
        await expect(detalle).toContainText('Anamnesis y enfermedad actual');
        await expect(detalle).toContainText('En progreso');
    } finally {
        await profesional.close();
        await administracion.close();
    }
});
